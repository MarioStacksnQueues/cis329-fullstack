import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setUser(data.session?.user ?? null)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let active = true

    if (!user) {
      setRole(null)
      setLoading(false)
      return
    }

    setLoading(true)
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          console.error('Role lookup failed:', error)
          setRole('customer')
        } else {
          setRole(data?.role ?? 'customer')
        }
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [user])

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signUp = (email, password) =>
    supabase.auth.signUp({ email, password })

  const signInWithOAuth = (provider) =>
    supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin }
    })

  const signOut = () => supabase.auth.signOut()

  const value = {
    user,
    role,
    loading,
    signIn,
    signUp,
    signInWithOAuth,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
