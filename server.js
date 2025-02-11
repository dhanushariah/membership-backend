const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // ✅ FIXED: Added CORS

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON requests

// ✅ MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "your_mongodb_connection_string_here";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Member Schema
const memberSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String,
  age: Number,
  memberID: String, // Unique 5-digit alphanumeric ID
});

const Member = mongoose.model("Member", memberSchema);

// ✅ Helper Function: Generate Unique Member ID
const generateMemberID = () => {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
};

// ✅ Signup Route
app.post("/signup", async (req, res) => {
  try {
    const { username, password, name, age } = req.body;
    if (!username || !password || !name || !age) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await Member.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const newMember = new Member({
      username,
      password, // (NOTE: In production, hash the password before saving)
      name,
      age,
      memberID: generateMemberID(),
    });

    await newMember.save();
    res.status(201).json({ message: "Signup successful!", memberID: newMember.memberID });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Login Route
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Member.findOne({ username, password });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ message: "Login successful!", user });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Dashboard Route
app.get("/dashboard/:username", async (req, res) => {
  try {
    const user = await Member.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      name: user.name,
      age: user.age,
      memberID: user.memberID,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
