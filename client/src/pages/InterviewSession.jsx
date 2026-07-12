import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Webcam from 'react-webcam'
import {
  HiMicrophone, HiStop, HiPause, HiPlay, HiArrowRight,
  HiVideoCamera, HiVideoCameraSlash, HiClock, HiCheckCircle,
} from 'react-icons/hi2'
import toast from 'react-hot-toast'
import {
  getInterviewById, submitAnswer, finalizeInterview,
} from '../services/interviewService'

const SECONDS_PER_QUESTION = 120 // 2 minutes per question — adjustable

const InterviewSession = () => {
  const { interviewId } = useParams()
  const navigate = useNavigate()

  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answerText, setAnswerText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION)
  const [webcamOn, setWebcamOn] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)

  const recognitionRef = useRef(null)
  const timerRef = useRef(null)
  const speechSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  // ── Load interview ────────────────────────────────────
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await getInterviewById(interviewId)
        setInterview(res.data.interview || res.data)
      } catch (err) {
        toast.error('Could not load interview')
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchInterview()
  }, [interviewId, navigate])

  // ── Timer ──────────────────────────────────────────────
  useEffect(() => {
    if (loading || isPaused) return

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleNext(true) // auto-advance when time runs out
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [loading, isPaused, currentIndex])

  // Reset timer when moving to a new question
  useEffect(() => {
    setTimeLeft(SECONDS_PER_QUESTION)
    setAnswerText('')
  }, [currentIndex])

  // ── Speech recognition ─────────────────────────────────
  const setupRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return null

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' '
        }
      }
      if (finalTranscript) {
        setAnswerText((prev) => (prev + ' ' + finalTranscript).trim())
      }
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        toast.error('Microphone permission denied. You can still type your answer.')
      }
      setIsRecording(false)
    }

    recognition.onend = () => setIsRecording(false)

    return recognition
  }, [])

  const toggleRecording = () => {
    if (!speechSupported) {
      toast.error('Voice input is not supported in this browser. Please type your answer.')
      return
    }

    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
    } else {
      recognitionRef.current = setupRecognition()
      recognitionRef.current?.start()
      setIsRecording(true)
    }
  }

  useEffect(() => {
    // Stop recognition when leaving the page
    return () => recognitionRef.current?.stop()
  }, [])

  // ── Navigation between questions ───────────────────────
  const questions = interview?.questions || []
  const totalQuestions = questions.length
  const isLastQuestion = currentIndex === totalQuestions - 1

  const handleNext = async (autoAdvance = false) => {
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
    }

    if (!answerText.trim() && !autoAdvance) {
      toast('You can skip, but answering gives you better feedback', { icon: '💡' })
    }

    setIsSubmitting(true)
    try {
      await submitAnswer(interviewId, {
        questionIndex: currentIndex,
        answerText: answerText.trim(),
      })

      if (isLastQuestion) {
        await handleFinish()
      } else {
        setCurrentIndex((prev) => prev + 1)
      }
    } catch (err) {
      toast.error('Could not save your answer. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFinish = async () => {
    setIsFinalizing(true)
    try {
      await finalizeInterview(interviewId)
      toast.success('Interview complete! Generating your report...')
      navigate(`/interview/report/${interviewId}`)
    } catch (err) {
      toast.error('Could not generate your report. Please try again.')
      setIsFinalizing(false)
    }
  }

  const togglePause = () => setIsPaused((prev) => !prev)

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // ── Render states ───────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isFinalizing) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-14 h-14 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="font-display text-xl font-bold text-white mb-2">Evaluating your answers...</h2>
          <p className="text-white/50 text-sm">Our AI is scoring your responses and preparing detailed feedback.</p>
        </div>
      </div>
    )
  }

  if (!totalQuestions) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center px-6">
        <p className="text-white/50">This interview has no questions available.</p>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const timeIsLow = timeLeft <= 20

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col">
      {/* Top bar — progress & timer */}
      <header className="border-b border-white/[0.06] px-4 sm:px-8 py-4 sticky top-0 bg-surface-950/80 backdrop-blur-xl z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2 text-xs text-white/40">
              <span>Question {currentIndex + 1} of {totalQuestions}</span>
              <span className="capitalize">{interview.topic} · {interview.difficulty}</span>
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-500 to-accent-teal rounded-full"
                animate={{ width: `${((currentIndex) / totalQuestions) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full glass-card shrink-0 ${timeIsLow ? 'border-accent-rose/50' : ''}`}>
            <HiClock className={`text-sm ${timeIsLow ? 'text-accent-rose' : 'text-white/50'}`} />
            <span className={`font-mono text-sm font-medium ${timeIsLow ? 'text-accent-rose' : 'text-white/80'}`}>
              {formatTime(timeLeft)}
            </span>
            <button
              onClick={togglePause}
              className="ml-1 text-white/40 hover:text-white transition-colors"
              aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
            >
              {isPaused ? <HiPlay className="text-sm" /> : <HiPause className="text-sm" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 sm:px-8 py-8">
        <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-6">
          {/* Question + answer */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="glass-card p-6 sm:p-8 mb-6">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-brand-500/15 text-brand-300 text-xs font-medium mb-4 capitalize">
                    {currentQuestion.type || interview.type || 'Technical'}
                  </span>
                  <h2 className="font-display text-xl sm:text-2xl font-semibold text-white leading-relaxed">
                    {currentQuestion.questionText || currentQuestion.text || currentQuestion}
                  </h2>
                </div>

                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-white/70">Your answer</p>
                    {speechSupported && (
                      <motion.button
                        onClick={toggleRecording}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isRecording
                            ? 'bg-accent-rose/20 text-accent-rose'
                            : 'bg-white/[0.06] text-white/60 hover:bg-white/[0.1]'
                        }`}
                      >
                        {isRecording ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-rose animate-pulse" />
                            <HiStop className="text-sm" /> Stop recording
                          </>
                        ) : (
                          <>
                            <HiMicrophone className="text-sm" /> Answer by voice
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>

                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Type your answer, or use voice input above..."
                    rows={8}
                    className="input-field resize-none font-body leading-relaxed"
                  />

                  {!speechSupported && (
                    <p className="text-white/30 text-xs mt-2">
                      Voice input isn't supported in this browser — try Chrome for the full experience.
                    </p>
                  )}
                </div>

                <div className="flex justify-end mt-6">
                  <motion.button
                    onClick={() => handleNext(false)}
                    disabled={isSubmitting}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : isLastQuestion ? (
                      <>Submit Interview <HiCheckCircle /></>
                    ) : (
                      <>Next Question <HiArrowRight /></>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Webcam panel */}
          <div className="lg:col-span-1">
            <div className="glass-card p-4 sticky top-28">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-white/70">Camera preview</p>
                <button
                  onClick={() => setWebcamOn((prev) => !prev)}
                  className="text-white/40 hover:text-white transition-colors"
                  aria-label={webcamOn ? 'Turn off camera' : 'Turn on camera'}
                >
                  {webcamOn ? <HiVideoCamera className="text-lg text-brand-300" /> : <HiVideoCameraSlash className="text-lg" />}
                </button>
              </div>

              <div className="aspect-video rounded-xl overflow-hidden bg-black/40 flex items-center justify-center">
                {webcamOn ? (
                  <Webcam
                    audio={false}
                    mirrored
                    className="w-full h-full object-cover"
                    onUserMediaError={() => {
                      toast.error('Could not access camera')
                      setWebcamOn(false)
                    }}
                  />
                ) : (
                  <div className="text-center px-4">
                    <HiVideoCameraSlash className="text-2xl text-white/20 mx-auto mb-2" />
                    <p className="text-white/30 text-xs">Camera is off</p>
                  </div>
                )}
              </div>
              <p className="text-white/30 text-xs mt-3 leading-relaxed">
                Optional — helps you review body language later. Nothing is uploaded; recording stays local to this session.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Pause overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-surface-950/90 backdrop-blur-md z-50 flex items-center justify-center"
          >
            <div className="text-center">
              <HiPause className="text-4xl text-white/40 mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-white mb-2">Interview paused</h3>
              <p className="text-white/50 text-sm mb-6">Take your time. Resume when you're ready.</p>
              <button onClick={togglePause} className="btn-primary">
                <HiPlay /> Resume
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default InterviewSession