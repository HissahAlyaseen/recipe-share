import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import ConfirmDialog from '../../components/common/ConfirmDialog'

export default function ManageReviews() {
  const { reviews, recipes, deleteReview, dismissFlag } = useAdmin();
  const [tab, setTab] = useState('flagged'); // 'flagged' | 'all'
  const [toRemove, setToRemove] = useState(null);

  const flaggedCount = reviews.filter((r) => r.flagged).length;
  const visible = tab === 'flagged' ? reviews.filter((r) => r.flagged) : reviews;
  const recipeTitle = (id) => recipes.find((r) => r.id === id)?.title ?? 'Deleted recipe';

  return (
    <>
      <h1 className="admin-title">Manage Reviews</h1>

      <div className="tabs">
        <button className={`tab ${tab === 'flagged' ? 'active' : ''}`} onClick={() => setTab('flagged')}>
          Flagged ({flaggedCount})
        </button>
        <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
          All ({reviews.length})
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="empty-state">{tab === 'flagged' ? 'No flagged reviews.' : 'No reviews yet.'}</p>
      ) : (
        <div className="review-list">
          {visible.map((r) => (
            <article key={r.id} className={`review-card ${r.flagged ? 'flagged' : ''}`}>
              <header>
                <strong>{r.userName}</strong>
                <span className="stars" aria-label={`${r.rating} out of 5`}>
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </span>
                {r.flagged && <span className="badge badge-flagged">flagged</span>}
              </header>
              <p>{r.comment}</p>
              <footer>
                <small>on <em>{recipeTitle(r.recipeId)}</em> · {r.date}</small>
                <div className="action-cell">
                  {r.flagged && (
                    <button className="btn btn-sm btn-secondary" onClick={() => dismissFlag(r.id)}>Keep</button>
                  )}
                  <button className="btn btn-sm btn-danger" onClick={() => setToRemove(r)}>Remove</button>
                </div>
              </footer>
            </article>
          ))}
        </div>
      )}

      {toRemove && (
        <ConfirmDialog
          title="Remove review?"
          message={`The review by ${toRemove.userName} will be removed as inappropriate content.`}
          confirmLabel="Remove review"
          cancelLabel="Cancel · Keep review"
          onConfirm={() => { deleteReview(toRemove.id); setToRemove(null); }}
          onCancel={() => setToRemove(null)}
        />
      )}
    </>
  );
}
