import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import ProductCard from '../components/ProductCard.jsx'
import Spinner from '../components/Spinner.jsx'

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.from('products').select('*').order('name')
    if (error) {
      console.error('Products fetch failed:', error)
      setError(error.message)
      setProducts([])
    } else {
      setProducts(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  return (
    <section className="page">
      <div className="page__header">
        <h1>Browse the catalog</h1>
      </div>

      {loading && (
        <div className="centered-block">
          <Spinner label="Loading products" />
        </div>
      )}

      {!loading && error && (
        <p className="inline-msg inline-msg--error" role="alert">
          Could not load products: {error}
        </p>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="empty-state">No products are available right now.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="product-grid">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 2} />
          ))}
        </div>
      )}
    </section>
  )
}
