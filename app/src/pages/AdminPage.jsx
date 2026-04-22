import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import Spinner from '../components/Spinner.jsx'

const blankForm = {
  id: null,
  name: '',
  description: '',
  price: '',
  category: '',
  image_url: '',
  stock_quantity: ''
}

export default function AdminPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState(null)
  const [form, setForm] = useState(blankForm)
  const [editorOpen, setEditorOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmingId, setConfirmingId] = useState(null)

  const loadProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*').order('name')
    if (error) {
      console.error('Admin products fetch failed:', error)
      setFeedback({ kind: 'error', text: error.message })
      setProducts([])
    } else {
      setProducts(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const openNew = () => {
    setForm(blankForm)
    setEditorOpen(true)
    setFeedback(null)
  }

  const openEdit = (product) => {
    setForm({
      id: product.id,
      name: product.name ?? '',
      description: product.description ?? '',
      price: product.price ?? '',
      category: product.category ?? '',
      image_url: product.image_url ?? '',
      stock_quantity: product.stock_quantity ?? ''
    })
    setEditorOpen(true)
    setFeedback(null)
  }

  const closeEditor = () => {
    setEditorOpen(false)
    setForm(blankForm)
  }

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFeedback(null)

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      category: form.category.trim(),
      image_url: form.image_url.trim() || null,
      stock_quantity: Number(form.stock_quantity)
    }

    const isEdit = Boolean(form.id)
    const { error } = isEdit
      ? await supabase.from('products').update(payload).eq('id', form.id)
      : await supabase.from('products').insert(payload)

    setSaving(false)

    if (error) {
      console.error('Product save failed:', error)
      setFeedback({ kind: 'error', text: error.message })
      return
    }

    setFeedback({
      kind: 'ok',
      text: isEdit ? 'Product updated.' : 'Product created.'
    })
    closeEditor()
    loadProducts()
  }

  const requestDelete = (product) => {
    setConfirmingId(product.id)
    setFeedback(null)
  }

  const cancelDelete = () => setConfirmingId(null)

  const confirmDelete = async (product) => {
    setFeedback(null)
    const { error } = await supabase.from('products').delete().eq('id', product.id)
    setConfirmingId(null)

    if (error) {
      console.error('Product delete failed:', error)
      setFeedback({ kind: 'error', text: error.message })
      return
    }

    setFeedback({ kind: 'ok', text: 'Product deleted.' })
    loadProducts()
  }

  return (
    <section className="page">
      <div className="page__header page__header--row">
        <h1>Admin: products</h1>
        <button type="button" className="btn btn--primary" onClick={openNew}>
          New product
        </button>
      </div>

      <div className="aria-live-region" aria-live="polite">
        {feedback && (
          <p
            className={
              feedback.kind === 'error'
                ? 'inline-msg inline-msg--error'
                : 'inline-msg inline-msg--ok'
            }
          >
            {feedback.text}
          </p>
        )}
      </div>

      {editorOpen && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h2>{form.id ? 'Edit product' : 'New product'}</h2>

          <div className="field">
            <label htmlFor="p-name">Name</label>
            <input id="p-name" type="text" required value={form.name} onChange={handleChange('name')} />
          </div>

          <div className="field">
            <label htmlFor="p-category">Category</label>
            <input
              id="p-category"
              type="text"
              required
              value={form.category}
              onChange={handleChange('category')}
            />
          </div>

          <div className="field">
            <label htmlFor="p-price">Price (USD)</label>
            <input
              id="p-price"
              type="number"
              step="0.01"
              min="0"
              required
              value={form.price}
              onChange={handleChange('price')}
            />
          </div>

          <div className="field">
            <label htmlFor="p-stock">Stock quantity</label>
            <input
              id="p-stock"
              type="number"
              min="0"
              step="1"
              required
              value={form.stock_quantity}
              onChange={handleChange('stock_quantity')}
            />
          </div>

          <div className="field">
            <label htmlFor="p-image">Image URL</label>
            <input
              id="p-image"
              type="url"
              value={form.image_url}
              onChange={handleChange('image_url')}
            />
          </div>

          <div className="field">
            <label htmlFor="p-desc">Description</label>
            <textarea
              id="p-desc"
              rows={3}
              value={form.description}
              onChange={handleChange('description')}
            />
          </div>

          <div className="admin-form__actions">
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving...' : form.id ? 'Save changes' : 'Create product'}
            </button>
            <button type="button" className="btn btn--ghost" onClick={closeEditor}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && (
        <div className="centered-block">
          <Spinner label="Loading products" />
        </div>
      )}

      {!loading && products.length === 0 && (
        <p className="empty-state">No products yet. Use "New product" to add one.</p>
      )}

      {!loading && products.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <caption>All products in the catalog.</caption>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Category</th>
                <th scope="col">Price</th>
                <th scope="col">Stock</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const confirming = confirmingId === p.id
                return (
                  <tr key={p.id} className={confirming ? 'data-table__row--confirming' : undefined}>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>{p.stock_quantity}</td>
                    <td className="data-table__actions">
                      {confirming ? (
                        <div role="group" aria-label={`Confirm delete for ${p.name}`}>
                          <span className="data-table__confirm-text">Delete permanently?</span>
                          <button
                            type="button"
                            className="btn btn--small btn--danger"
                            onClick={() => confirmDelete(p)}
                          >
                            Yes, delete
                          </button>
                          <button
                            type="button"
                            className="btn btn--small btn--ghost"
                            onClick={cancelDelete}
                            autoFocus
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button type="button" className="btn btn--small" onClick={() => openEdit(p)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn--small btn--danger"
                            onClick={() => requestDelete(p)}
                            aria-label={`Delete ${p.name}`}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
