"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface User {
  id: string
  username: string
  namaLengkap: string
  ruangan: string
  kdruangan: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const userData: User = {
            id: result.user.id,
            username: result.user.username,
            namaLengkap: result.user.namaLengkap,
            ruangan: result.user.ruangan,
            kdruangan: result.user.kdruangan,
          }
          
          setUser(userData)
          localStorage.setItem("user", JSON.stringify(userData))
          setIsLoading(false)
          return true
        }
      }
    } catch (error) {
      console.error("Login error:", error)
    }
    
    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}