import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import {
  HiArrowDownTray, HiCheckCircle, HiXCircle, HiSparkles,
  HiArrowTrendingUp, HiArrowTrendingDown, HiHome, HiChevronDown,
} from 'react-icons/hi2'
import DashboardLayout from '../components/DashboardLayout'
import { getInterviewReport } from '../services/interviewService'
import toast from 'react-hot-toast'

const scoreColor = (score) => {
  if (score >= 70) return { text: 'text-accent-teal', bg: 'bg-accent-teal/15', ring: 'stroke-accent-teal' }
  if (score >= 40) return { text: 'text-accent-amber', bg: 'bg-accent-amber/15', ring: 'stroke-accent-amber' }
  return { text: 'text-accent-rose', bg: 'bg-accent-rose/15', ring: 'stroke-accent-rose' }
}

const ScoreRing = ({ score }) => {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const colors = scoreColor(score)

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-white/[0.06]" />
        <motion.circle
          cx="60" cy="60" r={radius} fill="none" strokeWidth="10" strokeLinecap="round"
          className={colors.ring}
          style={{ strokeDasharray: circumference }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-display text-3xl font-bold ${colors.text}`}>{score}%</span>
        <span className="text-white/30 text-xs">Overall</span>
      </div>
    </div>
  )
}

const QuestionFeedback = ({ item, index }) => {
  const [expanded, setExpanded] = useState(index === 0)
  const colors = scoreColor(item.score || 0)

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-start gap-3 min-w-0">
          <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${colors.bg} ${colors.text}`}>
            {index + 1}
          </span>
          <p className="text-white text-sm font-medium leading-relaxed">{item.questionText}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <span className={`text-sm font-semibold ${colors.text}`}>{item.score}/10</span>
          <HiChevronDown className={`text-white/40 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-0 space-y-4 border-t border-white/[0.06]">
          <div className="pt-4">
            <p className="text-white/40 text-xs font-medium mb-1.5">Your answer</p>
            <p className="text-white/70 text-sm leading-relaxed bg-white/[0.03] rounded-lg p-3">
              {item.userAnswer || <span className="italic text-white/30">No answer provided</span>}
            </p>
          </div>

          <div>
            <p className="text-white/40 text-xs font-medium mb-1.5">Feedback</p>
            <p className="text-white/70 text-sm leading-relaxed">{item.feedback}</p>
          </div>

          {item.idealAnswer && (
            <div>
              <p className="text-white/40 text-xs font-medium mb-1.5">Model answer</p>
              <p className="text-white/60 text-sm leading-relaxed bg-brand-500/[0.06] border border-brand-500/20 rounded-lg p-3">
                {item.idealAnswer}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const InterviewReport = () => {
  const { interviewId } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const reportRef = useRef(null)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await getInterviewReport(interviewId)
        setReport(res.data.interview || res.data)
      } catch (err) {
        toast.error('Could not load report')
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [interviewId])

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#05050a',
        scale: 2,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      let heightLeft = pdfHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
      heightLeft -= pdf.internal.pageSize.getHeight()

      while (heightLeft > 0) {
        position -= pdf.internal.pageSize.getHeight()
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
        heightLeft -= pdf.internal.pageSize.getHeight()
      }

      pdf.save(`interview-report-${interviewId}.pdf`)
      toast.success('Report downloaded')
    } catch (err) {
      toast.error('Could not generate PDF')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="skeleton h-48 w-full" />
          <div className="skeleton h-24 w-full" />
          <div className="skeleton h-24 w-full" />
        </div>
      </DashboardLayout>
    )
  }

  if (!report) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-white/50">Report not found.</p>
          <Link to="/dashboard" className="text-brand-300 hover:text-brand-200 text-sm mt-2 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const colors = scoreColor(report.score || 0)

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header actions */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard" className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors">
            <HiHome className="text-sm" /> Dashboard
          </Link>
          <motion.button
            onClick={handleDownloadPDF}
            disabled={downloading}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary text-sm !py-2 !px-4"
          >
            {downloading ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <HiArrowDownTray className="text-base" />
            )}
            Download PDF
          </motion.button>
        </div>

        <div ref={reportRef} className="space-y-6 p-1">
          {/* Score summary */}
          <div className="glass-card p-8">
            <div className="grid sm:grid-cols-2 gap-8 items-center">
              <div className="text-center sm:text-left order-2 sm:order-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 text-brand-300 text-xs font-medium mb-3 capitalize">
                  <HiSparkles className="text-xs" /> {report.topic} · {report.difficulty}
                </span>
                <h1 className="font-display text-2xl font-bold text-white mb-2">Interview Report</h1>
                <p className="text-white/50 text-sm">
                  {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  {' · '}{report.questions?.length || 0} questions
                </p>
                <p className={`inline-block mt-4 px-3 py-1 rounded-lg text-sm font-medium ${colors.bg} ${colors.text}`}>
                  {report.overallRating || (report.score >= 70 ? 'Strong performance' : report.score >= 40 ? 'Good effort — room to grow' : 'Needs more practice')}
                </p>
              </div>
              <div className="order-1 sm:order-2">
                <ScoreRing score={report.score || 0} />
              </div>
            </div>
          </div>

          {/* Strengths & weak areas */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <HiArrowTrendingUp className="text-accent-teal text-lg" />
                <h3 className="font-display font-semibold text-white">Strong areas</h3>
              </div>
              <ul className="space-y-2.5">
                {(report.strengths?.length ? report.strengths : ['Not enough data yet']).map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                    <HiCheckCircle className="text-accent-teal text-base shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <HiArrowTrendingDown className="text-accent-rose text-lg" />
                <h3 className="font-display font-semibold text-white">Weak areas</h3>
              </div>
              <ul className="space-y-2.5">
                {(report.weakAreas?.length ? report.weakAreas : ['Not enough data yet']).map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                    <HiXCircle className="text-accent-rose text-base shrink-0 mt-0.5" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Overall feedback */}
          {report.feedback && (
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-white mb-3">Overall feedback</h3>
              <p className="text-white/60 text-sm leading-relaxed">{report.feedback}</p>
            </div>
          )}

          {/* Per-question breakdown */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Question-by-question breakdown</h3>
            <div className="space-y-3">
              {(report.questions || []).map((item, i) => (
                <QuestionFeedback key={i} item={item} index={i} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Link to="/interview/setup" className="btn-primary">
            Practice again
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default InterviewReport