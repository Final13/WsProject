import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);

async function run() {
  try {
    const PORT = 3001;
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

    app.get("/messages", async (req, res) => {
      const messages = ["msg1", "msg2", "msg3"];
      res.json(messages);
    });
  } catch (err) {
    console.error(err);
  }
}

run();
