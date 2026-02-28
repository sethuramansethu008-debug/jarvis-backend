const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

// Root route (IMPORTANT)
app.get("/", (req, res) => {
  res.send("Jarvis Backend is Running 🚀");
});

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Backend working perfectly" });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});