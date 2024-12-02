import bodyParser from "body-parser";
import express from "express";
import path from "path";
import { MongoClient, ServerApiVersion } from "mongodb";

const fileName = "server.mjs";
//App
const app = express();

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

let database, collection;

// Establish connection to MongoDB at app start
async function connectToDatabase() {
    try {
        await client.connect();
        database = client.db("cst2120");
        collection = database.collection("users");
        console.log("MongoDB connected");
    } catch (error) {
        console.error("Error connecting to MongoDB", error);
        process.exit(1); // Exit the application if the connection fails
    }
}

connectToDatabase(); // Call to establish the connection when the app starts

// MongoDB Functions

// Find matching document
async function findUsername(username) {
    const query = { "username": username };
    const results = await collection.find(query).toArray();
    return results;  // Don't close the client here, let it remain open
}

// Insert one document into the database
async function insertOne(userJSON) {
    await collection.insertOne(userJSON);
    // Don't close the client here, let it remain open
}

// Listening for requests
const studentID = "M00931085";

// Loading the page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login
app.get(`/${studentID}/login`, (req, res) => {
    res.send(req.body);
});

app.post(`/${studentID}/login`, (req, res) => {
    res.send({ "Message": "Data received" });
});

// Register
app.post(`/${studentID}/users`, async (req, res) => {
    try {
        const username = await findUsername(req.body["username"]); //Find if the username exists

        if (username.length > 0) {  // Check if the username exists
            console.log(`Username: ${req.body["username"]} already exists (from ${fileName})`); //Log that user exists
            res.send({"message": "Username already exists"});  // Respond with an error
        } else {
            await insertOne(req.body); // Insert new user into the database
            console.log(`User: ${req.body["username"]} added to database (from ${fileName})`); //Log that user added successfully
            res.send({"message": "User added successfully"}); //Respond with confirmation message
        }
    } catch (error) { //If error
        console.log(`${error} (from ${fileName})`); //Return error and origin
        res.send({"message": "Server error"}); //Send error response
    }
});

// Listen on port 8080
app.listen(8080, () => {
    console.log("Express listening on port 8080");
});
