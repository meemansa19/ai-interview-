import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiCodeBracket, HiUserGroup, HiChatBubbleLeftRight, HiCommandLine,
  HiArrowRight, HiCheck,
} from 'react-icons/hi2'
import DashboardLayout from '../components/DashboardLayout'
import { createInterview } from '../services/interviewService'
import toast from 'react-hot-toast'

const interviewTypes = [
  { key: 'technical', label: 'Technical', desc: 'Core concepts & problem solving', icon: HiCodeBracket },
  { key: 'coding', label: 'Coding', desc: 'Live coding-style questions', icon: HiCommandLine },
  { key: 'hr', label: 'HR', desc: 'Company fit & role expectations', icon: HiUserGroup },
  { key: 'behavioral', label: 'Behavioral', desc: 'Past experience & soft skills', icon: HiChatBubbleLeftRight },
]

const difficulties = [
  { key: 'easy', label: 'Easy', desc: 'Foundational, entry-level' },
  { key: 'medium', label: 'Medium', desc: 'Standard interview depth' },
  { key: 'hard', label: 'Hard', desc: 'Senior-level, in-depth' },
]

const popularTopics = [
  'JavaScript', 'React', 'Node.js', 'Python', 'Data Structures & Algorithms',
  'System Design', 'SQL', 'MongoDB', 'Java', 'DevOps',
]

const questionCounts = [5, 10, 15, 20]

const InterviewSetup = () => {
  const navigate = useNavigate()
  const [type, setType] = useState('technical')
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [numQuestions, setNumQuestions] = useState(10)
  const [isCreating, setIsCreating] = useState(false)

  const handleStart = async () => {
    if (!topic.trim()) {
      toast.error('Please enter or select a topic')
      return
    }

    setIsCreating(true)
    try {
      const res = await createInterview({
        topic: topic.trim(),
        difficulty,
        numQuestions,
        type,
      })
      const interviewId = res.data.interview?._id || res.data._id
      toast.success('Interview ready — good luck!')
      navigate(`/interview/session/${interviewId}`)
    } catch (err) {
      const message = err.response?.data?.message || 'Could not generate interview. Please try again.'
      toast.error(message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Start a new interview</h1>
          <p className="text-white/50 mt-1">Set up your session — this takes about 10 seconds.</p>
        </div>

        <div className="space-y-8">
          {/* Interview type */}
          <div>
            <p className="text-sm font-medium text-white/70 mb-3">Interview type</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {interviewTypes.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setType(item.key)}
                  className={`p-4 rounded-xl text-left transition-all duration-200 border ${
                    type === item.key
                      ? 'bg-brand-500/15 border-brand-400/50 shadow-glow-sm'
                      : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  <item.icon className={`text-xl mb-2 ${type === item.key ? 'text-brand-300' : 'text-white/40'}`} />
                  <p className={`text-sm font-medium ${type === item.key ? 'text-white' : 'text-white/70'}`}>{item.label}</p>
                  <p className="text-white/30 text-xs mt-0.5 leading-tight">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div>
            <p className="text-sm font-medium text-white/70 mb-3">Technology / Topic</p>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. React, System Design, Data Structures..."
              className="input-field mb-3"
            />
            <div className="flex flex-wrap gap-2">
              {popularTopics.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    topic === t
                      ? 'bg-brand-500 text-white'
                      : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/80'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <p className="text-sm font-medium text-white/70 mb-3">Difficulty</p>
            <div className="grid grid-cols-3 gap-3">
              {difficulties.map((d) => (
                <button
                  key={d.key}
                  onClick={() => setDifficulty(d.key)}
                  className={`p-4 rounded-xl text-center transition-all duration-200 border ${
                    difficulty === d.key
                      ? 'bg-brand-500/15 border-brand-400/50 shadow-glow-sm'
                      : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  <p className={`text-sm font-semibold ${difficulty === d.key ? 'text-white' : 'text-white/70'}`}>{d.label}</p>
                  <p className="text-white/30 text-xs mt-0.5">{d.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Number of questions */}
          <div>
            <p className="text-sm font-medium text-white/70 mb-3">Number of questions</p>
            <div className="flex gap-3">
              {questionCounts.map((n) => (
                <button
                  key={n}
                  onClick={() => setNumQuestions(n)}
                  className={`w-16 h-16 rounded-xl font-display font-bold text-lg transition-all duration-200 border ${
                    numQuestions === n
                      ? 'bg-brand-500/15 border-brand-400/50 text-white shadow-glow-sm'
                      : 'bg-white/[0.03] border-white/[0.06] text-white/50 hover:bg-white/[0.05]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Summary + CTA */}
          <div className="glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-white/60 flex-wrap">
              <HiCheck className="text-accent-teal shrink-0" />
              <span className="capitalize">{type}</span>
              <span className="text-white/20">·</span>
              <span>{topic || 'No topic selected'}</span>
              <span className="text-white/20">·</span>
              <span className="capitalize">{difficulty}</span>
              <span className="text-white/20">·</span>
              <span>{numQuestions} questions</span>
            </div>
            <motion.button
              onClick={handleStart}
              disabled={isCreating}
              whileTap={{ scale: 0.98 }}
              className="btn-primary shrink-0"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Generating questions...
                </>
              ) : (
                <>
                  Begin Interview
                  <HiArrowRight />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default InterviewSetup
