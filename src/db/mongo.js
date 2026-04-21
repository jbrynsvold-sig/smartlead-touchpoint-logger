const { MongoClient } = require("mongodb");

let client;
let db;

async function connect() {
  if (db) return db;

  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db("acquisitions");
  console.log("Connected to MongoDB");
  return db;
}

async function getCollection() {
  const database = await connect();
  return database.collection("contacts");
}

module.exports = { connect, getCollection };
