import { useState } from 'react';
import Modal from '../../components/common/Modal'; // the team's shared Modal

// recipes.js is not consistent with capitals ("Gluten-Free" vs "Gluten-free"),
// so tags are compared in lower case.
const normalize = (tag) => tag.toLowerCase();

// "Choose saved recipe" popup from the Figma: search, filter, select one card,
// then confirm with "Add selected recipe". The same popup is used for Replace.
export default function RecipePickerModal({ title, meal, currentId, recipes, onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [diet, setDiet] = useState('all');
  // When replacing, the current recipe starts as selected.
  const [selectedId, setSelectedId] = useState(currentId);

  // Build the diet options from the recipes themselves (no hard-coded list).
  const dietOptions = [...new Set(recipes.flatMap((r) => r.dietaryTags.map(normalize)))].sort();

  // Filtering is "derived state": computed from query + diet on every render.
  const q = query.trim().toLowerCase();
  const results = recipes
    .filter((r) => {
      const matchesText =
        r.title.toLowerCase().includes(q) || r.ingredients.some((i) => i.toLowerCase().includes(q));
      const matchesDiet = diet === 'all' || r.dietaryTags.map(normalize).includes(diet);
      return matchesText && matchesDiet;
    })
    // Recipes whose category matches the slot (e.g. Breakfast) come first.
    .sort((a, b) => (b.category.toLowerCase() === meal) - (a.category.toLowerCase() === meal));

  return (
    <Modal isOpen onClose={onClose} title="Choose saved recipe" maxWidth="460px">
      <h3 className="picker-subtitle">{title}</h3>
      <p className="helper">Select a recipe. The same picker opens for Replace.</p>

      {/* The search runs while typing; the Search button just keeps the Figma layout. */}
      <form onSubmit={(e) => e.preventDefault()} className="picker-field">
        <label className="field-label" htmlFor="picker-search">Search recipes</label>
        <div className="input-with-action">
          <input
            id="picker-search"
            className="input"
            type="search"
            placeholder="Search title or ingredient"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="input-action">Search</button>
        </div>
      </form>

      <div className="picker-field">
        <label className="field-label" htmlFor="picker-diet">Diet</label>
        <select id="picker-diet" className="select picker-select" value={diet} onChange={(e) => setDiet(e.target.value)}>
          <option value="all">All diets · {recipes.length} recipes</option>
          {dietOptions.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {results.length === 0 ? (
        <p className="empty-state">No recipes match your search.</p>
      ) : (
        <ul className="picker-list">
          {results.map((r) => {
            const selected = r.id === selectedId;
            return (
              <li key={r.id}>
                <button
                  type="button"
                  className={`picker-card ${selected ? 'selected' : ''}`}
                  aria-pressed={selected}
                  onClick={() => setSelectedId(r.id)}
                >
                  <img className="recipe-thumb" src={r.image} alt="" />
                  <span className="picker-info">
                    <strong>{r.title}</strong>
                    <small>By {r.authorName} · {r.prepTime + r.cookingTime} min · {r.servings} servings</small>
                    <span className="picker-status">{selected ? '● Selected' : '○ Select recipe'}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="stacked-actions">
        <button type="button" className="btn btn-primary btn-block" disabled={!selectedId} onClick={() => onSelect(selectedId)}>
          {currentId ? 'Replace with selected recipe' : 'Add selected recipe'}
        </button>
        <button type="button" className="btn btn-secondary btn-block" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}
