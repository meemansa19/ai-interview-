const mongoose = require('mongoose')

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String, // raw text pulled from the PDF, kept for reference/re-evaluation
      required: true,
    },
    atsScore: {
      type: Number, // 0-100, how ATS-friendly the resume is
      default: null,
    },
    overallScore: {
      type: Number, // 0-100, overall quality score
      default: null,
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    missingKeywords: {
      type: [String],
      default: [],
    },
    sectionFeedback: {
      type: [
        {
          section: String, // e.g. "Experience", "Skills", "Summary"
          feedback: String,
        },
      ],
      default: [],
    },
    suggestions: {
      type: [String],
      default: [],
    },
    summary: {
      type: String, // 2-3 sentence overall verdict
      default: '',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Resume', resumeSchema)