import { createContext, useContext } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { mockUsers, mockRecipes, mockReviews, DEMO_ADMIN, RECIPE_STATUS } from '../data/mockData';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = usePersistentState('rs_is_admin', false);
  const [users, setUsers] = usePersistentState('rs_admin_users_v2', mockUsers);
  const [recipes, setRecipes] = usePersistentState('rs_admin_recipes_v2', mockRecipes);
  const [reviews, setReviews] = usePersistentState('rs_admin_reviews_v2', mockReviews);

  // ---- Auth (mock) ----
  const login = (email, password) => {
    const ok =
      email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password;
    if (ok) setIsAdmin(true);
    return ok;
  };
  const logout = () => setIsAdmin(false);

  // ---- Users ----
  // Flip a user between 'active' and 'suspended'.
  const toggleUserStatus = (userId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u
      )
    );
  };

  // ---- Recipes ----
  const toggleRecipeVisibility = (recipeId) => {
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === recipeId
          ? { ...r, status: r.status === RECIPE_STATUS.HIDDEN ? RECIPE_STATUS.PUBLISHED : RECIPE_STATUS.HIDDEN }
          : r
      )
    );
  };
  const deleteRecipe = (recipeId) => {
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    // Reviews of a deleted recipe are removed too.
    setReviews((prev) => prev.filter((v) => v.recipeId !== recipeId));
  };

  // ---- Reviews ----
  const deleteReview = (reviewId) => {
    setReviews((prev) => prev.filter((v) => v.id !== reviewId));
  };
  const dismissFlag = (reviewId) => {
    setReviews((prev) => prev.map((v) => (v.id === reviewId ? { ...v, flagged: false } : v)));
  };

  const value = {
    isAdmin, login, logout,
    users, toggleUserStatus,
    recipes, toggleRecipeVisibility, deleteRecipe,
    reviews, deleteReview, dismissFlag,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside <AdminProvider>');
  return ctx;
}
