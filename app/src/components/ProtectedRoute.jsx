import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Spinner from './Spinner.jsx'

// This guard is UX only. Real authorization lives in the Supabase RLS
// policies (see database/rls-policies.sql). A user who reaches /admin by
// typing the URL will see an empty screen because every mutation is
// rejected at the DB, but we still redirect here to keep the experience clean.
export default function ProtectedRoute({ requireAdmin = false, children }) {
  const { user, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="centered-screen">
        <Spinner label="Checking your session" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (requireAdmin && role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children ?? <Outlet />
}
