const mongoose = require('mongoose')

const videoInterviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    question: {
      type: String, // the question the user was answering
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ['upload', 'recorded'],
      default: 'upload',
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    overallScore: {
      type: Number, // 0-100
      default: null,
    },
    transcript: {
      type: String, // what Gemini understood the candidate to have said
      default: '',
    },
    communicationFeedback: {
      type: String,
      default: '',
    },
    confidenceFeedback: {
      type: String,
      default: '',
    },
    paceFeedback: {
      type: String,
      default: '',
    },
    strengths: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
    fillerWordCount: {
      type: Number,
      default: null,
    },
    summary: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('VideoInterview', videoInterviewSchema)