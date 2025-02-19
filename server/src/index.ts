import express, { Request, Response } from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { MongoClient } from "mongodb";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

let messageBuffer: { text: string; date: Date }[] = [];
const BUFFER_SIZE = 10;
const TIMEOUT = 1000;

async function flushBuffer() {
  if (messageBuffer.length > 0) {
    const messagesToInsert = [...messageBuffer];
    messageBuffer = [];

    try {
      const db = client.db("wsapp");
      const collection = db.collection("messages");
      await collection.insertMany(messagesToInsert);
      console.log(`Inserted ${messagesToInsert.length} messages into MongoDB`);
    } catch (err) {
      console.error("Error inserting messages into MongoDB:", err);
    }
  }
}

let timeout: NodeJS.Timeout | null = null;

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("wsapp");
    const collection = db.collection("messages");

    wss.on("connection", (ws) => {
      console.log("New client connected");

      ws.on("message", async (message) => {
        try {
          console.log(`Received: ${message}`);
          const messageData = { text: message.toString(), date: new Date() };

          messageBuffer.push(messageData);

          if (messageBuffer.length >= BUFFER_SIZE) {
            await flushBuffer();
          }

          if (!timeout) {
            timeout = setTimeout(async () => {
              await flushBuffer();
              timeout = null;
            }, TIMEOUT);
          }

          ws.send(`Echo: ${message}`);
        } catch (err) {
          console.error("Error handling WebSocket message:", err);
          ws.send("Error: Failed to process your message");
        }
      });

      ws.on("close", () => {
        console.log("Client disconnected");
      });
    });

    app.post("/messages", (req: Request, res: Response) => {
      (async () => {
        try {
          const { text } = req.body;

          if (!text) {
            return res.status(400).json({ error: "Text is required" });
          }

          const messageData = { text, date: new Date() };

          messageBuffer.push(messageData);

          if (messageBuffer.length >= BUFFER_SIZE) {
            await flushBuffer();
          }

          if (!timeout) {
            timeout = setTimeout(async () => {
              await flushBuffer();
              timeout = null;
            }, TIMEOUT);
          }

          res.status(201).json({ text });
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