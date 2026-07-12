require("dotenv").config();


const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");


const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use('/api/interviews', require('./routes/interviewRoutes'))
app.use('/api/resume', require('./routes/resumeRoutes'))
app.use('/api/video-interview', require('./routes/videoRoutes'))

// Test Route
app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});