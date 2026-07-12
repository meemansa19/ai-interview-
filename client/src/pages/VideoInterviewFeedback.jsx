import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Webcam from 'react-webcam'
import {
  HiVideoCamera, HiStop, HiArrowUpTray, HiPlay, HiTrash,
  HiSparkles, HiChatBubbleBottomCenterText, HiFaceSmile,
  HiClock, HiArrowPath, HiMicrophone,
} from 'react-icons/hi2'
import DashboardLayout from '../components/DashboardLayout'
import { uploadVideoInterview, getVideoInterviewById } from '../services/videoService'
import toast from 'react-hot-toast'

const sampleQuestions = [
  'Tell me about yourself and your background.',
  'Describe a challenging project you worked on and how you handled it.',
  'Why do you want to work in this field?',
  'What is your biggest strength and weakness?',
  'Where do you see yourself in five years?',
]

const ScoreRing = ({ score }) => {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 70 ? 'stroke-accent-teal' : score >= 40 ? 'stroke-accent-amber' : 'stroke-accent-rose'
  const textColor = score >= 70 ? 'text-accent-teal' : score >= 40 ? 'text-accent-amber' : 'text-accent-rose'

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-white/[0.06]" />
        <motion.circle
          cx="60" cy="60" r={radius} fill="none" strokeWidth="10" strokeLinecap="round"
          className={color}
          style={{ strokeDasharray: circumference }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-display text-2xl font-bold ${textColor}`}>{score}</span>
        <span className="text-white/30 text-xs">/ 100</span>
      </div>
    </div>
  )
}

const VideoInterviewFeedback = () => {
  const [question, setQuestion] = useState('')
  const [mode, setMode] = useState(null) // 'record' | 'upload' | null
  const [webcamOn, setWebcamOn] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [videoInterviewId, setVideoInterviewId] = useState(null)
  const [result, setResult] = useState(null)
  const [isPolling, setIsPolling] = useState(false)

  const webcamRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const recordedChunksRef = useRef([])
  const timerRef = useRef(null)
  const pollRef = useRef(null)
  const fileInputRef = useRef(null)

  // ── Recording timer ────────────────────────────────────
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setRecordSeconds((prev) => prev + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isRecording])

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  // ── Recording controls ─────────────────────────────────
  const startRecording = useCallback(() => {
    if (!webcamRef.current?.stream) {
      toast.error('Camera not ready yet — please wait a moment')
      return
    }
    recordedChunksRef.current = []
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm'

    const recorder = new MediaRecorder(webcamRef.current.stream, { mimeType })
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data)
    }
    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: mimeType })
      setRecordedBlob(blob)
    }

    recorder.start()
    mediaRecorderRef.current = recorder
    setIsRecording(true)
    setRecordSeconds(0)
  }, [])

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  const discardRecording = () => {
    setRecordedBlob(null)
    setRecordSeconds(0)
  }

  // ── File upload ─────────────────────────────────────────
  const handleFileSelect = (file) => {
    if (!file) return
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video must be under 50MB')
      return
    }
    setUploadedFile(file)
  }

  // ── Submit ──────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!question.trim()) {
      toast.error('Please enter or select a question first')
      return
    }
    const videoToSend = recordedBlob || uploadedFile
    if (!videoToSend) {
      toast.error('Please record or upload a video first')
      return
    }

    setIsSubmitting(true)
    try {
      const fileToUpload = recordedBlob
        ? new File([recordedBlob], 'recorded-answer.webm', { type: recordedBlob.type })
        : uploadedFile

      const res = await uploadVideoInterview(
        fileToUpload,
        question.trim(),
        recordedBlob ? 'recorded' : 'upload'
      )

      setVideoInterviewId(res.data.videoInterview._id)
      toast.success('Video submitted — analyzing your delivery...')
      startPolling(res.data.videoInterview._id)
    } catch (err) {
      const message = err.response?.data?.message || 'Could not submit video. Please try again.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Polling for analysis completion ────────────────────
  const startPolling = (id) => {
    setIsPolling(true)
    pollRef.current = setInterval(async () => {
      try {
        const res = await getVideoInterviewById(id)
        const vi = res.data.videoInterview

        if (vi.status === 'completed') {
          clearInterval(pollRef.current)
          setIsPolling(false)
          setResult(vi)
          toast.success('Feedback ready!')
        } else if (vi.status === 'failed') {
          clearInterval(pollRef.current)
          setIsPolling(false)
          toast.error('Analysis failed. Please try again.')
        }
        // if still 'processing', keep polling
      } catch (err) {
        clearInterval(pollRef.current)
        setIsPolling(false)
        toast.error('Lost connection while checking results')
      }
    }, 4000)
  }

  useEffect(() => {
    return () => clearInterval(pollRef.current)
  }, [])

  const handleReset = () => {
    setQuestion('')
    setMode(null)
    setWebcamOn(false)
    setRecordedBlob(null)
    setUploadedFile(null)
    setRecordSeconds(0)
    setVideoInterviewId(null)
    setResult(null)
    setIsPolling(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const hasVideo = recordedBlob || uploadedFile

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Video Interview Feedback</h1>
          <p className="text-white/50 mt-1">Record or upload a video answer and get AI feedback on your delivery.</p>
        </div>

        {!result && !isPolling && (
          <div className="space-y-6">
            {/* Question input */}
            <div className="glass-card p-6">
              <p className="text-sm font-medium text-white/70 mb-3">Which question are you answering?</p>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your own, or pick a sample below..."
                className="input-field mb-3"
              />
              <div className="flex flex-wrap gap-2">
                {sampleQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuestion(q)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all text-left ${
                      question === q ? 'bg-brand-500 text-white' : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.08]'
                    }`}
                  >
                    {q.length > 40 ? q.slice(0, 40) + '...' : q}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode selector */}
            {!mode && (
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('record')}
                  className="glass-card-hover p-8 text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-brand-500/15 flex items-center justify-center mx-auto mb-4">
                    <HiVideoCamera className="text-2xl text-brand-300" />
                  </div>
                  <p className="text-white font-medium mb-1">Record with webcam</p>
                  <p className="text-white/40 text-xs">Answer live, right here</p>
                </button>
                <button
                  onClick={() => setMode('upload')}
                  className="glass-card-hover p-8 text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-accent-teal/15 flex items-center justify-center mx-auto mb-4">
                    <HiArrowUpTray className="text-2xl text-accent-teal" />
                  </div>
                  <p className="text-white font-medium mb-1">Upload a video</p>
                  <p className="text-white/40 text-xs">MP4, WebM, or MOV — up to 50MB</p>
                </button>
              </div>
            )}

            {/* Record mode */}
            {mode === 'record' && !recordedBlob && (
              <div className="glass-card p-6">
                <div className="aspect-video rounded-xl overflow-hidden bg-black/40 mb-4 relative">
                  <Webcam
                    ref={webcamRef}
                    audio
                    muted
                    onUserMedia={() => setWebcamOn(true)}
                    onUserMediaError={() => toast.error('Could not access camera/microphone')}
                    className="w-full h-full object-cover"
                  />
                  {isRecording && (
                    <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
                      <span className="w-2 h-2 rounded-full bg-accent-rose animate-pulse" />
                      <span className="text-white text-sm font-mono">{formatTime(recordSeconds)}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center gap-3">
                  {!isRecording ? (
                    <motion.button whileTap={{ scale: 0.96 }} onClick={startRecording} className="btn-primary" disabled={!webcamOn}>
                      <HiMicrophone /> Start Recording
                    </motion.button>
                  ) : (
                    <motion.button whileTap={{ scale: 0.96 }} onClick={stopRecording} className="btn-secondary !bg-accent-rose/15 !text-accent-rose !border-accent-rose/30">
                      <HiStop /> Stop Recording
                    </motion.button>
                  )}
                  <button onClick={() => setMode(null)} className="text-white/40 hover:text-white text-sm transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Recorded preview */}
            {recordedBlob && (
              <div className="glass-card p-6">
                <video src={URL.createObjectURL(recordedBlob)} controls className="w-full aspect-video rounded-xl bg-black mb-4" />
                <div className="flex items-center justify-center gap-3">
                  <button onClick={discardRecording} className="btn-secondary !text-accent-rose">
                    <HiTrash /> Discard & retry
                  </button>
                </div>
              </div>
            )}

            {/* Upload mode */}
            {mode === 'upload' && !uploadedFile && (
              <div className="glass-card p-10 text-center border-2 border-dashed border-white/[0.1]">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer block">
                  <div className="w-16 h-16 rounded-2xl bg-accent-teal/15 flex items-center justify-center mx-auto mb-4">
                    <HiArrowUpTray className="text-3xl text-accent-teal" />
                  </div>
                  <p className="text-white font-medium mb-1">Click to select a video</p>
                  <p className="text-white/40 text-sm">MP4, WebM, or MOV — up to 50MB</p>
                </label>
                <button onClick={() => setMode(null)} className="text-white/40 hover:text-white text-sm mt-4 transition-colors">
                  Cancel
                </button>
              </div>
            )}

            {uploadedFile && (
              <div className="glass-card p-6">
                <video src={URL.createObjectURL(uploadedFile)} controls className="w-full aspect-video rounded-xl bg-black mb-4" />
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => { setUploadedFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }} className="btn-secondary !text-accent-rose">
                    <HiTrash /> Remove & retry
                  </button>
                </div>
              </div>
            )}

            {/* Submit */}
            {hasVideo && (
              <div className="flex justify-center">
                <motion.button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <HiSparkles />
                  )}
                  Get AI Feedback
                </motion.button>
              </div>
            )}
          </div>
        )}

        {/* Polling / processing state */}
        {isPolling && (
          <div className="glass-card p-16 text-center">
            <div className="w-14 h-14 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h3 className="font-display text-xl font-bold text-white mb-2">Analyzing your delivery...</h3>
            <p className="text-white/50 text-sm max-w-sm mx-auto">
              Our AI is watching your video for communication clarity, confidence, and pacing. This can take up to a minute.
            </p>
          </div>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="glass-card p-8 text-center">
                <ScoreRing score={result.overallScore ?? 0} />
                <p className="text-white/70 text-sm leading-relaxed max-w-md mx-auto mt-4">{result.summary}</p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: HiChatBubbleBottomCenterText, label: 'Communication', text: result.communicationFeedback },
                  { icon: HiFaceSmile, label: 'Confidence', text: result.confidenceFeedback },
                  { icon: HiClock, label: 'Pacing', text: result.paceFeedback },
                ].map((card) => (
                  <div key={card.label} className="glass-card p-5">
                    <card.icon className="text-brand-300 text-xl mb-3" />
                    <p className="text-white font-medium text-sm mb-2">{card.label}</p>
                    <p className="text-white/50 text-xs leading-relaxed">{card.text}</p>
                  </div>
                ))}
              </div>

              {result.fillerWordCount != null && (
                <div className="glass-card p-5 flex items-center justify-between">
                  <span className="text-white/60 text-sm">Estimated filler words used</span>
                  <span className="font-display font-bold text-white text-lg">{result.fillerWordCount}</span>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="glass-card p-6">
                  <h3 className="font-display font-semibold text-white mb-3">Strengths</h3>
                  <ul className="space-y-2">
                    {result.strengths?.map((s, i) => (
                      <li key={i} className="text-white/60 text-sm flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-accent-teal mt-2 shrink-0" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card p-6">
                  <h3 className="font-display font-semibold text-white mb-3">Areas to improve</h3>
                  <ul className="space-y-2">
                    {result.improvements?.map((imp, i) => (
                      <li key={i} className="text-white/60 text-sm flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-accent-rose mt-2 shrink-0" /> {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {result.transcript && (
                <div className="glass-card p-6">
                  <h3 className="font-display font-semibold text-white mb-3">What you said</h3>
                  <p className="text-white/50 text-sm leading-relaxed italic">{result.transcript}</p>
                </div>
              )}

              <div className="flex justify-center">
                <button onClick={handleReset} className="btn-secondary">
                  <HiArrowPath /> Try another question
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}

export default VideoInterviewFeedback