// index.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config(); // Load API key from .env

const app = express();
app.use(cors());
app.use(express.json()); // JSON parsing

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // Allow all frontend origins
});

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// -------------------------
// API ENDPOINTS
// -------------------------

// AI Chat Endpoint
app.post("/api/ai", async (req, res) => {
  try {
    const { prompt } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    res.json({ text: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI request failed" });
  }
});

// -------------------------
// WebSocket for real-time
// -------------------------
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Voice streaming
  socket.on("voice-stream", (data) => {
    // TODO: process voice chunks with AI / TTS
    io.emit("voice-response", { text: "Processing voice..." });
  });

  // Gesture updates
  socket.on("gesture", (gestureData) => {
    // Broadcast gesture to all clients
    io.emit("gesture-update", gestureData);
  });

  // Optional: face auth events
  socket.on("face-auth", (faceData) => {
    // TODO: process face embedding → auth
    io.emit("face-auth-result", { status: "unknown" });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Backend running on port ${PORT}`));