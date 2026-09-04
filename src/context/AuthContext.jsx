import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiLogin, apiRegister, apiRegisterAdmin, apiGetMe } from '../utils/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing token on mount
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('bamzy_token')
    if (!token) {
      setIsLoading(false)
      return
    }
    try {
      const userData = await apiGetMe()
      setUser(userData)
    } catch {
      localStorage.removeItem('bamzy_token')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  async function login(email, password) {
    const result = await apiLogin({ email, password })
    localStorage.setItem('bamzy_token', result.token)
    setUser(result.user)
    return result.user
  }

  async function register(full_name, email, password, phone, role, avatar_url) {
    const result = await apiRegister({ full_name, email, password, phone, role, avatar_url })
    localStorage.setItem('bamzy_token', result.token)
    setUser(result.user)
    return result.user
  }

  async function registerAdmin(full_name, email, password, phone, avatar_url) {
    const result = await apiRegisterAdmin({ full_name, email, password, phone, avatar_url })
    localStorage.setItem('bamzy_token', result.token)
    setUser(result.user)
    return result.user
  }

  function logout() {
    localStorage.removeItem('bamzy_token')
    localStorage.removeItem('bamzy_remembered_email')
    setUser(null)
  }

  function updateUser(userData) {
    setUser((prev) => ({ ...prev, ...userData }))
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    registerAdmin,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
