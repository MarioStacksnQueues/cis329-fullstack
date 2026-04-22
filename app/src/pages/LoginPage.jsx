import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage() {
  const { signIn, signInWithOAuth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setPending(true)
    setError(null)

    const { error: signInError } = await signIn(email, password)
    setPending(false)

    if (signInError) {
      console.error('Sign-in failed:', signInError)
      setError(signInError.message)
      return
    }

    navigate(redirectTo, { replace: true })
  }

  const handleGoogle = async () => {
    setError(null)
    const { error: oauthError } = await signInWithOAuth('google')
    if (oauthError) {
      console.error('Google sign-in failed:', oauthError)
      setError(oauthError.message)
    }
  }

  return (
    <section className="page page--narrow">
      <h1>Sign in</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="inline-msg inline-msg--error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn--primary" disabled={pending}>
          {pending ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="auth-divider" aria-hidden="true">or</div>

      <button type="button" className="btn btn--outline" onClick={handleGoogle}>
        Sign in with Google
      </button>

      <p className="auth-foot">
        New here? <Link to="/signup">Create an account</Link>
      </p>
    </section>
  )
}
