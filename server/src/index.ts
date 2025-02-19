import express from "express";
import http from "http";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
const server = http.createServer(app);

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("wsapp");
    const collection = db.collection("messages");

    const PORT = 3001;
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

    app.get("/messages", async (req, res) => {
      const messages = await collection.find().toArray();
      res.json(messages);
    });
  } catch (err) {
    console.error(err);
  }
}

run();
