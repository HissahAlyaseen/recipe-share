

import { createContext, useContext, useState } from 'react'
import usePersistentState from '../hooks/usePersistentState'
import { useStorageSync } from '../hooks/useStorageSync'
import {
  mockUsers,
  mockRecipes,
  mockReviews,
  DEMO_ADMIN,
  RECIPE_STATUS
} from '../data/mockData'
import {
  reviewStorage,
  REVIEWS_UPDATED_EVENT
} from '../services/reviewStorage'

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  // Admin authentication
  const [isAdmin, setIsAdmin] = usePersistentState(
    'rs_is_admin',
    false
  );

  // Users remain mock data for the frontend prototype.
  const [users, setUsers] = usePersistentState(
    'rs_admin_users_v2',
    mockUsers
  );

  // Recipes now come from the team's shared storage.
  const [recipes, setRecipes] = useState(() => recipeStorage.getAll());

  // Keep Admin recipes synchronized with other pages.
  useStorageSync([RECIPES_UPDATED_EVENT], () => {
    setRecipes(recipeStorage.getAll());
  });

  // Reviews remain mock data for now.
  const [reviews, setReviews] = useState(() =>
  reviewStorage.initialize(mockReviews)
)

useStorageSync([REVIEWS_UPDATED_EVENT], () => {
  setReviews(reviewStorage.getAll())
})

  // Admin login
  const login = (email, password) => {
    const ok =
      email.trim().toLowerCase() === DEMO_ADMIN.email &&
      password === DEMO_ADMIN.password;

    if (ok) setIsAdmin(true);

    return ok;
  };

  const logout = () => setIsAdmin(false);

  // Users
  const toggleUserStatus = (userId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              status:
                u.status === 'active' ? 'suspended' : 'active'
            }
          : u
      )
    );
  };

  // Recipes
  const toggleRecipeVisibility = (recipeId) => {
    const recipe = recipeStorage.getById(recipeId);

    if (!recipe) return;

    const newStatus =
      recipe.status === RECIPE_STATUS.HIDDEN
        ? RECIPE_STATUS.PUBLISHED
        : RECIPE_STATUS.HIDDEN;

    recipeStorage.updateAsAdmin(recipeId, {
      status: newStatus
    });
  };

 const deleteRecipe = (recipeId) => {
  setRecipes((prev) => prev.filter((r) => r.id !== recipeId))

  setReviews((prev) => {
    const updatedReviews = prev.filter(
      (review) => String(review.recipeId) !== String(recipeId)
    )

    reviewStorage.replaceAll(updatedReviews)
    return updatedReviews
  })
}

  // Reviews
  // ---- Reviews ----
const deleteReview = (reviewId) => {
  reviewStorage.delete(reviewId)
  setReviews(reviewStorage.getAll())
}

const dismissFlag = (reviewId) => {
  reviewStorage.update(reviewId, { flagged: false })
  setReviews(reviewStorage.getAll())
}

  const value = {
    isAdmin,
    login,
    logout,

    users,
    toggleUserStatus,

    recipes,
    toggleRecipeVisibility,
    deleteRecipe,

    reviews,
    deleteReview,
    dismissFlag
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);

  if (!ctx) {
    throw new Error('useAdmin must be used inside <AdminProvider>');
  }

  return ctx;
}
