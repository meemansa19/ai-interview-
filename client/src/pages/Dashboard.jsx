import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiPlusCircle, HiClipboardDocumentList, HiCheckCircle,
  HiChartBar, HiArrowRight, HiClock, HiFire,
} from 'react-icons/hi2'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import { getDashboardStats, getRecentInterviews } from '../services/interviewService'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentInterviews, setRecentInterviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          getDashboardStats(),
          getRecentInterviews(5),
        ])
        setStats(statsRes.data)
        setRecentInterviews(recentRes.data.interviews || [])
      } catch (err) {
        toast.error('Could not load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statCards = [
    {
      label: 'Total Interviews',
      value: stats?.totalInterviews ?? 0,
      icon: HiClipboardDocumentList,
      color: 'text-brand-300 bg-brand-500/15',
    },
    {
      label: 'Completed',
      value: stats?.completedInterviews ?? 0,
      icon: HiCheckCircle,
      color: 'text-accent-teal bg-accent-teal/15',
    },
    {
      label: 'Average Score',
      value: stats?.averageScore != null ? `${stats.averageScore}%` : '—',
      icon: HiChartBar,
      color: 'text-accent-amber bg-accent-amber/15',
    },
    {
      label: 'Current Streak',
      value: stats?.streak != null ? `${stats.streak} days` : '0 days',
      icon: HiFire,
      color: 'text-accent-rose bg-accent-rose/15',
    },
  ]

  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Welcome header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-white/50 mt-1">Ready to sharpen your interview skills today?</p>
          </div>
          <Link to="/interview/setup" className="btn-primary shrink-0">
            <HiPlusCircle className="text-lg" />
            Start Interview
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass-card-hover p-5"
            >
              {loading ? (
                <div className="skeleton h-20 w-full" />
              ) : (
                <>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
                    <card.icon className="text-lg" />
                  </div>
                  <p className="font-display text-2xl font-bold text-white">{card.value}</p>
                  <p className="text-white/40 text-xs mt-1">{card.label}</p>
                </>
              )}
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Interviews */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-lg text-white">Recent Interviews</h2>
              <Link to="/history" className="text-brand-300 hover:text-brand-200 text-sm font-medium flex items-center gap-1 transition-colors">
                View all <HiArrowRight className="text-sm" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 w-full" />)}
              </div>
            ) : recentInterviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                  <HiClipboardDocumentList className="text-2xl text-white/20" />
                </div>
                <p className="text-white/50 text-sm mb-1">No interviews yet</p>
                <p className="text-white/30 text-xs mb-5">Start your first mock interview to see it here.</p>
                <Link to="/interview/setup" className="btn-secondary text-sm !py-2 !px-4 inline-flex">
                  Start your first interview
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentInterviews.map((interview) => (
                  <Link
                    key={interview._id}
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
                          <span className="capitalize">· {interview.difficulty}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {interview.score != null && (
                        <span className={`text-sm font-semibold ${
                          interview.score >= 70 ? 'text-accent-teal' : interview.score >= 40 ? 'text-accent-amber' : 'text-accent-rose'
                        }`}>
                          {interview.score}%
                        </span>
                      )}
                      <HiArrowRight className="text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Profile card */}
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold text-lg text-white mb-5">Your Profile</h2>
            {loading ? (
              <div className="skeleton h-40 w-full" />
            ) : (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-lg font-semibold text-white shrink-0">
                    {user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{user?.name}</p>
                    <p className="text-white/40 text-xs truncate">{user?.email}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/40">Member since</span>
                    <span className="text-white/70">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/40">Best score</span>
                    <span className="text-white/70">{stats?.bestScore != null ? `${stats.bestScore}%` : '—'}</span>
                  </div>
                </div>

                <Link to="/profile" className="btn-secondary w-full mt-5 text-sm !py-2.5">
                  Edit Profile
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard