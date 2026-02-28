const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Jarvis Backend is Running 🚀");
});

// IMPORTANT FIX
const PORT = process.env.PORT;

if (!PORT) {
  console.error("PORT not defined!");
  process.exit(1);
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});