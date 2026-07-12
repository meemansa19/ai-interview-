const fs = require('fs')
const VideoInterview = require('../models/VideoInterview')
const { analyzeVideoInterview } = require('../config/gemini')

// ── POST /api/video-interview/upload ──────────────────────
const uploadVideoInterview = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload or record a video' })
  }

  const { question, source } = req.body
  if (!question || !question.trim()) {
    fs.unlink(req.file.path, () => {})
    return res.status(400).json({ message: 'A question is required' })
  }

  const filePath = req.file.path
  const mimeType = req.file.mimetype

  let videoInterview
  try {
    // Create the record immediately with 'processing' status so the
    // frontend can start polling for results right away
    videoInterview = await VideoInterview.create({
      user: req.user._id,
      question: question.trim(),
      fileName: req.file.originalname || 'recorded-video.webm',
      source: source === 'recorded' ? 'recorded' : 'upload',
      status: 'processing',
    })

    // Respond immediately — don't make the client wait on the full analysis
    res.status(202).json({ videoInterview })
  } catch (err) {
    console.error('uploadVideoInterview (create) error:', err.message)
    fs.unlink(filePath, () => {})
    return res.status(500).json({ message: 'Could not start video processing' })
  }

  // ── Runs after the response has already been sent ──────────
  try {
    const analysis = await analyzeVideoInterview(filePath, mimeType, videoInterview.question)

    videoInterview.status = 'completed'
    videoInterview.overallScore = analysis.overallScore
    videoInterview.transcript = analysis.transcript || ''
    videoInterview.communicationFeedback = analysis.communicationFeedback || ''
    videoInterview.confidenceFeedback = analysis.confidenceFeedback || ''
    videoInterview.paceFeedback = analysis.paceFeedback || ''
    videoInterview.fillerWordCount = analysis.fillerWordCount ?? null
    videoInterview.strengths = analysis.strengths || []
    videoInterview.improvements = analysis.improvements || []
    videoInterview.summary = analysis.summary || ''

    await videoInterview.save()
  } catch (err) {
    console.error('uploadVideoInterview (analysis) error:', err.message)
    videoInterview.status = 'failed'
    videoInterview.summary = 'Analysis failed. Please try uploading again.'
    await videoInterview.save()
  } finally {
    // Clean up the local video file regardless of outcome
    fs.unlink(filePath, (err) => {
      if (err) console.warn('Could not delete uploaded video file:', err.message)
    })
  }
}

// ── GET /api/video-interview/:id ──────────────────────────
// Frontend polls this endpoint while status is 'processing'
const getVideoInterviewById = async (req, res) => {
  try {
    const videoInterview = await VideoInterview.findOne({ _id: req.params.id, user: req.user._id })

    if (!videoInterview) {
      return res.status(404).json({ message: 'Video interview not found' })
    }

    res.json({ videoInterview })
  } catch (err) {
    console.error('getVideoInterviewById error:', err.message)
    res.status(500).json({ message: 'Could not fetch video interview' })
  }
}

// ── GET /api/video-interview/history ──────────────────────
const getVideoInterviewHistory = async (req, res) => {
  try {
    const videoInterviews = await VideoInterview.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('question fileName status overallScore createdAt')

    res.json({ videoInterviews })
  } catch (err) {
    console.error('getVideoInterviewHistory error:', err.message)
    res.status(500).json({ message: 'Could not fetch video interview history' })
  }
}

// ── DELETE /api/video-interview/:id ───────────────────────
const deleteVideoInterview = async (req, res) => {
  try {
    const videoInterview = await VideoInterview.findOneAndDelete({ _id: req.params.id, user: req.user._id })

    if (!videoInterview) {
      return res.status(404).json({ message: 'Video interview not found' })
    }

    res.json({ message: 'Video interview deleted' })
  } catch (err) {
    console.error('deleteVideoInterview error:', err.message)
    res.status(500).json({ message: 'Could not delete video interview' })
  }
}

module.exports = {
  uploadVideoInterview,
  getVideoInterviewById,
  getVideoInterviewHistory,
  deleteVideoInterview,
}