// Mock data for Member 3 pages (Phase 4 prototype, no back-end yet).
// Recipes come from the team's shared data/recipes.js, so every page
// shows the same recipes. Users and reviews are still mock data here.
// In Phase 5 all of this will be replaced by API calls.
import { recipes } from './recipes';

export const mockRecipes = recipes;

// User ids match the authorId values used in recipes.js ('user-1', ...).
export const mockUsers = [
  { id: 'user-1', name: 'Amal', email: 'amal@example.com', joined: '2026-09-02', status: 'active' },
  { id: 'user-2', name: 'Inaya', email: 'inaya@example.com', joined: '2026-09-10', status: 'active' },
  { id: 'user-3', name: 'Ayla', email: 'ayla@example.com', joined: '2026-09-15', status: 'active' },
  { id: 'user-4', name: 'Yousef Hamad', email: 'yousef@example.com', joined: '2026-10-01', status: 'active' },
  { id: 'user-5', name: 'Nora Fahad', email: 'nora@example.com', joined: '2026-10-08', status: 'suspended' },
  { id: 'user-6', name: 'Khalid Saleh', email: 'khalid@example.com', joined: '2026-10-20', status: 'active' },
];

// recipeId values match the numeric ids in recipes.js.
export const mockReviews = [
  { id: 'v1', recipeId: 1, userId: 'user-2', userName: 'Inaya', rating: 5, comment: 'Tastes just like home!', date: '2026-10-20', flagged: false },
  { id: 'v2', recipeId: 2, userId: 'user-3', userName: 'Ayla', rating: 4, comment: 'Fresh and easy, loved the sumac.', date: '2026-10-22', flagged: false },
  { id: 'v3', recipeId: 8, userId: 'user-5', userName: 'Nora Fahad', rating: 1, comment: 'This is garbage, visit my site for better recipes!!!', date: '2026-10-28', flagged: true },
  { id: 'v4', recipeId: 6, userId: 'user-6', userName: 'Khalid Saleh', rating: 5, comment: 'Perfect for winter.', date: '2026-10-30', flagged: false },
  { id: 'v5', recipeId: 3, userId: 'user-4', userName: 'Yousef Hamad', rating: 2, comment: 'Spam spam spam buy followers now', date: '2026-11-02', flagged: true },
];

// Demo admin account for the prototype only.
// Real authentication (hashed passwords, tokens) comes with the back-end.
export const DEMO_ADMIN = { email: 'admin@recipeshare.com', password: 'admin123' };

// recipes.js uses "Published"; the admin "hide" action uses "Hidden".
export const RECIPE_STATUS = { PUBLISHED: 'Published', HIDDEN: 'Hidden' };
