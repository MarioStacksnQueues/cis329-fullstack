import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function SignupPage() {
  const { signUp, signInWithOAuth } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setPending(true)
    setError(null)

    const { data, error: signUpError } = await signUp(email, password)
    setPending(false)

    if (signUpError) {
      console.error('Sign-up failed:', signUpError)
      setError(signUpError.message)
      return
    }

    // If email confirmation is off in Supabase, signUp returns a live session and
    // we can drop the user straight into the app. Otherwise there's no session
    // yet and we have to tell them to check their inbox.
    if (data?.session) {
      navigate('/', { replace: true })
      return
    }
    setDone(true)
  }

  const handleGoogle = async () => {
    setError(null)
    const { error: oauthError } = await signInWithOAuth('google')
    if (oauthError) {
      console.error('Google sign-in failed:', oauthError)
      setError(oauthError.message)
    }
  }

  if (done) {
    return (
      <section className="page page--narrow">
        <h1>Check your email</h1>
        <p>
          We sent a confirmation link to <strong>{email}</strong>. Click it to finish creating your
          account, then return here to sign in.
        </p>
        <p>
          <Link to="/login">Back to sign in</Link>
        </p>
      </section>
    )
  }

  return (
    <section className="page page--narrow">
      <h1>Create an account</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="field__hint">Minimum 6 characters.</p>
        </div>

        {error && (
          <p className="inline-msg inline-msg--error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn--primary" disabled={pending}>
          {pending ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      <div className="auth-divider" aria-hidden="true">or</div>

      <button type="button" className="btn btn--outline" onClick={handleGoogle}>
        Sign up with Google
      </button>

      <p className="auth-foot">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </section>
  )
}
