
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './SignUpPage.css'

function SignUpPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSubmit = (event) => {
    event.preventDefault()

    const newErrors = {}

    if (!name.trim()) {
      newErrors.name = 'Please enter your full name'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Please enter your password'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    // Frontend prototype only — no actual account is created
    alert('Demo sign-up completed! Please log in to continue.')
    navigate('/login')
  }

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-brand">
          <div className="signup-logo">RS</div>
          <h1>Recipe Share</h1>
          <p>Discover recipes that fit your preferences.</p>
        </div>

        <h2>Create an account</h2>
        <p>Join Recipe Share today!</p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="signup-name">Full name</label>
          <input
            id="signup-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && (
            <p className="signup-error" role="alert">{errors.name}</p>
          )}

          <label htmlFor="signup-email">Email address</label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && (
            <p className="signup-error" role="alert">{errors.email}</p>
          )}

          <label htmlFor="signup-password">Password</label>
          <div className="signup-password-wrapper">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(errors.password)}
            />
            <button
              type="button"
              className="signup-show-password-btn"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && (
            <p className="signup-error" role="alert">{errors.password}</p>
          )}

          <label htmlFor="signup-confirm">Confirm password</label>
          <div className="signup-password-wrapper">
            <input
              id="signup-confirm"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={Boolean(errors.confirmPassword)}
            />
            <button
              type="button"
              className="signup-show-password-btn"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="signup-error" role="alert">{errors.confirmPassword}</p>
          )}

          <button type="submit">Sign up</button>
        </form>

        <p>
          Already have an account?{' '}
          <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}

export default SignUpPage
