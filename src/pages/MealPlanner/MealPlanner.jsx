import { useState } from 'react';
import { useMealPlan, DAYS, MEALS } from '../../context/MealPlanContext';
import { useAdmin } from '../../context/AdminContext';
import { RECIPE_STATUS } from '../../data/mockData';
import RecipePickerModal from './RecipePickerModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import '../../styles/shared.css';
import './MealPlanner.css';

// 28 → "28 min", 150 → "2 h 30 min"
function formatMinutes(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export default function MealPlanner() {
  const { plan, setMeal, removeMeal, clearWeek } = useMealPlan();
  const { recipes } = useAdmin();

  // Which slot the picker is open for, e.g. { day: 'Monday', meal: 'lunch' }. null = closed.
  const [pickerSlot, setPickerSlot] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const findRecipe = (id) => recipes.find((r) => r.id === id);

  // Summary numbers shown above the grid.
  // (recipes.js has no calories, so we show total cooking time instead.)
  // filter(findRecipe) skips ids of recipes that were deleted by the admin.
  const plannedIds = DAYS.flatMap((d) => MEALS.map((m) => plan[d][m])).filter(findRecipe);
  const totalMinutes = plannedIds.reduce((sum, id) => {
    const r = findRecipe(id);
    return sum + r.prepTime + r.cookingTime;
  }, 0);

  const handleSelect = (recipeId) => {
    setMeal(pickerSlot.day, pickerSlot.meal, recipeId); // add or replace
    setPickerSlot(null);
  };

  return (
    <div className="planner-page">
      <header className="planner-header">
        <div>
          <h1>Weekly Meal Planner</h1>
          <p className="planner-sub">
            {plannedIds.length} / {DAYS.length * MEALS.length} meals planned · {formatMinutes(totalMinutes)} of cooking this week
          </p>
        </div>
        <button
          className="btn btn-secondary"
          disabled={plannedIds.length === 0}
          onClick={() => setConfirmClear(true)}
        >
          Clear week
        </button>
      </header>

      <div className="planner-grid">
        {DAYS.map((day) => (
          <section key={day} className="day-card">
            <h3 className="day-name">{day}</h3>

            {MEALS.map((meal) => {
              const recipe = findRecipe(plan[day][meal]);
              return (
                <div key={meal} className={`meal-slot ${recipe ? 'filled' : ''}`}>
                  <span className="meal-label">{meal}</span>

                  {recipe ? (
                    <>
                      <div className="meal-recipe">
                        <img className="meal-thumb" src={recipe.image} alt={recipe.title} />
                        <div>
                          <strong>{recipe.title}</strong>
                          <small>{recipe.prepTime + recipe.cookingTime} min · {recipe.difficulty}</small>
                        </div>
                      </div>
                      <div className="meal-actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => setPickerSlot({ day, meal })}>
                          Replace
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => removeMeal(day, meal)}>
                          Remove
                        </button>
                      </div>
                    </>
                  ) : (
                    <button className="add-meal-btn" onClick={() => setPickerSlot({ day, meal })}>
                      + Add {meal}
                    </button>
                  )}
                </div>
              );
            })}
          </section>
        ))}
      </div>

      {pickerSlot && (
        <RecipePickerModal
          slot={pickerSlot}
          recipes={recipes.filter((r) => r.status === RECIPE_STATUS.PUBLISHED)}
          onSelect={handleSelect}
          onClose={() => setPickerSlot(null)}
        />
      )}

      {confirmClear && (
        <ConfirmDialog
          title="Clear the whole week?"
          message="All planned meals will be removed."
          confirmLabel="Clear"
          danger
          onConfirm={() => { clearWeek(); setConfirmClear(false); }}
          onCancel={() => setConfirmClear(false)}
        />
      )}
    </div>
  );
}
