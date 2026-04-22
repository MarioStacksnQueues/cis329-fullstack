import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="page page--narrow">
      <h1>Page not found</h1>
      <p>We could not find what you were looking for.</p>
      <p>
        <Link to="/">Back to the catalog</Link>
      </p>
    </section>
  )
}
