import { createContext, useContext } from 'react';
import usePersistentState from '../hooks/usePersistentState';

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const MEALS = ['breakfast', 'lunch', 'dinner'];

// Builds an empty week: { Monday: { breakfast: null, lunch: null, dinner: null }, ... }
function emptyWeek() {
  return Object.fromEntries(
    DAYS.map((day) => [day, Object.fromEntries(MEALS.map((meal) => [meal, null]))])
  );
}

const MealPlanContext = createContext(null);

export function MealPlanProvider({ children }) {
  // Each slot stores a recipe id (or null when empty).
  const [plan, setPlan] = usePersistentState('rs_meal_plan_v2', emptyWeek());

  // Add OR replace: both just put a recipe id into a slot.
  const setMeal = (day, meal, recipeId) => {
    setPlan((prev) => ({ ...prev, [day]: { ...prev[day], [meal]: recipeId } }));
  };

  const removeMeal = (day, meal) => {
    setPlan((prev) => ({ ...prev, [day]: { ...prev[day], [meal]: null } }));
  };

  const clearWeek = () => setPlan(emptyWeek());

  return (
    <MealPlanContext.Provider value={{ plan, setMeal, removeMeal, clearWeek }}>
      {children}
    </MealPlanContext.Provider>
  );
}

// Custom hook so pages can write: const { plan, setMeal } = useMealPlan();
export function useMealPlan() {
  const ctx = useContext(MealPlanContext);
  if (!ctx) throw new Error('useMealPlan must be used inside <MealPlanProvider>');
  return ctx;
}
