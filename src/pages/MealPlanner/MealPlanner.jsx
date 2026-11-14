import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMealPlan, MEALS } from '../../context/MealPlanContext';
import { useStorageSync } from '../../hooks/useStorageSync';

import { 
  recipeStorage,
  RECIPES_UPDATED_EVENT
} from '../../services/recipeStorage';
import RecipePickerModal from './RecipePickerModal';
import { startOfWeek, addDays, weekDays, toKey, shortWeekday, longDate, weekRange, weekRangeShort } from './weekUtils';
import '../../styles/shared.css';
import './MealPlanner.css';

const capitalize = (s) => s[0].toUpperCase() + s.slice(1);

// One meal slot card (Breakfast / Lunch / Dinner), as in the Figma "Weekly meal planner".
function MealSlot({ meal, recipe, onAdd, onReplace, onRemove }) {
  return (
    <div className="slot-card">
      <span className="slot-label">{capitalize(meal)}</span>
      {recipe ? (
        <>
          <p className="slot-recipe">{recipe.title}</p>
          <div className="slot-links">
            <Link to={`/recipes/${recipe.id}`} className="text-link">View recipe</Link>
            <span className="slot-actions">
              <button type="button" className="text-link" onClick={onReplace}>Replace</button>
              <span aria-hidden="true"> · </span>
              <button type="button" className="text-link" onClick={onRemove}>Remove</button>
            </span>
          </div>
        </>
      ) : (
        <>
          <p className="slot-recipe slot-empty">No recipe planned</p>
          <div className="slot-links">
            <button type="button" className="text-link" onClick={onAdd}>+ Add saved recipe</button>
          </div>
        </>
      )}
    </div>
  );
}

const DISCLAIMER =
  'Filters and substitutions do not guarantee allergy safety. Check every ingredient, product label and cross-contact risk before cooking.';

export default function MealPlanner() {
  const { getMeal, setMeal, removeMeal } = useMealPlan();

  // Read recipes from the team's shared storage.
  const [recipes, setRecipes] = useState(() =>
    recipeStorage.getAll()
  );

  // Update the planner whenever recipes change.
  useStorageSync([RECIPES_UPDATED_EVENT], () => {
    setRecipes(recipeStorage.getAll());
  });

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  // Index 0–6 of the selected day tab (starts on today).
  const [selectedIndex, setSelectedIndex] = useState(() => (new Date().getDay() + 6) % 7);
  const [view, setView] = useState('day'); // 'day' | 'week'
  // Which slot the picker is open for, e.g. { date, meal }. null = closed.
  const [pickerSlot, setPickerSlot] = useState(null);

  const days = weekDays(weekStart);
  const selectedDay = days[selectedIndex];
  const findRecipe = (id) => recipes.find((r) => r.id === id);

  const changeWeek = (step) => setWeekStart((w) => addDays(w, 7 * step));

  const handleSelect = (recipeId) => {
    setMeal(toKey(pickerSlot.date), pickerSlot.meal, recipeId); // add or replace
    setPickerSlot(null);
  };

  // The three slot cards for one date (used in both views).
  const renderSlots = (date) =>
    MEALS.map((meal) => (
      <MealSlot
        key={meal}
        meal={meal}
        recipe={findRecipe(getMeal(toKey(date), meal))}
        onAdd={() => setPickerSlot({ date, meal })}
        onReplace={() => setPickerSlot({ date, meal })}
        onRemove={() => removeMeal(toKey(date), meal)}
      />
    ));

  return (
    <div className="planner-page">
      {view === 'day' ? (
        <>
          <header className="page-header">
            <h1>Weekly meal planner</h1>
          </header>

          <div className="week-nav">
            <button type="button" className="text-link" onClick={() => changeWeek(-1)}>‹ Previous</button>
            <strong>{weekRange(weekStart)}</strong>
            <button type="button" className="text-link" onClick={() => changeWeek(1)}>Next ›</button>
          </div>

          <div className="day-tabs" role="tablist">
            {days.map((d, i) => (
              <button
                key={toKey(d)}
                type="button"
                role="tab"
                aria-selected={i === selectedIndex}
                className={`day-tab ${i === selectedIndex ? 'active' : ''}`}
                onClick={() => setSelectedIndex(i)}
              >
                <span>{shortWeekday(d)}</span>
                <span>{d.getDate()}</span>
              </button>
            ))}
          </div>

          <h2 className="section-title">{longDate(selectedDay)}</h2>
          <p className="helper">Choose a day above to manage its three meal slots.</p>

          <div className="slot-list">{renderSlots(selectedDay)}</div>

          <div className="info-box planner-note">
            <strong>Changes save automatically</strong>
            <p>Add, replace or remove a recipe in any slot.</p>
          </div>

          <button type="button" className="btn btn-secondary btn-block" onClick={() => setView('week')}>
            View full week
          </button>
          <p className="planner-disclaimer">{DISCLAIMER}</p>
        </>
      ) : (
        <>
          <header className="page-header">
            <h1>Full week · {weekRangeShort(weekStart)}</h1>
          </header>
          <p className="helper">Scroll through the week. The same recipe picker opens for every Add or Replace action.</p>

          <div className="week-list">
            {days.map((d) => (
              <section key={toKey(d)} className="week-day">
                <h2 className="section-title">{longDate(d)}</h2>
                <div className="slot-list">{renderSlots(d)}</div>
              </section>
            ))}
          </div>

          <p className="planner-disclaimer">{DISCLAIMER}</p>
          <button type="button" className="btn btn-secondary btn-block" onClick={() => setView('day')}>
            Back to day view
          </button>
        </>
      )}

      {pickerSlot && (
        <RecipePickerModal
          title={`${longDate(pickerSlot.date)} · ${capitalize(pickerSlot.meal)}`}
          meal={pickerSlot.meal}
          currentId={getMeal(toKey(pickerSlot.date), pickerSlot.meal)}
         recipes={recipes.filter(
  (r) =>
    !r.status ||
    r.status.toLowerCase() === 'published'
)}
          onSelect={handleSelect}
          onClose={() => setPickerSlot(null)}
        />
      )}
    </div>
  );
}
