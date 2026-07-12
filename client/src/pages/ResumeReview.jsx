import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiDocumentArrowUp, HiDocumentText, HiXMark, HiCheckCircle,
  HiXCircle, HiLightBulb, HiSparkles, HiArrowPath,
} from 'react-icons/hi2'
import DashboardLayout from '../components/DashboardLayout'
import { uploadResume } from '../services/resumeService'
import toast from 'react-hot-toast'

const ScoreGauge = ({ label, score }) => {
  const color = score >= 70 ? 'text-accent-teal' : score >= 40 ? 'text-accent-amber' : 'text-accent-rose'
  const ringColor = score >= 70 ? 'stroke-accent-teal' : score >= 40 ? 'stroke-accent-amber' : 'stroke-accent-rose'
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-white/[0.06]" />
          <motion.circle
            cx="48" cy="48" r={radius} fill="none" strokeWidth="8" strokeLinecap="round"
            className={ringColor}
            style={{ strokeDasharray: circumference }}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-display text-xl font-bold ${color}`}>{score}</span>
        </div>
      </div>
      <p className="text-white/50 text-xs mt-2 text-center">{label}</p>
    </div>
  )
}

const ResumeReview = () => {
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please upload a PDF file')
      return
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB')
      return
    }
    setFile(selectedFile)
    setResult(null)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files[0])
  }, [])

  const handleAnalyze = async () => {
    if (!file) return
    setIsAnalyzing(true)
    try {
      const res = await uploadResume(file)
      setResult(res.data.resume)
      toast.success('Resume analyzed!')
    } catch (err) {
      const message = err.response?.data?.message || 'Could not analyze resume. Please try again.'
      toast.error(message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Resume Review</h1>
          <p className="text-white/50 mt-1">Get AI feedback on your resume — ATS score, strengths, and specific improvements.</p>
        </div>

        {!result && !isAnalyzing && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`glass-card p-10 text-center border-2 border-dashed transition-all ${
              isDragging ? 'border-brand-400 bg-brand-500/[0.04]' : 'border-white/[0.1]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
              id="resume-upload"
            />

            {!file ? (
              <label htmlFor="resume-upload" className="cursor-pointer block">
                <div className="w-16 h-16 rounded-2xl bg-brand-500/15 flex items-center justify-center mx-auto mb-4">
                  <HiDocumentArrowUp className="text-3xl text-brand-300" />
                </div>
                <p className="text-white font-medium mb-1">Drop your resume here, or click to browse</p>
                <p className="text-white/40 text-sm">PDF only, up to 5MB</p>
              </label>
            ) : (
              <div>
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center shrink-0">
                    <HiDocumentText className="text-xl text-brand-300" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium text-sm truncate max-w-xs">{file.name}</p>
                    <p className="text-white/40 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button onClick={handleReset} className="text-white/30 hover:text-accent-rose transition-colors ml-2">
                    <HiXMark className="text-lg" />
                  </button>
                </div>
                <motion.button
                  onClick={handleAnalyze}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary"
                >
                  <HiSparkles />
                  Analyze Resume
                </motion.button>
              </div>
            )}
          </div>
        )}

        {isAnalyzing && (
          <div className="glass-card p-16 text-center">
            <div className="w-14 h-14 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h3 className="font-display text-xl font-bold text-white mb-2">Analyzing your resume...</h3>
            <p className="text-white/50 text-sm">Checking ATS compatibility, structure, and content quality.</p>
          </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Scores */}
              <div className="glass-card p-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-8">
                    <ScoreGauge label="ATS Score" score={result.atsScore ?? 0} />
                    <ScoreGauge label="Overall Quality" score={result.overallScore ?? 0} />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-white/70 text-sm leading-relaxed">{result.summary}</p>
                  </div>
                </div>
              </div>

              {/* Strengths & weaknesses */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="glass-card p-6">
                  <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                    <HiCheckCircle className="text-accent-teal" /> Strengths
                  </h3>
                  <ul className="space-y-2.5">
                    {result.strengths?.map((s, i) => (
                      <li key={i} className="text-white/60 text-sm flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-accent-teal mt-2 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass-card p-6">
                  <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                    <HiXCircle className="text-accent-rose" /> Weaknesses
                  </h3>
                  <ul className="space-y-2.5">
                    {result.weaknesses?.map((w, i) => (
                      <li key={i} className="text-white/60 text-sm flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-accent-rose mt-2 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Missing keywords */}
              {result.missingKeywords?.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="font-display font-semibold text-white mb-4">Missing keywords to consider</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map((kw, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Section feedback */}
              {result.sectionFeedback?.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="font-display font-semibold text-white mb-4">Section-by-section feedback</h3>
                  <div className="space-y-4">
                    {result.sectionFeedback.map((sf, i) => (
                      <div key={i} className="pb-4 border-b border-white/[0.06] last:border-0 last:pb-0">
                        <p className="text-brand-300 text-sm font-medium mb-1">{sf.section}</p>
                        <p className="text-white/60 text-sm leading-relaxed">{sf.feedback}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions?.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                    <HiLightBulb className="text-accent-amber" /> Suggestions
                  </h3>
                  <ul className="space-y-2.5">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="text-white/60 text-sm flex items-start gap-2">
                        <span className="text-accent-amber font-semibold shrink-0">{i + 1}.</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-center">
                <button onClick={handleReset} className="btn-secondary">
                  <HiArrowPath /> Analyze another resume
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}

export default ResumeReview