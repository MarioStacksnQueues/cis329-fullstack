import { useState } from 'react'
import { useCart } from '../context/CartContext.jsx'

function formatPrice(value) {
  const num = Number(value)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(Number.isFinite(num) ? num : 0)
}

function unsplashUrl(url, width) {
  const base = url.split('?')[0]
  return `${base}?w=${width}&q=60&fm=webp&auto=compress`
}

function pexelsUrl(url, width) {
  const base = url.split('?')[0]
  return `${base}?auto=compress&cs=tinysrgb&w=${width}`
}

function buildSrc(url) {
  if (!url) return ''
  if (url.includes('images.unsplash.com')) return unsplashUrl(url, 600)
  return url
}

function responsiveSrcSet(url) {
  if (!url) return null
  if (url.includes('images.unsplash.com')) {
    return `${unsplashUrl(url, 300)} 300w, ${unsplashUrl(url, 600)} 600w`
  }
  if (url.includes('images.pexels.com')) {
    return `${pexelsUrl(url, 300)} 300w, ${pexelsUrl(url, 600)} 600w`
  }
  return null
}

export default function ProductCard({ product, priority = false }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const inStock = product.stock_quantity > 0

  const handleAdd = () => {
    addItem(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const imageAlt = product.image_url
    ? `${product.name} (${product.category})`
    : ''

  const imageSrc = product.image_url ? buildSrc(product.image_url) : ''
  const imageSrcSet = responsiveSrcSet(product.image_url)

  return (
    <article className="product-card">
      <div className="product-card__media">
        {product.image_url ? (
          <img
            src={imageSrc}
            srcSet={imageSrcSet || undefined}
            sizes={imageSrcSet ? '(max-width: 600px) 90vw, 300px' : undefined}
            alt={imageAlt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchpriority={priority ? 'high' : 'auto'}
            width="600"
            height="450"
          />
        ) : (
          <div className="product-card__placeholder" aria-hidden="true">
            No image
          </div>
        )}
      </div>
      <div className="product-card__body">
        <p className="product-card__category">{product.category}</p>
        <h2 className="product-card__name">{product.name}</h2>
        {product.description && (
          <p className="product-card__desc">{product.description}</p>
        )}
        <p className="product-card__price">{formatPrice(product.price)}</p>
        <p
          className={
            inStock ? 'product-card__stock' : 'product-card__stock product-card__stock--out'
          }
        >
          {inStock ? `${product.stock_quantity} in stock` : 'Out of stock'}
        </p>
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleAdd}
          disabled={!inStock}
        >
          {added ? 'Added to cart' : 'Add to cart'}
        </button>
        <p className="product-card__live" aria-live="polite">
          {added ? `${product.name} added to cart.` : ''}
        </p>
      </div>
    </article>
  )
}
