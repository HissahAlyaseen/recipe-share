import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { RECIPE_STATUS } from '../../data/mockData';

export default function AdminDashboard() {
  const { users, recipes, reviews } = useAdmin();

  const flagged = reviews.filter((r) => r.flagged);

  const stats = [
    { label: 'Total users', value: users.length, to: '/admin/users' },
    { label: 'Suspended users', value: users.filter((u) => u.status === 'suspended').length, to: '/admin/users' },
    { label: 'Recipes', value: recipes.length, to: '/admin/recipes' },
    { label: 'Hidden recipes', value: recipes.filter((r) => r.status === RECIPE_STATUS.HIDDEN).length, to: '/admin/recipes' },
    { label: 'Reviews', value: reviews.length, to: '/admin/reviews' },
    { label: 'Flagged reviews', value: flagged.length, to: '/admin/reviews', alert: flagged.length > 0 },
  ];

  return (
    <>
      <h1 className="admin-title">Dashboard</h1>

      <div className="stat-grid">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className={`stat-card ${s.alert ? 'alert' : ''}`}>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </Link>
        ))}
      </div>

      <section className="admin-panel">
        <h2>Needs attention</h2>
        {flagged.length === 0 ? (
          <p className="empty-state">No flagged content. 🎉</p>
        ) : (
          <ul className="attention-list">
            {flagged.map((r) => (
              <li key={r.id}>
                <span>
                  <strong>{r.userName}</strong>: “{r.comment}”
                </span>
                <Link to="/admin/reviews" className="btn btn-sm btn-primary">Review</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
