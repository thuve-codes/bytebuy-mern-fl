const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const user = new User({ name, email, password });
  await user.save();
  res.json({ message: "User registered" });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password }).select("-password"); // exclude password

  if (user) {
    res.json({
      message: "Login successful",
      user, // return the user data (without password)
    });
  } else {
    res.status(400).json({ message: "Invalid credentials" });
  }
});

module.exports = router;
