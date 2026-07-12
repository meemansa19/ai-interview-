const fs = require('fs')
const Resume = require('../models/Resume')
const { analyzeResume } = require('../config/gemini')

// ── POST /api/resume/upload ───────────────────────────────
const uploadAndAnalyzeResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a PDF resume' })
  }

  const filePath = req.file.path

  try {
    const analysis = await analyzeResume(filePath)

    const resume = await Resume.create({
      user: req.user._id,
      fileName: req.file.originalname,
      extractedText: analysis.extractedText,
      atsScore: analysis.atsScore,
      overallScore: analysis.overallScore,
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      missingKeywords: analysis.missingKeywords || [],
      sectionFeedback: analysis.sectionFeedback || [],
      suggestions: analysis.suggestions || [],
      summary: analysis.summary || '',
    })

    res.status(201).json({ resume })
  } catch (err) {
    console.error('uploadAndAnalyzeResume error:', err.message)
    res.status(500).json({ message: err.message || 'Could not analyze resume' })
  } finally {
    // Clean up the uploaded PDF from local disk — we've already stored
    // the extracted text in MongoDB, so the raw file isn't needed anymore
    fs.unlink(filePath, (err) => {
      if (err) console.warn('Could not delete uploaded resume file:', err.message)
    })
  }
}

// ── GET /api/resume/history ───────────────────────────────
const getResumeHistory = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('fileName atsScore overallScore createdAt')

    res.json({ resumes })
  } catch (err) {
    console.error('getResumeHistory error:', err.message)
    res.status(500).json({ message: 'Could not fetch resume history' })
  }
}

// ── GET /api/resume/:id ────────────────────────────────────
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id })

    if (!resume) {
      return res.status(404).json({ message: 'Resume review not found' })
    }

    res.json({ resume })
  } catch (err) {
    console.error('getResumeById error:', err.message)
    res.status(500).json({ message: 'Could not fetch resume review' })
  }
}

// ── DELETE /api/resume/:id ─────────────────────────────────
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id })

    if (!resume) {
      return res.status(404).json({ message: 'Resume review not found' })
    }

    res.json({ message: 'Resume review deleted' })
  } catch (err) {
    console.error('deleteResume error:', err.message)
    res.status(500).json({ message: 'Could not delete resume review' })
  }
}

module.exports = {
  uploadAndAnalyzeResume,
  getResumeHistory,
  getResumeById,
  deleteResume,
}