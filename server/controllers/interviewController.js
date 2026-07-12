const Interview = require('../models/Interview')
const { generateInterviewQuestions, evaluateInterview } = require('../config/gemini')

// ── POST /api/interviews/create ──────────────────────────
const createInterview = async (req, res) => {
  try {
    const { topic, difficulty, numQuestions, type } = req.body

    if (!topic || !difficulty || !numQuestions) {
      return res.status(400).json({ message: 'Topic, difficulty, and number of questions are required' })
    }

    const generatedQuestions = await generateInterviewQuestions({
      topic,
      difficulty,
      numQuestions,
      type: type || 'technical',
    })

    const interview = await Interview.create({
      user: req.user._id,
      topic,
      difficulty,
      type: type || 'technical',
      questions: generatedQuestions.map((q) => ({
        questionText: q.questionText,
        type: q.type || type || 'technical',
      })),
      status: 'in-progress',
    })

    res.status(201).json({ interview })
  } catch (err) {
    console.error('createInterview error:', err.message)
    res.status(500).json({ message: err.message || 'Could not create interview' })
  }
}

// ── GET /api/interviews/:id ───────────────────────────────
const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id })

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' })
    }

    res.json({ interview })
  } catch (err) {
    console.error('getInterviewById error:', err.message)
    res.status(500).json({ message: 'Could not fetch interview' })
  }
}

// ── POST /api/interviews/:id/answer ───────────────────────
const submitAnswer = async (req, res) => {
  try {
    const { questionIndex, answerText } = req.body
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id })

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' })
    }

    if (questionIndex == null || !interview.questions[questionIndex]) {
      return res.status(400).json({ message: 'Invalid question index' })
    }

    interview.questions[questionIndex].userAnswer = answerText || ''
    await interview.save()

    res.json({ message: 'Answer saved' })
  } catch (err) {
    console.error('submitAnswer error:', err.message)
    res.status(500).json({ message: 'Could not save answer' })
  }
}

// ── POST /api/interviews/:id/finalize ─────────────────────
const finalizeInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id })

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' })
    }

    const evaluation = await evaluateInterview({
      topic: interview.topic,
      difficulty: interview.difficulty,
      questions: interview.questions.map((q) => ({
        questionText: q.questionText,
        userAnswer: q.userAnswer,
      })),
    })

    // Merge per-question evaluation back into the stored questions
    interview.questions = interview.questions.map((q, i) => ({
      ...q.toObject(),
      score: evaluation.questions[i]?.score ?? 0,
      feedback: evaluation.questions[i]?.feedback ?? '',
      idealAnswer: evaluation.questions[i]?.idealAnswer ?? '',
    }))

    interview.score = evaluation.overallScore
    interview.overallRating = evaluation.overallRating
    interview.feedback = evaluation.feedback
    interview.strengths = evaluation.strengths || []
    interview.weakAreas = evaluation.weakAreas || []
    interview.status = 'completed'

    await interview.save()

    res.json({ interview })
  } catch (err) {
    console.error('finalizeInterview error:', err.message)
    res.status(500).json({ message: err.message || 'Could not finalize interview' })
  }
}

// ── GET /api/interviews/stats ─────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const allInterviews = await Interview.find({ user: req.user._id })
    const completed = allInterviews.filter((i) => i.status === 'completed')

    const scores = completed.map((i) => i.score).filter((s) => s != null)
    const averageScore = scores.length
      ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
      : null
    const bestScore = scores.length ? Math.max(...scores) : null

    // Simple streak: consecutive days (from today backwards) with at least one completed interview
    const streak = calculateStreak(completed)

    res.json({
      totalInterviews: allInterviews.length,
      completedInterviews: completed.length,
      averageScore,
      bestScore,
      streak,
    })
  } catch (err) {
    console.error('getDashboardStats error:', err.message)
    res.status(500).json({ message: 'Could not fetch stats' })
  }
}

// Helper: counts consecutive days ending today with >= 1 completed interview
const calculateStreak = (completedInterviews) => {
  if (!completedInterviews.length) return 0

  const dateStrings = new Set(
    completedInterviews.map((i) => new Date(i.createdAt).toDateString())
  )

  let streak = 0
  let cursor = new Date()

  while (dateStrings.has(cursor.toDateString())) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

// ── GET /api/interviews/recent ────────────────────────────
const getRecentInterviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5
    const interviews = await Interview.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('topic difficulty type score status createdAt')

    res.json({ interviews })
  } catch (err) {
    console.error('getRecentInterviews error:', err.message)
    res.status(500).json({ message: 'Could not fetch recent interviews' })
  }
}

// ── GET /api/interviews/history ───────────────────────────
const getInterviewHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const [interviews, total] = await Promise.all([
      Interview.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('topic difficulty type score status createdAt'),
      Interview.countDocuments({ user: req.user._id }),
    ])

    res.json({
      interviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    })
  } catch (err) {
    console.error('getInterviewHistory error:', err.message)
    res.status(500).json({ message: 'Could not fetch interview history' })
  }
}

// ── GET /api/interviews/:id/report ────────────────────────
const getInterviewReport = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id })

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' })
    }

    res.json({ interview })
  } catch (err) {
    console.error('getInterviewReport error:', err.message)
    res.status(500).json({ message: 'Could not fetch report' })
  }
}

// ── DELETE /api/interviews/:id ────────────────────────────
const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findOneAndDelete({ _id: req.params.id, user: req.user._id })

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' })
    }

    res.json({ message: 'Interview deleted' })
  } catch (err) {
    console.error('deleteInterview error:', err.message)
    res.status(500).json({ message: 'Could not delete interview' })
  }
}

// ── GET /api/interviews/analytics ─────────────────────────
const getPerformanceAnalytics = async (req, res) => {
  try {
    const completed = await Interview.find({ user: req.user._id, status: 'completed' })
      .sort({ createdAt: 1 })
      .select('score createdAt')

    const dataPoints = completed.map((i) => ({
      date: new Date(i.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: i.score,
    }))

    res.json({ dataPoints })
  } catch (err) {
    console.error('getPerformanceAnalytics error:', err.message)
    res.status(500).json({ message: 'Could not fetch analytics' })
  }
}

module.exports = {
  createInterview,
  getInterviewById,
  submitAnswer,
  finalizeInterview,
  getDashboardStats,
  getRecentInterviews,
  getInterviewHistory,
  getInterviewReport,
  deleteInterview,
  getPerformanceAnalytics,
}