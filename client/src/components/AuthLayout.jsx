import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiSparkles, HiArrowLeft } from 'react-icons/hi2'

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-surface-950 flex overflow-hidden relative">
      {/* Back to home — top left, always visible */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-30 flex items-center gap-1.5 px-3.5 py-2 rounded-full glass-card text-white/60 hover:text-white text-xs font-medium transition-colors"
      >
        <HiArrowLeft className="text-sm" />
        Back to homepage
      </Link>

      {/* Left panel — AI visual identity */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-surface-900">
        {/* Ambient gradient blobs */}
        <div className="blob w-[420px] h-[420px] bg-brand-600 top-[-10%] left-[-15%]" />
        <div className="blob w-[380px] h-[380px] bg-accent-teal bottom-[-15%] right-[-10%]" style={{ animationDelay: '5s' }} />

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid-pattern opacity-40" />

        {/* Central AI robot graphic */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative w-80 h-80 flex items-center justify-center mb-8"
          >
            {/* Rotating outer rings, sit behind the robot */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-brand-400/15"
              style={{ borderStyle: 'dashed' }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-10 rounded-full border border-accent-teal/15"
            />

            {/* Radial glow behind the robot */}
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-brand-500/30 to-accent-teal/20 blur-3xl" />

            {/* Orbiting particles */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
            >
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-accent-teal shadow-glow-sm" />
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 13, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
            >
              <span className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-brand-300 shadow-glow-sm" />
            </motion.div>

            {/* Robot illustration — floats gently */}
            <motion.svg
              viewBox="0 0 240 240"
              className="relative w-56 h-56 animate-float"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="botHead" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a893ff" />
                  <stop offset="100%" stopColor="#2dd4bf" />
                </linearGradient>
                <linearGradient id="botBody" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#25253a" />
                  <stop offset="100%" stopColor="#12121e" />
                </linearGradient>
              </defs>

              {/* Antenna */}
              <line x1="120" y1="28" x2="120" y2="46" stroke="#8a67ff" strokeWidth="3" strokeLinecap="round" />
              <circle cx="120" cy="22" r="7" fill="url(#botHead)" />

              {/* Head */}
              <rect x="70" y="46" width="100" height="78" rx="26" fill="url(#botBody)" stroke="#8a67ff" strokeOpacity="0.4" strokeWidth="1.5" />

              {/* Visor */}
              <rect x="86" y="70" width="68" height="32" rx="16" fill="#05050a" />
              {/* Eyes */}
              <motion.circle
                cx="107" cy="86" r="7" fill="url(#botHead)"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.circle
                cx="133" cy="86" r="7" fill="url(#botHead)"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
              />

              {/* Ear nodes */}
              <circle cx="64" cy="85" r="8" fill="url(#botBody)" stroke="#2dd4bf" strokeOpacity="0.5" strokeWidth="1.5" />
              <circle cx="176" cy="85" r="8" fill="url(#botBody)" stroke="#2dd4bf" strokeOpacity="0.5" strokeWidth="1.5" />

              {/* Neck */}
              <rect x="110" y="122" width="20" height="14" fill="#1a1a2a" />

              {/* Body */}
              <rect x="58" y="136" width="124" height="80" rx="22" fill="url(#botBody)" stroke="#8a67ff" strokeOpacity="0.35" strokeWidth="1.5" />

              {/* Chest core — pulses like a heartbeat/processor */}
              <motion.circle
                cx="120" cy="172" r="16" fill="none" stroke="url(#botHead)" strokeWidth="3"
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <circle cx="120" cy="172" r="7" fill="url(#botHead)" />

              {/* Chest panel lines */}
              <line x1="78" y1="196" x2="98" y2="196" stroke="#2dd4bf" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" />
              <line x1="142" y1="196" x2="162" y2="196" stroke="#8a67ff" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" />
            </motion.svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display text-3xl xl:text-4xl font-bold text-white text-center leading-tight px-8"
          >
            Your AI interview<br />
            <span className="text-gradient">coach, on demand.</span>
          </motion.h1>
        </div>
      </div>

      {/* Right panel — floating form card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-surface-950">
        <div className="blob w-72 h-72 bg-brand-600 top-[-15%] right-[-15%] opacity-10" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md relative z-10 glass-card p-8 sm:p-10 shadow-glass"
        >
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <HiSparkles className="text-white text-sm" />
            </div>
            <span className="font-display font-bold text-lg text-white">PrepAI</span>
          </Link>

          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">{title}</h2>
          <p className="text-white/50 mb-8">{subtitle}</p>

          {children}
        </motion.div>
      </div>
    </div>
  )
}

export default AuthLayout