import { useEffect, useRef } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import CartPage from './pages/CartPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  const mainRef = useRef(null)
  const location = useLocation()
  const firstRender = useRef(true)

  // React Router does not move focus on navigation, which screen readers
  // and Lighthouse both flag. Punt focus to <main> on every route change
  // except the initial mount (browsers handle that on first load).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    mainRef.current?.focus()
  }, [location.pathname])

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="site-main" tabIndex={-1} ref={mainRef}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <p>Built for CIS329 by Mario Cuevas.</p>
      </footer>
    </>
  )
}
