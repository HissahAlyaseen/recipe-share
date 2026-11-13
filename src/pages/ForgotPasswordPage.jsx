
import { useState } from 'react'
import { Link } from 'react-router-dom'
import './ForgotPasswordPage.css'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    setSuccess(
      'Email validated successfully! Password reset emails are not available in this frontend prototype.'
    )
  }

  return (
    <div className="forgot-page">
      <div className="forgot-container">

        <div className="forgot-brand">
          <div className="forgot-logo">RS</div>

          <h2>Recipe Share</h2>

          <p>
            Discover recipes that fit your preferences.
            Keep your favorites in one place.
          </p>
        </div>

        <h1 className="forgot-title">
          Forgot Password?
        </h1>

        <p className="forgot-description">
          Enter your email address to request
          a password reset.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="forgot-email">
            Email address
          </label>

          <input
            id="forgot-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setError('')
              setSuccess('')
            }}
            required
          />

          {error && (
            <p className="forgot-error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="forgot-success" role="status">
              {success}
            </p>
          )}

          <button
            type="submit"
            className="forgot-submit"
          >
            Reset Password
          </button>
        </form>

        <div className="forgot-back">
          <Link to="/login">
            ← Back to Login
          </Link>
        </div>

      </div>
    </div>
  )
}

export default ForgotPasswordPage
