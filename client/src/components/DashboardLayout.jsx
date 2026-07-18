import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiSparkles,
  HiHome,
  HiPlusCircle,
  HiClock,
  HiUser,
  HiCog6Tooth,
  HiArrowRightOnRectangle,
  HiBars3,
  HiXMark,
  HiDocumentText,
  HiVideoCamera,
} from 'react-icons/hi2'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: HiHome },
  { to: '/interview/setup', label: 'Start Interview', icon: HiPlusCircle },
  { to: '/resume-review', label: 'Resume Review', icon: HiDocumentText },
  { to: '/video-feedback', label: 'Video Feedback', icon: HiVideoCamera },
  { to: '/history', label: 'History', icon: HiClock },
  { to: '/profile', label: 'Profile', icon: HiUser },
  { to: '/settings', label: 'Settings', icon: HiCog6Tooth },
]

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'

  const SidebarContent = () => (
    <>
      <Link to="/dashboard" className="flex items-center gap-2 px-6 h-16 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-glow-sm">
          <HiSparkles className="text-white text-sm" />
        </div>

        <span className="font-display font-bold text-lg text-white">
          PrepAI
        </span>
      </Link>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.to ||
            (item.to === '/interview/setup' &&
              location.pathname.startsWith('/interview'))

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                isActive
                  ? 'bg-brand-500/15 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-400 rounded-r-full"
                />
              )}

              <item.icon
                className={`text-lg ${isActive ? 'text-brand-300' : ''}`}
              />

              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/[0.06]">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-accent-rose hover:bg-accent-rose/10 transition-all duration-200"
        >
          <HiArrowRightOnRectangle className="text-lg" />
          Log out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r border-white/[0.06] bg-surface-900/50 backdrop-blur-xl fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />

            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 w-64 bg-surface-900 border-r border-white/[0.06] flex flex-col z-50 lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-5 right-4 text-white/40 hover:text-white"
              >
                <HiXMark className="text-xl" />
              </button>

              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/[0.06] bg-surface-950/70 backdrop-blur-xl sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <HiBars3 className="text-2xl" />
          </button>

          <div className="hidden lg:block" />

          {/* Profile */}
          <Link
            to="/profile"
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-semibold">
              {initials}
            </div>

            <span className="hidden sm:block text-sm font-medium text-white/80">
              {user?.name}
            </span>
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout