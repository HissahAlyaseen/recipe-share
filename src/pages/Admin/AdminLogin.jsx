import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import '../../styles/shared.css';
import './Admin.css';

export default function AdminLogin() {
  const { isAdmin, login } = useAdmin();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  // Already logged in → go straight to the dashboard.
  if (isAdmin) return <Navigate to="/admin" replace />;

  // One handler for both inputs, using the input's "name" attribute.
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault(); // stop the browser from reloading the page
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    if (login(form.email, form.password)) {
      navigate('/admin');
    } else {
      setError('Invalid admin credentials.');
    }
  };

  return (
    <div className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleSubmit} noValidate>
        <h1>Admin Login</h1>
        <p className="admin-muted">Recipe Share administration</p>

        {error && <div className="form-error" role="alert">{error}</div>}

        <label>
          Email
          <input className="input" type="email" name="email" value={form.email} onChange={handleChange} autoComplete="username" />
        </label>
        <label>
          Password
          <input className="input" type="password" name="password" value={form.password} onChange={handleChange} autoComplete="current-password" />
        </label>

        <button className="btn btn-primary" type="submit">Log in</button>
        <p className="admin-hint">Demo: admin@recipeshare.com / admin123</p>
      </form>
    </div>
  );
}
