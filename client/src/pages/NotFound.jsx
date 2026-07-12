import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiHome, HiSparkles, HiFaceFrown } from 'react-icons/hi2'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center px-6 relative overflow-hidden">
      <div className="blob w-96 h-96 bg-brand-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center relative z-10"
      >
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-6">
          <HiFaceFrown className="text-3xl text-white/30" />
        </div>

        <h1 className="font-display text-6xl sm:text-7xl font-bold text-gradient mb-3">404</h1>
        <p className="text-white text-lg font-medium mb-2">This page doesn't exist</p>
        <p className="text-white/40 text-sm mb-8 max-w-sm mx-auto">
          The page you're looking for might have been moved, or the link might be broken.
        </p>

        <Link to="/" className="btn-primary inline-flex">
          <HiHome />
          Back to home
        </Link>
      </motion.div>

      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 z-10">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
          <HiSparkles className="text-white text-sm" />
        </div>
        <span className="font-display font-bold text-white">PrepAI</span>
      </Link>
    </div>
  )
}

export default NotFound