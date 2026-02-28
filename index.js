
import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize OpenAI with API key from Railway env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Jarvis Omega Backend Running" });
});

// AI Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: message }]
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI response failed" });
  }
});

// Socket.io real-time for voice/gestures
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Voice message event
  socket.on("voiceMessage", async (data) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: data }]
      });
      socket.emit("voiceReply", response.choices[0].message.content);
    } catch (err) {
      socket.emit("voiceReply", "Error processing AI message");
    }
  });

  // Gesture placeholder
  socket.on("gesture", (data) => {
    console.log("Gesture event:", data);
    // You can add logic here for gesture recognition
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Use ONLY Railway-assigned port
const PORT = process.env.PORT;
// Use Railway's assigned PORT or default to 8080 for local
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});