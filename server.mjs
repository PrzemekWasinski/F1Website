import bodyParser from "body-parser";
import express from "express";
import path from "path";
import { MongoClient, ServerApiVersion } from "mongodb";
import session from "express-session";

const fileName = "server.mjs";
const studentID = "M00931085";
//App
const app = express();

app.use(session({
    secret: "cookie",
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, 
        maxAge: 24 * 60 * 60 * 1000 //24 hours
    }
}));

app.use(bodyParser.json());
app.use(express.static("public"));

// Connect to MongoDB
const connectionURI = "mongodb://127.0.0.1:27017?retryWrites=true&w=majority";

const client = new MongoClient(connectionURI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
    }
});

//MongoDB Details
const database = client.db("cst2120");
const userCollection = database.collection("users");
const postCollection = database.collection("content");


// MongoDB Functions
async function findUsername(username) {
    await client.connect(); 
    const query = { "username": username };
    const results = await userCollection.find(query).toArray();
    const team = results;
    await client.close();
    return team;
}

/////////////////////////FIND TEAM IS HERE//////////////////////////////
async function findTeam(username) {
    await client.connect();
    const query = { "username": username };
    const result = await userCollection.find(query).toArray();
    const userTeam = result[0]["team"];
    await client.close();
    return userTeam;
}

async function checkLogin(username, password) {
    await client.connect();
    const query = {$and: [{"username": username}, {"password": password}]};
    const results = await userCollection.find(query).toArray();
    await client.close();
    return results;
}

async function insertOne(userJSON) {
    await client.connect();
    await userCollection.insertOne(userJSON);
    await client.close();
}

async function getAllPosts() {
    await client.connect();
    const results = await postCollection.find({}).toArray();
    await client.close();
    return results;
}

async function createPost(postData) {
    await client.connect();
    await postCollection.insertOne(postData);
    await client.close();
}

async function followUser(user, req) {
    if (!req.session.user) {
        console.log("User error from: followUser()")
    }

    // Check if user is trying to follow themselves
    if (user === req.session.user.username) {
        console.log("You cannot follow yourself")
    }

    await client.connect();
    const query = { username: req.session.user.username };
    
    const currentUser = await userCollection.findOne(query);
    if (!currentUser) {
        await client.close();
        console.log("User not found")
    }

    const newFollows = currentUser.follows || [];
    if (!newFollows.includes(user)) {
        newFollows.push(user);
        const updateDoc = {$set: {follows: newFollows}};
        const updateResults = await userCollection.updateOne(query, updateDoc);
        console.log("Follow update results:", updateResults);
    }
    
    await client.close();
    return "Successfully followed user";
}

async function unfollowUser(user, req) {
    if (!req.session.user) {
        console.log("User error from unfollowUser()")
    }

    await client.connect();
    const query = { username: req.session.user.username };
    
    const currentUser = await userCollection.findOne(query);
    if (!currentUser) {
        await client.close();
        console.log("User not found")
    }

    const newFollows = (currentUser.follows || []).filter(username => username !== user);
    
    const updateDoc = {$set: {follows: newFollows}};
    const updateResults = await userCollection.updateOne(query, updateDoc);
    console.log("Unfollow update results:", updateResults);
    
    await client.close();
    return "Successfully unfollowed user";
}

// Loading the page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Get login status
app.get(`/${studentID}/login`, (req, res) => {
    if (req.session.user) {
        res.send({
            "status": "logged_in",
            "username": req.session.user.username,
            "message": "User is currently logged in"
        });
    } else {
        res.send({
            "status": "logged_out",
            "message": "No active session"
        });
    }
});

// Login
app.post(`/${studentID}/login`, async (req, res) => {
    try {
        const results = await checkLogin(req.body["username"], req.body["password"]);
        if (results.length > 0) {
            // Store user data in session
            req.session.user = {
                username: req.body["username"],
            };
            const result = await findTeam(req.body["username"]);
            res.send({
                "status": "success",
                "message": "Login successful",
                "username": req.session.user.username,
                "team": result
            });
        } else {
            res.send({
                "status": "error",
                "message": "Username or password incorrect"
            });
        }
    } catch (error) {
        console.log(`${error} (from ${fileName})`);
        res.send({
            "status": "error",
            "message": "Server error during login"
        });
    }
});

// Logout
app.delete(`/${studentID}/login`, (req, res) => {
    if (req.session.user) {
        req.session.destroy(function(error) {
            if (error) {
                res.send({
                    "status": "error",
                    "message": "Error during logout"
                });
            } else {
                res.send({
                    "status": "success",
                    "message": "Successfully logged out"
                });
            }
        });
    } else {
        res.send({
            "status": "error",
            "message": "No active session to logout"
        });
    }    
});

// Register
app.post(`/${studentID}/users`, async (req, res) => {
    try {
        const username = await findUsername(req.body["username"]);

        if (username.length > 0) {
            console.log(`Username: ${req.body["username"]} already exists (from ${fileName})`);
            res.send({"message": "Username already exists"});
        } else {
            await insertOne(req.body);
            console.log(`User: ${req.body["username"]} added to database (from ${fileName})`);
            res.send({"message": "User added successfully"});
        }
    } catch (error) {
        console.log(`${error} (from ${fileName})`);
        res.send({"message": "Server error"});
    }
});

