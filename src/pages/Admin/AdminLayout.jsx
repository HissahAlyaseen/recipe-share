import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import '../../styles/shared.css';
import './Admin.css';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/recipes', label: 'Recipes' },
  { to: '/admin/reviews', label: 'Reviews' },
];

// Shared frame for all admin pages: sidebar + the current page (<Outlet />).
export default function AdminLayout() {
  const { logout, reviews } = useAdmin();
  const navigate = useNavigate();
  const flaggedCount = reviews.filter((r) => r.flagged).length;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">🍳 Admin</div>
        <nav>
          {links.map((l) => (
            // NavLink adds the "active" class automatically to the current page's link.
            <NavLink key={l.to} to={l.to} end={l.end} className="admin-link">
              {l.label}
              {l.label === 'Reviews' && flaggedCount > 0 && <span className="count-pill">{flaggedCount}</span>}
            </NavLink>
          ))}
        </nav>
        <button className="btn btn-secondary admin-logout" onClick={handleLogout}>Log out</button>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
