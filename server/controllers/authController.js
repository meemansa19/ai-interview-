const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const registerUser = async (req, res) => {
  try {
    // Get data from request
    const { name, email, password } = req.body;

const hashedPassword = await bcrypt.hash(password, 10);


    // Create a new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save to MongoDB
    await user.save();

    // Send success response
    res.status(201).json({
      message: "User Registered Successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};


const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) 
        {
    return res.status(404).json({
        message: "User not found"
    });
        }
    const isMatch = await bcrypt.compare(password, user.password);
     if (!isMatch) 
      {
    return res.status(401).json({
        message: "Invalid Password"
    });
   }
   const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
);

   res.status(200).json({
    message: "Login Successful",
    token,
    user: {
        id: user._id,
        name: user.name,
        email: user.email
    }
});
    } catch (error) {
       res.status(500).json({
            message: error.message
        });

    }
};
// Add this near your other requires at the top, if not already there:
// const bcrypt = require('bcryptjs')  // or 'bcrypt', matching whatever your register function already uses

// ── PUT /api/auth/profile ─────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name cannot be empty' })
    }

    req.user.name = name.trim()
    await req.user.save()

    res.json({ user: req.user })
  } catch (err) {
    console.error('updateProfile error:', err.message)
    res.status(500).json({ message: 'Could not update profile' })
  }
}

// ── PUT /api/auth/change-password ─────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' })
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' })
    }

    // Need the password field back since your protect middleware excludes it with .select('-password')
    const User = require('../models/User')
    const userWithPassword = await User.findById(req.user._id)

    const isMatch = await bcrypt.compare(currentPassword, userWithPassword.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    const salt = await bcrypt.genSalt(10)
    userWithPassword.password = await bcrypt.hash(newPassword, salt)
    await userWithPassword.save()

    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    console.error('changePassword error:', err.message)
    res.status(500).json({ message: 'Could not change password' })
  }
}
const getProfile = async (req, res) => {
    res.status(200).json({
        message: "Protected Route Accessed",
        user: req.user,
    });
};
module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword

};