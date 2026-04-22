import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(Number(value) || 0)
}

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, clear } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState(null)

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/cart' } } })
      return
    }
    if (items.length === 0) return

    setPlacing(true)
    setError(null)

    const rows = items.map((line) => ({
      product_id: line.product_id,
      quantity: line.quantity,
      total_price: Number((line.price * line.quantity).toFixed(2))
    }))

    const { error: insertError } = await supabase.from('orders').insert(rows)
    setPlacing(false)

    if (insertError) {
      console.error('Checkout failed:', insertError)
      setError(insertError.message)
      return
    }

    clear()
    navigate('/profile')
  }

  return (
    <section className="page">
      <div className="page__header">
        <h1>Your cart</h1>
      </div>

      {items.length === 0 && (
        <p className="empty-state">
          Your cart is empty. <Link to="/">Browse the catalog</Link> to add something.
        </p>
      )}

      {items.length > 0 && (
        <div className="cart">
          <ul className="cart__list">
            {items.map((line) => {
              const lineTotal = line.price * line.quantity
              return (
                <li key={line.product_id} className="cart__line">
                  <div className="cart__media">
                    {line.image_url ? (
                      <img src={line.image_url} alt={line.name} loading="lazy" width="80" height="80" decoding="async" />
                    ) : (
                      <div className="cart__media-placeholder" aria-hidden="true" />
                    )}
                  </div>
                  <div className="cart__info">
                    <h2 className="cart__name">{line.name}</h2>
                    <p className="cart__price">{formatPrice(line.price)} each</p>
                  </div>
                  <div className="cart__qty">
                    <label htmlFor={`qty-${line.product_id}`} className="sr-only">
                      Quantity for {line.name}
                    </label>
                    <input
                      id={`qty-${line.product_id}`}
                      type="number"
                      min="1"
                      max={line.stock_quantity}
                      step="1"
                      value={line.quantity}
                      onChange={(e) =>
                        updateQuantity(line.product_id, Number(e.target.value) || 1)
                      }
                    />
                  </div>
                  <div className="cart__line-total">{formatPrice(lineTotal)}</div>
                  <button
                    type="button"
                    className="btn btn--small btn--ghost"
                    onClick={() => removeItem(line.product_id)}
                    aria-label={`Remove ${line.name} from cart`}
                  >
                    Remove
                  </button>
                </li>
              )
            })}
          </ul>

          <aside className="cart__summary" aria-label="Order summary">
            <div className="cart__summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <p className="cart__note">Taxes and shipping are not calculated in this demo.</p>

            {error && (
              <p className="inline-msg inline-msg--error" role="alert">
                {error}
              </p>
            )}

            <button
              type="button"
              className="btn btn--primary btn--wide"
              onClick={handleCheckout}
              disabled={placing}
            >
              {placing ? 'Placing order...' : user ? 'Checkout' : 'Sign in to checkout'}
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--wide"
              onClick={clear}
              disabled={placing}
            >
              Clear cart
            </button>
          </aside>
        </div>
      )}
    </section>
  )
}
