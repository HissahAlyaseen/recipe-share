
import { useState } from 'react'
import { Link } from 'react-router-dom'
import './SignUpPage.css'

function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')

    // Validate full name
    if (!name.trim()) {
      setError('Please enter your full name')
      return
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address')
      return
    }

    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    // Check matching passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Backend integration is not available yet
    alert(
      'Form validated successfully! Account creation is not connected yet.'
    )
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

          {/* Full Name */}
          <label htmlFor="signup-name">Full name</label>
          <input
            id="signup-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {error === 'Please enter your full name' && (
            <p className="signup-error" role="alert">
              {error}
            </p>
          )}

          {/* Email */}
          <label htmlFor="signup-email">Email address</label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error === 'Please enter a valid email address' && (
            <p className="signup-error" role="alert">
              {error}
            </p>
          )}

          {/* Password */}
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error === 'Password must be at least 8 characters' && (
            <p className="signup-error" role="alert">
              {error}
            </p>
          )}

          {/* Confirm Password */}
          <label htmlFor="signup-confirm">
            Confirm password
          </label>
          <input
            id="signup-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error === 'Passwords do not match' && (
            <p className="signup-error" role="alert">
              {error}
            </p>
          )}

          {/* Submit Button */}
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
