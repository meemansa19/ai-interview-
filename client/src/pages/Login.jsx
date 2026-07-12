import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiEnvelope, HiLockClosed, HiEye, HiEyeSlash, HiArrowRight } from 'react-icons/hi2'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    // Clear the field's error as soon as the user starts correcting it
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    const result = await login(formData.email, formData.password)
    setIsSubmitting(false)

    if (result.success) {
      // Redirect to wherever the user was trying to go, or dashboard by default
      const redirectTo = location.state?.from?.pathname || '/dashboard'
      navigate(redirectTo, { replace: true })
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue your interview prep."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
            Email address
          </label>
          <div className="relative">
            <HiEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg" />
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`input-field pl-11 ${errors.email ? 'border-accent-rose/60' : ''}`}
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="text-accent-rose text-xs mt-1.5">{errors.email}</p>}
        </div>

        {/* Password field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-medium text-white/70">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs text-brand-300 hover:text-brand-200 transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`input-field pl-11 pr-11 ${errors.password ? 'border-accent-rose/60' : ''}`}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <HiEyeSlash className="text-lg" /> : <HiEye className="text-lg" />}
            </button>
          </div>
          {errors.password && <p className="text-accent-rose text-xs mt-1.5">{errors.password}</p>}
        </div>

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileTap={{ scale: 0.98 }}
          className="btn-primary w-full mt-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Logging in...
            </>
          ) : (
            <>
              Log in
              <HiArrowRight className="text-lg" />
            </>
          )}
        </motion.button>
      </form>

      <p className="text-center text-white/50 text-sm mt-8">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-300 hover:text-brand-200 font-medium transition-colors">
          Sign up for free
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Login