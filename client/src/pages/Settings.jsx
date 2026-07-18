import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  HiMicrophone,
  HiVideoCamera,
  HiClock,
  HiExclamationTriangle,
} from 'react-icons/hi2'
import DashboardLayout from '../components/DashboardLayout'
import toast from 'react-hot-toast'

const ToggleRow = ({ icon: Icon, title, desc, checked, onChange }) => (
  <div className="flex items-center justify-between py-4">
    <div className="flex items-start gap-3 min-w-0">
      <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="text-white/50 text-base" />
      </div>

      <div className="min-w-0">
        <p className="text-white text-sm font-medium">{title}</p>
        <p className="text-white/40 text-xs mt-0.5 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>

    <button
      onClick={() => onChange(!checked)}
      className={`shrink-0 w-11 h-6 rounded-full relative transition-colors duration-200 ${
        checked ? 'bg-brand-500' : 'bg-white/[0.1]'
      }`}
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
  const [preferences, setPreferences] = useState({
    autoMic: false,
    autoWebcam: false,
  })

  const [defaultDuration, setDefaultDuration] = useState(120)

  const updatePreference = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSaveAll = () => {
    toast.success('Preferences saved successfully!')
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white">
            Settings
          </h1>

          <p className="text-white/50 mt-2">
            Customize your interview experience.
          </p>
        </div>

        {/* Interview Preferences */}

        <div className="glass-card p-6 mb-6">

          <h2 className="font-display font-semibold text-white mb-1">
            Interview Preferences
          </h2>

          <p className="text-white/40 text-xs mb-2">
            Default options for every interview.
          </p>

          <div className="divide-y divide-white/[0.06]">

            <ToggleRow
              icon={HiMicrophone}
              title="Auto-enable Microphone"
              desc="Automatically turn on the microphone before every interview."
              checked={preferences.autoMic}
              onChange={(v) => updatePreference('autoMic', v)}
            />

            <ToggleRow
              icon={HiVideoCamera}
              title="Auto-enable Camera"
              desc="Automatically turn on the webcam before every interview."
              checked={preferences.autoWebcam}
              onChange={(v) => updatePreference('autoWebcam', v)}
            />

          </div>

          <div className="pt-5">

            <div className="flex items-center gap-3 mb-4">

              <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center">
                <HiClock className="text-white/50" />
              </div>

              <div>
                <p className="text-white text-sm font-medium">
                  Default Time per Question
                </p>

                <p className="text-white/40 text-xs">
                  Choose how much time you want for each interview question.
                </p>
              </div>

            </div>

            <div className="flex gap-2 flex-wrap">

              {[60, 120, 180, 300].map((seconds) => (

                <button
                  key={seconds}
                  onClick={() => setDefaultDuration(seconds)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    defaultDuration === seconds
                      ? 'bg-brand-500 text-white'
                      : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.08]'
                  }`}
                >
                  {seconds / 60} min
                </button>

              ))}

            </div>

          </div>

        </div>

        <button
          onClick={handleSaveAll}
          className="btn-primary w-full"
        >
          Save Preferences
        </button>

        {/* Danger Zone */}

        <div className="glass-card p-6 mt-8 border border-accent-rose/20">

          <div className="flex items-center gap-2 mb-2">

            <HiExclamationTriangle className="text-accent-rose text-lg" />

            <h2 className="font-display font-semibold text-white">
              Danger Zone
            </h2>

          </div>

          <p className="text-white/40 text-sm mb-4">
            Account deletion is not available yet.
          </p>

          <button
            onClick={() =>
              toast('This feature will be available in a future update.', {
                icon: '⚠️',
              })
            }
            className="text-accent-rose hover:text-accent-rose/80 font-medium"
          >
            Delete Account
          </button>

        </div>

      </div>
    </DashboardLayout>
  )
}

export default Settings