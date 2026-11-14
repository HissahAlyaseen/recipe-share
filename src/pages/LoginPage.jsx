
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSubmit = (event) => {
    event.preventDefault()

    const newErrors = {}

    if (!email.trim()) {
      newErrors.email = 'Please enter your email address'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Please enter your password'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    // Frontend prototype only — no real authentication
    navigate('/')
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <div className="login-logo">RS</div>
          <h2>Recipe Share</h2>
          <p>
            Discover recipes that fit your preferences.
            Keep your favorites in one place.
          </p>
        </div>

        <h1 className="login-title">Welcome back</h1>
        <p className="login-description">Log in to Recipe Share</p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && (
            <p className="login-error" role="alert">
              {errors.email}
            </p>
          )}

          <label htmlFor="login-password">Password</label>
          <div className="password-wrapper">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(errors.password)}
            />
            <button
              type="button"
              className="show-password-btn"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && (
            <p className="login-error" role="alert">
              {errors.password}
            </p>
          )}

          <Link to="/forgot-password" className="forgot-password">
            Forgot password?
          </Link>

          <button type="submit">Log in</button>
        </form>

        <div className="signup-section">
          <p>New to Recipe Share?</p>
          <Link to="/signup" className="signup-button">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
