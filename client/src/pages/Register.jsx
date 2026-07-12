import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiUser, HiEnvelope, HiLockClosed, HiEye, HiEyeSlash, HiArrowRight, HiCheck } from 'react-icons/hi2'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Password strength checks — used both for validation and the visual hint list
  const passwordChecks = {
    length: formData.password.length >= 8,
    number: /\d/.test(formData.password),
    letter: /[a-zA-Z]/.test(formData.password),
  }
  const isPasswordStrong = Object.values(passwordChecks).every(Boolean)

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (!isPasswordStrong) {
      newErrors.password = 'Password does not meet the requirements below'
    }

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    const result = await register(formData.name.trim(), formData.email, formData.password)
    setIsSubmitting(false)

    if (result.success) {
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start practicing — it's free."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Name field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-2">
            Full name
          </label>
          <div className="relative">
            <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg" />
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              className={`input-field pl-11 ${errors.name ? 'border-accent-rose/60' : ''}`}
              autoComplete="name"
            />
          </div>
          {errors.name && <p className="text-accent-rose text-xs mt-1.5">{errors.name}</p>}
        </div>

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
          <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2">
            Password
          </label>
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
              autoComplete="new-password"
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

          {/* Password strength checklist — only shows once user starts typing */}
          {formData.password.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {[
                { key: 'length', label: '8+ characters' },
                { key: 'letter', label: 'A letter' },
                { key: 'number', label: 'A number' },
              ].map((check) => (
                <span
                  key={check.key}
                  className={`text-xs flex items-center gap-1 ${
                    passwordChecks[check.key] ? 'text-accent-teal' : 'text-white/30'
                  }`}
                >
                  <HiCheck className={passwordChecks[check.key] ? 'opacity-100' : 'opacity-30'} />
                  {check.label}
                </span>
              ))}
            </div>
          )}
          {errors.password && <p className="text-accent-rose text-xs mt-1.5">{errors.password}</p>}
        </div>

        {/* Confirm password field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/70 mb-2">
            Confirm password
          </label>
          <div className="relative">
            <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className={`input-field pl-11 pr-11 ${errors.confirmPassword ? 'border-accent-rose/60' : ''}`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <HiEyeSlash className="text-lg" /> : <HiEye className="text-lg" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-accent-rose text-xs mt-1.5">{errors.confirmPassword}</p>}
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
              Creating account...
            </>
          ) : (
            <>
              Create account
              <HiArrowRight className="text-lg" />
            </>
          )}
        </motion.button>
      </form>

      <p className="text-center text-white/50 text-sm mt-8">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-300 hover:text-brand-200 font-medium transition-colors">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Register