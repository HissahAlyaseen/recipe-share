import { useState } from 'react';
import Modal from '../../components/common/Modal'; // the team's shared Modal

const DIET_FILTERS = ['all', 'vegan', 'vegetarian', 'gluten-free'];

// Popup that lets the user search and pick a recipe for one meal slot.
export default function RecipePickerModal({ slot, recipes, onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [diet, setDiet] = useState('all');

  // Filtering is "derived state": computed from query + diet on every render,
  // so there is no extra state to keep in sync.
  const results = recipes.filter((r) => {
    const matchesText = r.title.toLowerCase().includes(query.toLowerCase());
    const matchesDiet = diet === 'all' || r.tags.includes(diet);
    return matchesText && matchesDiet;
  });

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
          {DIET_FILTERS.map((d) => (
            <option key={d} value={d}>{d === 'all' ? 'All diets' : d}</option>
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
                <span className="meal-emoji">{r.emoji}</span>
                <span className="picker-info">
                  <strong>{r.title}</strong>
                  <small>{r.cookTime} min · {r.calories} kcal{r.tags.length ? ` · ${r.tags.join(', ')}` : ''}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
