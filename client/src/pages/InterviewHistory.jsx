import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  HiClipboardDocumentList, HiArrowRight, HiClock, HiTrash,
  HiChevronLeft, HiChevronRight, HiChartBar,
} from 'react-icons/hi2'
import DashboardLayout from '../components/DashboardLayout'
import {
  getInterviewHistory, getPerformanceAnalytics, deleteInterview,
} from '../services/interviewService'
import toast from 'react-hot-toast'

const filters = [
  { key: 'all', label: 'All' },
  { key: 'technical', label: 'Technical' },
  { key: 'coding', label: 'Coding' },
  { key: 'hr', label: 'HR' },
  { key: 'behavioral', label: 'Behavioral' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2 !bg-surface-800/95">
      <p className="text-white/50 text-xs mb-1">{label}</p>
      <p className="text-white text-sm font-semibold">{payload[0].value}% score</p>
    </div>
  )
}

const InterviewHistory = () => {
  const [interviews, setInterviews] = useState([])
  const [analytics, setAnalytics] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [historyRes, analyticsRes] = await Promise.all([
          getInterviewHistory(page, 10),
          page === 1 ? getPerformanceAnalytics() : Promise.resolve(null),
        ])
        setInterviews(historyRes.data.interviews || [])
        setTotalPages(historyRes.data.totalPages || 1)
        if (analyticsRes) {
          setAnalytics(analyticsRes.data.dataPoints || analyticsRes.data || [])
        }
      } catch (err) {
        toast.error('Could not load interview history')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [page])

  const filteredInterviews = activeFilter === 'all'
    ? interviews
    : interviews.filter((i) => i.type === activeFilter)

  const handleDelete = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('Delete this interview from your history? This cannot be undone.')) return

    setDeletingId(id)
    try {
      await deleteInterview(id)
      setInterviews((prev) => prev.filter((i) => i._id !== id))
      toast.success('Interview deleted')
    } catch (err) {
      toast.error('Could not delete interview')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Interview History</h1>
          <p className="text-white/50 mt-1">Track your progress and review past sessions.</p>
        </div>

        {/* Performance chart */}
        {page === 1 && (
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <HiChartBar className="text-brand-300" />
              <h2 className="font-display font-semibold text-white">Score trend</h2>
            </div>

            {loading ? (
              <div className="skeleton h-56 w-full" />
            ) : analytics.length < 2 ? (
              <div className="h-56 flex items-center justify-center text-center px-6">
                <p className="text-white/30 text-sm">Complete a few more interviews to see your progress trend here.</p>
              </div>
            ) : (
              <div className="h-56 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255,255,255,0.3)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.3)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#7c3aed"
                      strokeWidth={2.5}
                      dot={{ fill: '#7c3aed', r: 4 }}
                      activeDot={{ r: 6, fill: '#a893ff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === f.key
                  ? 'bg-brand-500 text-white'
                  : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/80'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Interview list */}
        <div className="glass-card p-2 sm:p-3">
          {loading ? (
            <div className="space-y-2 p-3">
              {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-16 w-full" />)}
            </div>
          ) : filteredInterviews.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                <HiClipboardDocumentList className="text-2xl text-white/20" />
              </div>
              <p className="text-white/50 text-sm mb-1">No interviews found</p>
              <p className="text-white/30 text-xs mb-5">
                {activeFilter === 'all' ? "You haven't completed any interviews yet." : `No ${activeFilter} interviews yet.`}
              </p>
              <Link to="/interview/setup" className="btn-secondary text-sm !py-2 !px-4 inline-flex">
                Start an interview
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredInterviews.map((interview, i) => (
                <motion.div
                  key={interview._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                >
                  <Link
                    to={`/interview/report/${interview._id}`}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.04] transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-brand-500/15 flex items-center justify-center shrink-0">
                        <HiClipboardDocumentList className="text-brand-300" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">{interview.topic}</p>
                        <p className="text-white/40 text-xs flex items-center gap-1.5 mt-0.5">
                          <HiClock className="text-xs" />
                          {new Date(interview.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          <span className="capitalize">· {interview.type || 'technical'} · {interview.difficulty}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                      {interview.score != null && (
                        <span className={`text-sm font-semibold ${
                          interview.score >= 70 ? 'text-accent-teal' : interview.score >= 40 ? 'text-accent-amber' : 'text-accent-rose'
                        }`}>
                          {interview.score}%
                        </span>
                      )}
                      <button
                        onClick={(e) => handleDelete(interview._id, e)}
                        disabled={deletingId === interview._id}
                        className="text-white/20 hover:text-accent-rose transition-colors p-1.5"
                        aria-label="Delete interview"
                      >
                        {deletingId === interview._id ? (
                          <div className="w-4 h-4 border-2 border-white/20 border-t-accent-rose rounded-full animate-spin" />
                        ) : (
                          <HiTrash className="text-sm" />
                        )}
                      </button>
                      <HiArrowRight className="text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all hidden sm:block" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 rounded-lg glass-card flex items-center justify-center text-white/50 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <HiChevronLeft />
            </button>
            <span className="text-white/50 text-sm">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-9 h-9 rounded-lg glass-card flex items-center justify-center text-white/50 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <HiChevronRight />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default InterviewHistory