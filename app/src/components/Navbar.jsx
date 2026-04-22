import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

export default function Navbar() {
  const { user, role, signOut } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const linkClass = ({ isActive }) =>
    isActive ? 'nav__link nav__link--active' : 'nav__link'

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink to="/" className="brand" aria-label="Rich Inter Storefront home">
          Rich Inter Storefront
        </NavLink>
        <nav aria-label="Primary">
          <ul className="nav">
            <li>
              <NavLink to="/" end className={linkClass}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/cart" className={linkClass}>
                Cart
                {count > 0 && (
                  <span className="nav__badge" aria-label={`${count} items in cart`}>
                    {count}
                  </span>
                )}
              </NavLink>
            </li>
            {user && (
              <li>
                <NavLink to="/profile" className={linkClass}>
                  Profile
                </NavLink>
              </li>
            )}
            {user && role === 'admin' && (
              <li>
                <NavLink to="/admin" className={linkClass}>
                  Admin
                </NavLink>
              </li>
            )}
            {!user && (
              <>
                <li>
                  <NavLink to="/login" className={linkClass}>
                    Login
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/signup" className={linkClass}>
                    Sign up
                  </NavLink>
                </li>
              </>
            )}
            {user && (
              <li>
                <button type="button" className="btn btn--ghost" onClick={handleSignOut}>
                  Sign out
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}