//UPLOADS????????????????????????????????????????????????????????????????????
app.get(`/${studentID}/contents`, async (req, res) => {
    try {
        const posts = await getAllPosts();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ "message": "Error fetching posts" });
    }
});

app.post(`/${studentID}/contents`, async (req, res) => {
    if (!req.session.user) {
        return res.json({ "message": "Must be logged in to post" });
    }
    try {
        const postData = {
            username: req.session.user.username,
            title: req.body.title,
            description: req.body.description
        };
        await createPost(postData);
        res.json({ "message": "Post created successfully" });
    } catch (error) {
        res.status(500).json({ "message": "Error creating post" });
    }
});

//Get follow requests and follow the correct user
app.get(`/${studentID}/follow/:username`, async (req, res) => {
    try {
        if (!req.session.user) {
            return res.json({
                status: "error",
                message: "User not authenticated"
            });
        }

        await client.connect();
        const query = { username: req.session.user.username };
        const results = await userCollection.findOne(query);
        
        if (!results) {
            await client.close();
            return res.json({
                status: "error",
                message: "User not found"
            });
        }

        await client.close();
        res.json({
            status: "success",
            following: results.follows || []
        });
    } catch (error) {
        console.error("Error in following route:", error);
        res.json({
            status: "error",
            message: error.message
        });
    }
});

app.post(`/${studentID}/follow`, async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                status: "error",
                message: "User not authenticated"
            });
        }

        const result = await followUser(req.body.user, req);
        console.log(result)
        res.json({
            status: "success",
            message: "Successfully followed user"
        });
    } catch (error) {
        res.json({
            status: "error",
            message: error.message
        });
    }
});

app.delete(`/${studentID}/follow`, async (req, res) => {
    try {
        if (!req.session.user) {
            return res.json({
                status: "error",
                message: "User not authenticated"
            });
        }

        const result = await unfollowUser(req.body.user, req);
        console.log(result)
        res.json({
            status: "success",
            message: "Successfully unfollowed user"
        });
    } catch (error) {
        res.json({
            status: "error",
            message: error.message
        });
    }
});

// Search endpoint
app.get("/:studentid/contents/search", async (req, res) => {
    await client.connect();
    try {
        console.log("Search request received:", {
            studentId: req.params.studentid,
            query: req.query.q
        });

        const searchQuery = req.query.q;
        
        if (!searchQuery) {
            return res.json({ error: "Search query is required" });
        }

        console.log("Executing search with query:", searchQuery);

        // Modified search query to be more specific and prevent duplicates
        const posts = await postCollection.aggregate([
            {
                $match: {
                    $text: { $search: searchQuery }
                }
            },
            {
                $addFields: {
                    score: { $meta: "textScore" }
                }
            },
            {
                $match: {
                    score: { $gt: 0.5 } // Adjust this threshold as needed
                }
            },
            {
                $sort: {
                    score: { $meta: "textScore" }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    title: { $first: "$title" },
                    description: { $first: "$description" },
                    username: { $first: "$username" },
                    score: { $first: "$score" }
                }
            }
        ]).toArray();

        console.log(`Found ${posts.length} matching posts`);

        res.json(posts);
        await client.close();
    } catch (error) {
        console.error("Server error during search:", error);
        res.json({ 
            error: "Internal server error",
            details: error.message 
        });
        await client.close();
    }
});

// Make sure to create the text index when your server starts
app.get("/:studentID/users/search", async (req, res) => {
    await client.connect();
    try {
        const searchTerm = req.query.term;
        const studentID = req.params.studentID;
        
        console.log("Search request received:", { studentID, searchTerm }); // Debug log

        if (!searchTerm) {
            console.log("No search term provided");
            return res.json({ error: "Search term is required" });
        }

        // Check if collection is accessible
        if (!userCollection) {
            console.error("User collection not accessible");
            return res.json({ error: "Database collection error" });
        }

        const users = await userCollection.find({
            username: { $regex: searchTerm, $options: "i" }
        }).project({
            username: 1,
            team: 1,
            _id: 0
        }).limit(10).toArray();

        console.log("Search results:", users); // Debug log

        res.json(users);
        await client.close();
    } catch (error) {
        console.error("Detailed search error:", error);
        res.json({ 
            error: "Internal server error", 
            details: error.message 
        });
        await client.close();
    }
});

app.get("/:studentID/users/:username/posts", async (req, res) => {
    await client.connect();
    try {
        const username = req.params.username;
        
        const posts = await postCollection.find({ 
            username: username 
        }).toArray();

        res.json({
            status: "success",
            posts: posts
        });
        await client.close();
    } catch (error) {
        console.error("Error fetching user posts:", error);
        res.json({
            status: "error",
            message: error.message
        });
        await client.close();
    }
});

// Listen on port 8080
app.listen(8080, () => {
    console.log("Express listening on port 8080");
});
