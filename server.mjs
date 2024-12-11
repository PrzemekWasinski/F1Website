import bodyParser from "body-parser";
import express from "express";
import path from "path";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import session from "express-session";
import fileUpload from "express-fileupload";

const fileName = "server.mjs";
const studentID = "M00931085";

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session middleware
app.use(session({
    secret: "cookie",
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, 
        maxAge: 24 * 60 * 60 * 1000 //24 hours
    }
}));

// File upload middleware
app.use(fileUpload({
    createParentPath: true
}));

// Static files middleware
app.use(express.static("public"));

// MongoDB Connection Setup
const connectionURI = "mongodb://127.0.0.1:27017?retryWrites=true&w=majority";

const client = new MongoClient(connectionURI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
    }
});

// MongoDB Details
let database;
let userCollection;
let postCollection;

async function connectToMongo() {
    if (!client.topology || !client.topology.isConnected()) {
        try {
            await client.connect();
            database = client.db("cst2120");
            userCollection = database.collection("users");
            postCollection = database.collection("content");
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('MongoDB connection error:', error);
            throw error;
        }
    }
    return { database, userCollection, postCollection };
}

// Middleware to ensure database connection
app.use(async (req, res, next) => {
    try {
        await connectToMongo();
        next();
    } catch (error) {
        console.error('Database connection middleware error:', error);
        res.status(500).json({ error: 'Database connection error' });
    }
});


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
// Add these endpoints to your Express server

// Like a post

app.post('/:studentId/contents/:postId/like', async (req, res) => {
    try {
        const { studentId, postId } = req.params;
        const { username } = req.body;

        console.log('Like request:', { studentId, postId, username });

        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        await connectToMongo();

        if (!ObjectId.isValid(postId)) {
            return res.status(400).json({ error: 'Invalid post ID format' });
        }

        // Find the post first
        const post = await postCollection.findOne({ _id: new ObjectId(postId) });
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Convert existing likes to array if it's a string or initialize if it doesn't exist
        let currentLikes = [];
        if (post.likes) {
            currentLikes = Array.isArray(post.likes) ? post.likes : [];
        }

        // First, update the post to ensure likes is an array
        await postCollection.updateOne(
            { _id: new ObjectId(postId) },
            { $set: { likes: currentLikes } }
        );

        const userLikedIndex = currentLikes.indexOf(username);
        let updatedLikes;
        
        if (userLikedIndex === -1) {
            // Add like
            updatedLikes = [...currentLikes, username];
            await postCollection.updateOne(
                { _id: new ObjectId(postId) },
                { $set: { likes: updatedLikes } }
            );
            res.json({ message: 'Post liked', liked: true, likes: updatedLikes });
        } else {
            // Remove like
            updatedLikes = currentLikes.filter(user => user !== username);
            await postCollection.updateOne(
                { _id: new ObjectId(postId) },
                { $set: { likes: updatedLikes } }
            );
            res.json({ message: 'Post unliked', liked: false, likes: updatedLikes });
        }

    } catch (error) {
        console.error('Error in like/unlike:', error);
        res.status(500).json({ 
            error: 'Failed to process like/unlike',
            message: error.message 
        });
    }
});

app.post('/:studentId/contents/:postId/comment', async (req, res) => {
    try {
        const { studentId, postId } = req.params;
        const { username, comment } = req.body;

        await connectToMongo();

        if (!comment || !username) {
            return res.status(400).json({ error: 'Comment and username are required' });
        }

        // Find the post first
        const post = await postCollection.findOne({ _id: new ObjectId(postId) });
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Initialize comments as array if it doesn't exist
        if (!Array.isArray(post.comments)) {
            await postCollection.updateOne(
                { _id: new ObjectId(postId) },
                { $set: { comments: [] } }
            );
        }

        const newComment = {
            id: new ObjectId(),
            username: username,
            text: comment,
            timestamp: new Date()
        };

        const result = await postCollection.updateOne(
            { _id: new ObjectId(postId) },
            { $push: { comments: newComment } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json({ 
            message: 'Comment added successfully',
            comment: newComment
        });

    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ 
            error: 'Failed to add comment',
            message: error.message 
        });
    }
});

// Get comments endpoint
app.get('/:studentId/contents/:postId/comments', async (req, res) => {
    try {
        const { studentId, postId } = req.params;

        // Ensure connection is active
        await connectToMongo();

        // Find the post
        const post = await postCollection.findOne(
            { _id: new ObjectId(postId) },
            { projection: { comments: 1 } }
        );

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(post.comments || []);

    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ 
            error: 'Failed to fetch comments',
            message: error.message 
        });
    }
});

// You'll also need to modify your existing GET endpoint to include likes and comments
app.get('/:studentId/contents', async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Ensure connection is active
        await connectToMongo();
        
        // Get posts
        const posts = await postCollection.find().toArray();
        console.log(`Found ${posts.length} posts`);

        // Format posts
        const formattedPosts = posts.map(post => ({
            _id: post._id,
            username: post.username,
            title: post.title,
            description: post.description,
            likes: post.likes || [],
            comments: post.comments || {},
            fileName: post.fileName || null
        }));

        res.json(formattedPosts);

    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ 
            error: 'Failed to fetch posts',
            message: error.message 
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
    });
});

// Cleanup on server shutdown
process.on('SIGINT', async () => {
    try {
        await client.close();
        console.log('MongoDB connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});



app.post(`/${studentID}/content`, async (req, res) => {
    try {
        let fileName = null;
        if (req.files && req.files.uploadFile) {
            const uploadFile = req.files.uploadFile;
            const uploadsDir = './public/uploads';
            const uploadPath = path.join(uploadsDir, uploadFile.name);

            try {
                await uploadFile.mv(uploadPath);
                fileName = uploadFile.name;
            } catch (uploadError) {
                console.error("File upload error:", uploadError);
                return res.status(500).json({ "message": "Error uploading file" });
            }
        }

        const postData = {
            username: req.session.user.username,
            title: req.body.title,
            description: req.body.description,
            likes: req.body.likes,
            comments: req.body.comments,
            fileName: fileName
        };

        await createPost(postData);
        res.json({ "message": "Post created successfully" });
    } catch (error) {
        console.error("Error:", error);
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
// Add this to your server.js or where your other endpoints are defined
app.get('/:studentId/contents/search', async (req, res) => {
    try {
        const { studentId } = req.params;
        const searchQuery = req.query.q;

        if (!searchQuery) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        await connectToMongo();

        // Create a case-insensitive search query for title and description
        const searchRegex = new RegExp(searchQuery, 'i');
        const posts = await postCollection.find({
            $or: [
                { title: { $regex: searchRegex } },
                { description: { $regex: searchRegex } }
            ]
        }).toArray();

        res.json(posts);

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ 
            error: 'Failed to search posts',
            message: error.message 
        });
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

        const users = await userCollection.find({
            username: { $regex: searchTerm, $options: "i" }
        }).project({
            username: 1,
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

connectToMongo().catch(console.error);
// Listen on port 8080
app.listen(8080, () => {
    console.log("Express listening on port 8080");
});


