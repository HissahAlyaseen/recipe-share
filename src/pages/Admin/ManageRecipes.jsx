import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { RECIPE_STATUS } from '../../data/mockData';


export default function ManageRecipes() {
  const { recipes, toggleRecipeVisibility, deleteRecipe } = useAdmin();
  const [query, setQuery] = useState('');
  const [toDelete, setToDelete] = useState(null);

  const visible = recipes.filter((r) =>
    `${r.title} ${r.authorName} ${r.category}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <h1 className="admin-title">Manage Recipes</h1>

      <div className="admin-toolbar">
        <input className="input" type="search" placeholder="Search by title, author or category…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {visible.length === 0 ? (
        <p className="empty-state">No recipes found.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>Recipe</th><th>Author</th><th>Category</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id}>
                <td data-label="Recipe">
                  <span className="recipe-cell">
                    <img className="admin-thumb" src={r.image} alt="" />
                    {r.title}
                  </span>
                </td>
                <td data-label="Author">{r.authorName}</td>
                <td data-label="Category">{r.category}</td>
                <td data-label="Status"><span className={`badge badge-${r.status.toLowerCase()}`}>{r.status}</span></td>
                <td data-label="Actions" className="action-cell">
                  <button className="btn btn-sm btn-secondary" onClick={() => toggleRecipeVisibility(r.id)}>
                    {r.status === RECIPE_STATUS.HIDDEN ? 'Publish' : 'Hide'}
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => setToDelete(r)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete recipe?"
          message={`You are deleting "${toDelete.title}".`}
          note={{ title: 'This cannot be undone', text: 'The recipe and all its reviews will be removed from the community. Choose Cancel to keep it.' }}
          confirmLabel="Delete recipe"
          cancelLabel="Cancel · Keep recipe"
          onConfirm={() => { deleteRecipe(toDelete.id); setToDelete(null); }}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}
