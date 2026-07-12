import api from './api'

// ── Dashboard ────────────────────────────────────────────

// Returns { totalInterviews, completedInterviews, averageScore, bestScore, streak }
export const getDashboardStats = () => api.get('/interviews/stats')

// Returns { interviews: [...] } — most recent interviews, limited by `limit`
export const getRecentInterviews = (limit = 5) =>
  api.get(`/interviews/recent?limit=${limit}`)

// ── Interview lifecycle ──────────────────────────────────

// Creates a new interview: generates questions via Gemini on the backend
// and saves the interview document. Returns the created interview with questions.
export const createInterview = ({ topic, difficulty, numQuestions, type }) =>
  api.post('/interviews/create', { topic, difficulty, numQuestions, type })

// Fetches a single interview by ID (used when resuming/loading a session)
export const getInterviewById = (interviewId) =>
  api.get(`/interviews/${interviewId}`)

// Submits a single answer for one question during the session
// (saved incrementally so nothing is lost if the user closes the tab)
export const submitAnswer = (interviewId, { questionIndex, answerText }) =>
  api.post(`/interviews/${interviewId}/answer`, { questionIndex, answerText })

// Finalizes the interview — triggers backend AI evaluation of all answers,
// returns the full report: score, feedback, strengths, weak areas
export const finalizeInterview = (interviewId) =>
  api.post(`/interviews/${interviewId}/finalize`)

// ── History & Reports ────────────────────────────────────

// Returns paginated interview history: { interviews, totalPages, currentPage }
export const getInterviewHistory = (page = 1, limit = 10) =>
  api.get(`/interviews/history?page=${page}&limit=${limit}`)

// Returns the full report for a completed interview
export const getInterviewReport = (interviewId) =>
  api.get(`/interviews/${interviewId}/report`)

// Deletes an interview from history
export const deleteInterview = (interviewId) =>
  api.delete(`/interviews/${interviewId}`)

// ── Analytics (for charts on History/Dashboard) ──────────

// Returns score-over-time data points for the progress chart
export const getPerformanceAnalytics = () =>
  api.get('/interviews/analytics')