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
    secret: "przemek",
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

//Add the creator to the user's following array
async function followUser(user, req) {
    if (!req.session.user) {
        throw new Error("User not authenticated");
    }

    // Check if user is trying to follow themselves
    if (user === req.session.user.username) {
        throw new Error("You cannot follow yourself");
    }

    await client.connect();
    const query = { username: req.session.user.username };
    
    const currentUser = await userCollection.findOne(query);
    if (!currentUser) {
        await client.close();
        throw new Error("User not found");
    }

    const newFollows = currentUser.follows || [];
    if (!newFollows.includes(user)) {
        newFollows.push(user);
        const updateDoc = {$set: {follows: newFollows}};
        const updateResults = await userCollection.updateOne(query, updateDoc);
        console.log('Follow update results:', updateResults);
    }
    
    await client.close();
    return "Successfully followed user";
}

async function unfollowUser(user, req) {
    if (!req.session.user) {
        throw new Error("User not authenticated");
    }

    await client.connect();
    const query = { username: req.session.user.username };
    
    const currentUser = await userCollection.findOne(query);
    if (!currentUser) {
        await client.close();
        throw new Error("User not found");
    }

    const newFollows = (currentUser.follows || []).filter(username => username !== user);
    
    const updateDoc = {$set: {follows: newFollows}};
    const updateResults = await userCollection.updateOne(query, updateDoc);
    console.log('Unfollow update results:', updateResults);
    
    await client.close();
    return "Successfully unfollowed user";
}

// Loading the page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
                timestamp: Date.now()
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
        req.session.destroy((err) => {
            if (err) {
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
        return res.status(401).json({ "message": "Must be logged in to post" });
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
app.get(`/${studentID}/following`, async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                status: "error",
                message: "User not authenticated"
            });
        }

        await client.connect();
        const query = { username: req.session.user.username };
        const results = await userCollection.findOne(query);
        
        if (!results) {
            await client.close();
            return res.status(404).json({
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
        console.error('Error in following route:', error);
        res.status(500).json({
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
        res.status(400).json({
            status: "error",
            message: error.message
        });
    }
});

app.delete(`/${studentID}/follow`, async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                status: "error",
                message: "User not authenticated"
            });
        }

        const result = await unfollowUser(req.body.user, req);
        res.json({
            status: "success",
            message: "Successfully unfollowed user"
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message
        });
    }
});

// Listen on port 8080
app.listen(8080, () => {
    console.log("Express listening on port 8080");
});
