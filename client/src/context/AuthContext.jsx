import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // On app load, check if a token exists and validate it against the profile route
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (storedToken && storedUser) {
        try {
          // Optimistically set from localStorage first for instant UI
          setUser(JSON.parse(storedUser))
          setToken(storedToken)

          // Then verify token is still valid against backend
          const res = await api.get('/auth/profile')
          setUser(res.data.user || res.data)
        } catch (err) {
          // Token invalid or expired — clear everything
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
          setToken(null)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password })
      const { token: newToken, user: userData } = res.data

      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData))
      setToken(newToken)
      setUser(userData)

      toast.success(`Welcome back, ${userData.name}!`)
      navigate('/dashboard')
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.'
      toast.error(message)
      return { success: false, message }
    }
  }

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password })
      const { token: newToken, user: userData } = res.data

      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData))
      setToken(newToken)
      setUser(userData)

      toast.success('Account created successfully!')
      navigate('/dashboard')
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}