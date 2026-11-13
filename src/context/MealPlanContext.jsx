import { createContext, useContext } from 'react';
import usePersistentState from '../hooks/usePersistentState';

export const MEALS = ['breakfast', 'lunch', 'dinner'];

const MealPlanContext = createContext(null);

export function MealPlanProvider({ children }) {
  // Meals are stored per calendar date, so each week can have its own plan:
  // { '2026-10-12': { breakfast: null, lunch: 5, dinner: 6 }, ... }
  // Each slot stores a recipe id (or null when empty).
  const [plan, setPlan] = usePersistentState('rs_meal_plan_v3', {});

  const getMeal = (dateKey, meal) => plan[dateKey]?.[meal] ?? null;

  // Add OR replace: both just put a recipe id into a slot.
  const setMeal = (dateKey, meal, recipeId) => {
    setPlan((prev) => ({ ...prev, [dateKey]: { ...prev[dateKey], [meal]: recipeId } }));
  };

  const removeMeal = (dateKey, meal) => {
    setPlan((prev) => ({ ...prev, [dateKey]: { ...prev[dateKey], [meal]: null } }));
  };

  return (
    <MealPlanContext.Provider value={{ plan, getMeal, setMeal, removeMeal }}>
      {children}
    </MealPlanContext.Provider>
  );
}

// Custom hook so pages can write: const { getMeal, setMeal } = useMealPlan();
export function useMealPlan() {
  const ctx = useContext(MealPlanContext);
  if (!ctx) throw new Error('useMealPlan must be used inside <MealPlanProvider>');
  return ctx;
}
