import express, { Request, Response } from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { MongoClient } from "mongodb";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("wsapp");
    const collection = db.collection("messages");

    app.post("/messages", (req: Request, res: Response) => {
      (async () => {
        try {
          const { text } = req.body;

          if (!text) {
            return res.status(400).json({ error: "Text is required" });
          }

          const result = await collection.insertOne({ text, date: new Date() });
          res.status(201).json({ id: result.insertedId, text });
        } catch (err) {
          console.error("Error creating message:", err);
          res.status(500).json({ error: "Internal server error" });
        }
      })();
    });

    app.get("/messages", (req: Request, res: Response) => {
      (async () => {
        try {
          const messages = await collection.find().toArray();
          res.status(200).json(messages);
        } catch (err) {
          console.error("Error fetching messages:", err);
          res.status(500).json({ error: "Internal server error" });
        }
      })();
    });

    const PORT = 3001;
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}

run();