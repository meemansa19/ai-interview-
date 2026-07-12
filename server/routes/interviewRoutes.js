const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authmiddleware')
const {
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
} = require('../controllers/interviewController')

// All interview routes require a valid JWT
router.use(protect)

// Dashboard
router.get('/stats', getDashboardStats)
router.get('/recent', getRecentInterviews)
router.get('/analytics', getPerformanceAnalytics)

// History
router.get('/history', getInterviewHistory)

// Interview lifecycle
router.post('/create', createInterview)
router.get('/:id', getInterviewById)
router.post('/:id/answer', submitAnswer)
router.post('/:id/finalize', finalizeInterview)
router.get('/:id/report', getInterviewReport)
router.delete('/:id', deleteInterview)

module.exports = router