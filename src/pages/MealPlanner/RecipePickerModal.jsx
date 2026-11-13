import { useState } from 'react';
import Modal from '../../components/common/Modal'; // the team's shared Modal

// recipes.js is not consistent with capitals ("Gluten-Free" vs "Gluten-free"),
// so tags are compared in lower case.
const normalize = (tag) => tag.toLowerCase();

// Popup that lets the user search and pick a recipe for one meal slot.
export default function RecipePickerModal({ slot, recipes, onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [diet, setDiet] = useState('all');

  // Build the diet options from the recipes themselves (no hard-coded list).
  const dietOptions = [...new Set(recipes.flatMap((r) => r.dietaryTags.map(normalize)))].sort();

  // Filtering is "derived state": computed from query + diet on every render,
  // so there is no extra state to keep in sync.
  const results = recipes.filter((r) => {
    const matchesText = r.title.toLowerCase().includes(query.toLowerCase());
    const matchesDiet = diet === 'all' || r.dietaryTags.map(normalize).includes(diet);
    return matchesText && matchesDiet;
  })
    // Show recipes whose category matches the slot (e.g. Breakfast) first.
    .sort((a, b) => (b.category.toLowerCase() === slot.meal) - (a.category.toLowerCase() === slot.meal));

  return (
    <Modal isOpen onClose={onClose} title={`Choose ${slot.meal} for ${slot.day}`}>
      <div className="picker-controls">
        <input
          className="input"
          type="search"
          placeholder="Search recipes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <select className="select" value={diet} onChange={(e) => setDiet(e.target.value)}>
          <option value="all">All diets</option>
          {dietOptions.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {results.length === 0 ? (
        <p className="empty-state">No recipes match your search.</p>
      ) : (
        <ul className="picker-list">
          {results.map((r) => (
            <li key={r.id}>
              <button className="picker-item" onClick={() => onSelect(r.id)}>
                <img className="meal-thumb" src={r.image} alt={r.title} />
                <span className="picker-info">
                  <strong>{r.title}</strong>
                  <small>{r.category} · {r.prepTime + r.cookingTime} min{r.dietaryTags.length ? ` · ${r.dietaryTags.join(', ')}` : ''}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
