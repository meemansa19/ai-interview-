const express = require("express");
const router = express.Router();

// Controllers
const {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    changePassword
} = require("../controllers/authController");

// Middleware
const { protect } = require("../middleware/authmiddleware");

// Routes
router.post("/register", registerUser);

router.post("/login", loginUser);

// Protected Route
router.get("/profile", protect, getProfile);
router.put('/profile', protect, updateProfile)
router.put('/change-password', protect, changePassword)

module.exports = router;