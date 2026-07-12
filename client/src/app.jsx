import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ForgotPassword from './pages/ForgotPassword'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import InterviewSetup from './pages/InterviewSetup'
import InterviewSession from './pages/InterviewSession'
import InterviewReport from './pages/InterviewReport'
import InterviewHistory from './pages/InterviewHistory'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import ResumeReview from './pages/ResumeReview'
import VideoInterviewFeedback from './pages/VideoInterviewFeedback'

function App() {
  const { loading } = useAuth()

  // While checking token validity on app load, show nothing (or a splash)
  // to avoid flashing the login page for already-authenticated users
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-sm font-body">Loading PrepAI...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/setup"
        element={
          <ProtectedRoute>
            <InterviewSetup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/session/:interviewId"
        element={
          <ProtectedRoute>
            <InterviewSession />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/report/:interviewId"
        element={
          <ProtectedRoute>
            <InterviewReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <InterviewHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
  path="/resume-review"
  element={
    <ProtectedRoute>
      <ResumeReview />
    </ProtectedRoute>
  }
/>
<Route
  path="/video-feedback"
  element={
    <ProtectedRoute>
      <VideoInterviewFeedback />
    </ProtectedRoute>
  }
/>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    
  )
}

export default App