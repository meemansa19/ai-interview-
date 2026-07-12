import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  HiUser, HiEnvelope, HiLockClosed, HiCheck, HiPencil,
  HiEye, HiEyeSlash, HiCalendarDays, HiTrophy,
} from 'react-icons/hi2'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import { updateProfile, changePassword } from '../services/userService'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateUser } = useAuth()

  // Profile edit state
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [savingProfile, setSavingProfile] = useState(false)

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({ current: '', next: '', confirm: '' })
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false })
  const [savingPassword, setSavingPassword] = useState(false)
  const [pwErrors, setPwErrors] = useState({})

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty')
      return
    }
    setSavingProfile(true)
    try {
      const res = await updateProfile({ name: name.trim() })
      updateUser(res.data.user || { ...user, name: name.trim() })
      toast.success('Profile updated')
      setIsEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordChange = async () => {
    const errors = {}
    if (!passwordData.current) errors.current = 'Required'
    if (!passwordData.next || passwordData.next.length < 8) errors.next = 'Must be at least 8 characters'
    if (passwordData.confirm !== passwordData.next) errors.confirm = 'Passwords do not match'
    setPwErrors(errors)
    if (Object.keys(errors).length) return

    setSavingPassword(true)
    try {
      await changePassword({
        currentPassword: passwordData.current,
        newPassword: passwordData.next,
      })
      toast.success('Password changed successfully')
      setPasswordData({ current: '', next: '', confirm: '' })
      setShowPasswordForm(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not change password. Check your current password.')
    } finally {
      setSavingPassword(false)
    }
  }

  const initials = user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'U'

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Profile</h1>
          <p className="text-white/50 mt-1">Manage your account details and security.</p>
        </div>

        {/* Profile card */}
        <div className="glass-card p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-xl font-semibold text-white shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-lg truncate">{user?.name}</p>
              <p className="text-white/40 text-sm truncate flex items-center gap-1.5">
                <HiEnvelope className="text-xs" /> {user?.email}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Full name</label>
              {isEditing ? (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field pl-11"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="btn-primary !px-4"
                    aria-label="Save name"
                  >
                    {savingProfile ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <HiCheck />
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between input-field !bg-white/[0.02]">
                  <span className="text-white/80">{user?.name}</span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-white/40 hover:text-brand-300 transition-colors"
                    aria-label="Edit name"
                  >
                    <HiPencil className="text-sm" />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Email address</label>
              <div className="input-field !bg-white/[0.02] text-white/50 flex items-center justify-between">
                <span>{user?.email}</span>
                <span className="text-xs text-white/25">Cannot be changed</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-white/50">
                <HiCalendarDays className="text-white/30" />
                Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Change password */}
        <div className="glass-card p-6 sm:p-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HiLockClosed className="text-white/50" />
              <h2 className="font-display font-semibold text-white">Password</h2>
            </div>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="text-brand-300 hover:text-brand-200 text-sm font-medium transition-colors"
              >
                Change password
              </button>
            )}
          </div>

          {!showPasswordForm ? (
            <p className="text-white/40 text-sm">••••••••••••</p>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 pt-4"
            >
              {[
                { key: 'current', label: 'Current password', autoComplete: 'current-password' },
                { key: 'next', label: 'New password', autoComplete: 'new-password' },
                { key: 'confirm', label: 'Confirm new password', autoComplete: 'new-password' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-white/70 mb-2">{field.label}</label>
                  <div className="relative">
                    <input
                      type={showPw[field.key] ? 'text' : 'password'}
                      value={passwordData[field.key]}
                      onChange={(e) => {
                        setPasswordData((prev) => ({ ...prev, [field.key]: e.target.value }))
                        if (pwErrors[field.key]) setPwErrors((prev) => ({ ...prev, [field.key]: undefined }))
                      }}
                      autoComplete={field.autoComplete}
                      className={`input-field pr-11 ${pwErrors[field.key] ? 'border-accent-rose/60' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((prev) => ({ ...prev, [field.key]: !prev[field.key] }))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                    >
                      {showPw[field.key] ? <HiEyeSlash className="text-lg" /> : <HiEye className="text-lg" />}
                    </button>
                  </div>
                  {pwErrors[field.key] && <p className="text-accent-rose text-xs mt-1.5">{pwErrors[field.key]}</p>}
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button onClick={handlePasswordChange} disabled={savingPassword} className="btn-primary flex-1">
                  {savingPassword ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Update password'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordForm(false)
                    setPasswordData({ current: '', next: '', confirm: '' })
                    setPwErrors({})
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Profile