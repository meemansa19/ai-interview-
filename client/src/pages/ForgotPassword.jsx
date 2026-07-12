import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiEnvelope, HiArrowRight, HiCheckCircle, HiArrowLeft } from 'react-icons/hi2'
import AuthLayout from '../components/AuthLayout'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email address')
      return
    }
    setError('')

    setIsSubmitting(true)
    // UI-only simulation — no backend email is actually sent, matching the
    // "Forgot Password (UI)" scope from the project spec. A real implementation
    // would POST to something like /auth/forgot-password with a reset-token flow.
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setIsSubmitting(false)
    setIsSent(true)
  }

  return (
    <AuthLayout
      title={isSent ? 'Check your email' : 'Reset your password'}
      subtitle={isSent ? '' : "Enter the email linked to your account and we'll send you a reset link."}
    >
      <AnimatePresence mode="wait">
        {!isSent ? (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5"
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                Email address
              </label>
              <div className="relative">
                <HiEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="you@example.com"
                  className={`input-field pl-11 ${error ? 'border-accent-rose/60' : ''}`}
                  autoComplete="email"
                />
              </div>
              {error && <p className="text-accent-rose text-xs mt-1.5">{error}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Sending link...
                </>
              ) : (
                <>
                  Send reset link
                  <HiArrowRight />
                </>
              )}
            </motion.button>
          </motion.form>
        ) : (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-4"
          >
            <div className="w-16 h-16 rounded-full bg-accent-teal/15 flex items-center justify-center mx-auto mb-5">
              <HiCheckCircle className="text-3xl text-accent-teal" />
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-1">
              If an account exists for
            </p>
            <p className="text-white font-medium mb-4">{email}</p>
            <p className="text-white/50 text-sm leading-relaxed">
              we've sent a link to reset your password. It may take a few minutes to arrive.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Link
        to="/login"
        className="flex items-center justify-center gap-1.5 text-white/50 hover:text-white text-sm mt-8 transition-colors"
      >
        <HiArrowLeft className="text-sm" />
        Back to login
      </Link>
    </AuthLayout>
  )
}

export default ForgotPassword
