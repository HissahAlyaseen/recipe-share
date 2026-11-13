
import './LoginPage.css'
import { useState } from 'react'
import { Link } from 'react-router-dom'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    setError('Login is not available until the backend is connected.')
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
        <p className="login-description">
          Log in to Recipe Share
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          
<div className="password-wrapper">
  <input
    id="password"
    type={showPassword ? 'text' : 'password'}
    value={password}
    onChange={(event) => setPassword(event.target.value)}
    required
  />

  <button
    type="button"
    className="show-password-btn"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? 'Hide' : 'Show'}
  </button>
</div>
<Link to="/forgot-password" className="forgot-password">
  Forgot password?
</Link>

{error && (
  <p className="login-error" role="alert">
    {error}
  </p>
)}
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
