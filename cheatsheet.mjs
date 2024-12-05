import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

const connectionURI = "mongodb://127.0.0.1:27017?retryWrites=true&w=majority";

const client = new MongoClient(connectionURI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
    }
});

const database = client.db("cst2120");
const collection = database.collection("users")

async function find(username) {
    const query = {"username": username}; 
    const results = await collection.find(query).toArray();
    if (results != "") {
        console.log("hi")
    }
    await client.close();
}

async function findSort()  {
    const query = {};

    const options = {
        sort: {age: -1}
    }

    const results = await collection.find(query, options).toArray();
    console.log(results);

    await client.close();
}

export async function insertOne() {
    const newUser = {name: "noobie", age: 47};
    

    await collection.insertOne(newUser);

    await client.close();
}

async function insertMany() {
    const newUser = [
        {name: "noobie", age: 47},
        {name: "noobie2", age:67}
    ];

    const result = await collection.insertMany(newUser);
    console.log(result);

    await client.close();
}

async function replaceOne() {
    const query = {_id: new ObjectId("674920ef0e978eb8cdadcf96")};
    const newDocument = {name: "hahaReplaced", age: 100};

    try {
        const result = await collection.replaceOne(query, newDocument);
        console.log(`Modified ${result.modifiedCount} documents`);
    } catch (err) {
        console.error("Failed")
    }

    await client.close();
}

async function updateOne() {
    const query = {age: 20};

    const updateDoc = {$set: {age: 19}};
    const result = await collection.updateOne(query, updateDoc);

    console.log(`Updated ${result.modifiedCount} documents`)

    await client.close();
}

async function updateMany() {
    const query = {age: 19};

    const updateDoc = {$set: {age: 20}};
    const result = await collection.updateMany(query, updateDoc);

    console.log(`Updated ${result.modifiedCount} documents`)

    await client.close();
}

async function deleteMany() {
    const query = {};
    const result = await collection.deleteMany(query);

    console.log(`${result.deletedCount} documents deleted`);

    await client.close();
}
 deleteMany();
//ITS FUCKING WORKING
//KURWA
