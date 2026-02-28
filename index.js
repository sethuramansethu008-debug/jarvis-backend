import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 🔹 Health check route
app.get("/", (req, res) => {
  res.json({ status: "Jarvis Omega Backend Running" });
});

// 🔹 Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // safer + cheaper model
      messages: [{ role: "user", content: message }]
    });

    res.json({
      reply: response.choices[0].message.content
    });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "AI response failed" });
  }
});

// 🔹 Socket.io realtime
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("voiceMessage", async (data) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: data }]
      });

      socket.emit("voiceReply", response.choices[0].message.content);

    } catch (error) {
      console.error("Socket Error:", error);
      socket.emit("voiceReply", "Error processing AI message");
    }
  });

  socket.on("gesture", (data) => {
    console.log("Gesture event:", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// 🔥 VERY IMPORTANT FOR RAILWAY
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});