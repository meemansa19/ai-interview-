import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  HiMoon, HiSun, HiBell, HiMicrophone, HiVideoCamera,
  HiClock, HiExclamationTriangle,
} from 'react-icons/hi2'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const ToggleRow = ({ icon: Icon, title, desc, checked, onChange }) => (
  <div className="flex items-center justify-between py-4">
    <div className="flex items-start gap-3 min-w-0">
      <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="text-white/50 text-base" />
      </div>
      <div className="min-w-0">
        <p className="text-white text-sm font-medium">{title}</p>
        <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`shrink-0 w-11 h-6 rounded-full relative transition-colors duration-200 ${
        checked ? 'bg-brand-500' : 'bg-white/[0.1]'
      }`}
      role="switch"
      aria-checked={checked}
      aria-label={title}
    >
      <motion.span
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
        animate={{ left: checked ? '22px' : '4px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  </div>
)

const Settings = () => {
  const { user } = useAuth()

  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'))
  const [notifications, setNotifications] = useState({
    reminders: true,
    weeklyDigest: true,
    tips: false,
  })
  const [preferences, setPreferences] = useState({
    autoMic: false,
    autoWebcam: false,
  })
  const [defaultDuration, setDefaultDuration] = useState(120)

  const toggleTheme = (checked) => {
    document.documentElement.classList.toggle('dark', checked)
    setIsDark(checked)
    toast.success(checked ? 'Dark mode on' : 'Light mode on')
  }

  const updateNotification = (key, value) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
  }

  const updatePreference = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  // Settings here are stored client-side only for now (no backend persistence yet).
  // Flagged clearly to the user rather than pretending they're saved permanently.
  const handleSaveAll = () => {
    toast.success('Preferences saved for this session')
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Settings</h1>
          <p className="text-white/50 mt-1">Customize how PrepAI works for you.</p>
        </div>

        {/* Appearance */}
        <div className="glass-card p-6 mb-5">
          <h2 className="font-display font-semibold text-white mb-1">Appearance</h2>
          <p className="text-white/40 text-xs mb-2">Choose how PrepAI looks on your device.</p>
          <div className="divide-y divide-white/[0.06]">
            <ToggleRow
              icon={isDark ? HiMoon : HiSun}
              title="Dark mode"
              desc="Use a dark theme across the whole app."
              checked={isDark}
              onChange={toggleTheme}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card p-6 mb-5">
          <h2 className="font-display font-semibold text-white mb-1">Notifications</h2>
          <p className="text-white/40 text-xs mb-2">Control what PrepAI reaches out to you about.</p>
          <div className="divide-y divide-white/[0.06]">
            <ToggleRow
              icon={HiBell}
              title="Practice reminders"
              desc="Get nudged if you haven't practiced in a few days."
              checked={notifications.reminders}
              onChange={(v) => updateNotification('reminders', v)}
            />
            <ToggleRow
              icon={HiBell}
              title="Weekly progress digest"
              desc="A summary of your interviews and score trend, once a week."
              checked={notifications.weeklyDigest}
              onChange={(v) => updateNotification('weeklyDigest', v)}
            />
            <ToggleRow
              icon={HiBell}
              title="Tips & feature updates"
              desc="Occasional tips on getting more out of your practice sessions."
              checked={notifications.tips}
              onChange={(v) => updateNotification('tips', v)}
            />
          </div>
        </div>

        {/* Interview preferences */}
        <div className="glass-card p-6 mb-5">
          <h2 className="font-display font-semibold text-white mb-1">Interview defaults</h2>
          <p className="text-white/40 text-xs mb-2">Applied automatically when you start a new session.</p>
          <div className="divide-y divide-white/[0.06]">
            <ToggleRow
              icon={HiMicrophone}
              title="Auto-enable microphone"
              desc="Start voice recording automatically for each new question."
              checked={preferences.autoMic}
              onChange={(v) => updatePreference('autoMic', v)}
            />
            <ToggleRow
              icon={HiVideoCamera}
              title="Auto-enable camera"
              desc="Turn on webcam preview as soon as a session starts."
              checked={preferences.autoWebcam}
              onChange={(v) => updatePreference('autoWebcam', v)}
            />
          </div>

          <div className="pt-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                <HiClock className="text-white/50 text-base" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Time per question</p>
                <p className="text-white/40 text-xs">How long you get to answer each question.</p>
              </div>
            </div>
            <div className="flex gap-2">
              {[60, 120, 180, 300].map((seconds) => (
                <button
                  key={seconds}
                  onClick={() => setDefaultDuration(seconds)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    defaultDuration === seconds
                      ? 'bg-brand-500 text-white'
                      : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.08]'
                  }`}
                >
                  {seconds / 60} min
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={handleSaveAll} className="btn-primary w-full">
          Save preferences
        </button>

        {/* Danger zone */}
        <div className="glass-card p-6 mt-8 border-accent-rose/20">
          <div className="flex items-center gap-2 mb-1">
            <HiExclamationTriangle className="text-accent-rose text-lg" />
            <h2 className="font-display font-semibold text-white">Danger zone</h2>
          </div>
          <p className="text-white/40 text-xs mb-4">These actions are permanent and cannot be undone.</p>
          <button
            onClick={() => toast('Account deletion isn\'t available yet — reach out if you need this.', { icon: '⚠️' })}
            className="text-accent-rose text-sm font-medium hover:text-accent-rose/80 transition-colors"
          >
            Delete account
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Settings