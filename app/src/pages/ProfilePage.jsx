import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'
import Spinner from '../components/Spinner.jsx'

function formatDate(iso) {
  if (!iso) return 'Unknown'
  const d = new Date(iso)
  return d.toLocaleString()
}

function formatMoney(value) {
  const num = Number(value)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(Number.isFinite(num) ? num : 0)
}

export default function ProfilePage() {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)

    supabase
      .from('orders')
      .select('id, quantity, total_price, created_at, products(name, image_url)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          console.error('Orders fetch failed:', error)
          setError(error.message)
          setOrders([])
        } else {
          setOrders(data ?? [])
        }
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <section className="page">
      <h1>Your profile</h1>

      <dl className="meta-list">
        <div>
          <dt>Email</dt>
          <dd>{user?.email}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{role ?? 'customer'}</dd>
        </div>
        <div>
          <dt>Last signed in</dt>
          <dd>{formatDate(user?.last_sign_in_at)}</dd>
        </div>
      </dl>

      <button type="button" className="btn btn--ghost" onClick={handleSignOut}>
        Sign out
      </button>

      <h2>Order history</h2>

      {loading && (
        <div className="centered-block">
          <Spinner label="Loading your orders" />
        </div>
      )}

      {!loading && error && (
        <p className="inline-msg inline-msg--error" role="alert">
          Could not load orders: {error}
        </p>
      )}

      {!loading && !error && orders.length === 0 && (
        <p className="empty-state">You have not placed any orders yet.</p>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <caption>Orders you have placed, most recent first.</caption>
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Quantity</th>
                <th scope="col">Total</th>
                <th scope="col">Placed</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.products?.name ?? 'Unknown product'}</td>
                  <td>{o.quantity}</td>
                  <td>{formatMoney(o.total_price)}</td>
                  <td>{formatDate(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
