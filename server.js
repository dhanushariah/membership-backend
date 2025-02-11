const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Schema & Model
const MemberSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String,
  age: Number,
  memberID: String, 
});
const Member = mongoose.model("Member", MemberSchema);

// ✅ Generate Unique 5-Digit Alphanumeric ID
const generateMemberID = () => Math.random().toString(36).substr(2, 5).toUpperCase();

// ✅ Signup Route
app.post("/signup", async (req, res) => {
  const { username, password, name, age } = req.body;
  if (!username || !password || !name || !age) return res.status(400).json({ error: "All fields required" });

  const existingUser = await Member.findOne({ username });
  if (existingUser) return res.status(400).json({ error: "Username already exists" });

  const newMember = new Member({ username, password, name, age, memberID: generateMemberID() });
  await newMember.save();
  res.json({ message: "Signup successful!", memberID: newMember.memberID });
});

// ✅ Login Route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await Member.findOne({ username, password });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  res.json({ message: "Login successful!", user });
});

// ✅ Dashboard Route
app.get("/dashboard/:username", async (req, res) => {
  const user = await Member.findOne({ username: req.params.username });
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ name: user.name, age: user.age, memberID: user.memberID });
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
