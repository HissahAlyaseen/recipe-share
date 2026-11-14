# AI Usage

This file lists the generative AI tools used in this project and the files they affected.
Full conversations and intermediate artifacts are submitted on Blackboard with each phase's AI Declaration. They are not stored in this repository.

Commits that contain AI-assisted code include a trailer such as:

```
Assisted-by: Claude (Claude Opus 5.5)
Assisted-by: ChatGPT (GPT-6)
Assisted-by: Google Gemini (Gemini 3.8 Flash)
```

## Phase 4 – Front-End

| Log ID | Member | Tool (model) | Date | Purpose | Files affected |
|--------|--------|--------------|------|---------|----------------|
| C01 / A01 | Leen Bahubayl | Claude (Claude Opus 5.5) | 2026-11-13 | Set up AI-usage documentation | `AI_USAGE.md` |
| A02 | Leen Bahubayl  | Claude (Claude Opus 5.5) | 2026-11-13 | Meal Planner & Admin pages (Member 3) | `src/pages/MealPlanner/`, `src/pages/Admin/`, `src/context/MealPlanContext.jsx`, `src/context/AdminContext.jsx`, `src/components/Modal.jsx`, `src/components/Modal.css`, `src/components/ConfirmDialog.jsx`, `src/hooks/usePersistentState.js`, `src/data/mockData.js`, `src/styles/shared.css`, `src/member3Routes.jsx` |
| A03 | Leen Bahubayl  | Claude (Claude Opus 5.5) | 2026-11-13 | Integrated Member 3 pages into the app | `src/App.jsx`, `src/member3Routes.jsx` |
| A04 | Leen Bahubayl  | Claude (Claude Opus 5.5) | 2026-11-13 | Use team's shared Modal in Member 3 popups | `src/components/ConfirmDialog.jsx`, `src/pages/MealPlanner/RecipePickerModal.jsx`, `src/styles/shared.css` |
| A05 | Leen Bahubayl  | Claude (Claude Opus 5.5) | 2026-11-13 | Use team's `recipes.js` in Meal Planner & Admin | `src/data/mockData.js`, `src/context/AdminContext.jsx`, `src/context/MealPlanContext.jsx`, `src/pages/MealPlanner/`, `src/pages/Admin/AdminDashboard.jsx`, `src/pages/Admin/ManageRecipes.jsx`, `src/pages/Admin/Admin.css` |
| A06 | Leen Bahubayl  | Claude (Claude Opus 5.5) | 2026-11-13 | Match Member 3 pages to the Figma design | `src/styles/shared.css`, `src/pages/MealPlanner/`, `src/context/MealPlanContext.jsx`, `src/components/ConfirmDialog.jsx`, `src/pages/Admin/Admin.css`, `src/pages/Admin/ManageRecipes.jsx`, `src/pages/Admin/ManageReviews.jsx`, `src/pages/Admin/ManageUsers.jsx` |
| A07 | Leen Bahubayl  | Claude (Claude Opus 5.5) | 2026-11-13 | Resolve merge conflict (Member 1 + Member 3 routes) | `src/App.jsx` |
| A08 | Leen bahubayl | Claude (Claude Opus 5.5) | 2026-11-13 | Resolve second merge conflict | `src/App.jsx` |
| C02 | Hissah Alyaseen | ChatGPT (GPT-6) | 2026-11-13 to 2026-11-14 | Frontend guidance, debugging, validation, styling, testing, and GitHub support | `src/pages/`, `src/components/recipes/`, `src/data/ingredientSubstitutions.js`, `src/App.jsx` |
| A09 | Hissah Alyaseen | ChatGPT (GPT-6) | 2026-11-13 to 2026-11-14 | AI-assisted code suggestions for authentication pages, recipe search, dietary filters, ingredient substitutions, and ratings and reviews | `src/pages/LoginPage.jsx`, `src/pages/SignUpPage.jsx`, `src/pages/ForgotPasswordPage.jsx`, `src/pages/HomePage.jsx`, `src/pages/SearchPage.jsx`, `src/pages/RecipeDetailsPage.jsx`, `src/components/recipes/`, `src/data/ingredientSubstitutions.js` |
| C01 | Jomanah Alshammary | Google Gemini / Google Antigravity (Gemini 3.8 Flash) | 2026-11-10 | Scaffold Add Recipe, Edit Recipe, and My Recipes forms with validation and image upload | `AddRecipePage.jsx`, `EditRecipePage.jsx`, `MyRecipesPage.jsx`, `recipeStorage.js` |
| C02 | Jomanah Alshammary | Google Gemini / Google Antigravity (Gemini 3.8 Flash) | 2026-11-10 | Implement Personal Cookbook collections (Create, Rename, Delete, Organize) matching Figma wireframes | `CookbookPage.jsx`, `CookbookPage.css`, `CreateCookbookModal.jsx`, `RenameCookbookModal.jsx`, `DeleteCookbookModal.jsx`, `cookbookStorage.js` |
| C03 | Jomanah Alshammary | Google Gemini / Google Antigravity (Gemini 3.8 Flash) | 2026-11-10 | Reusable UI Modals, Action Buttons, and Navigation components adhering to Figma mobile screens | `BookmarkButton.jsx`, `SaveToCookbookModal.jsx`, `CreateCookbookModal.jsx`, `RenameCookbookModal.jsx`, `DeleteCookbookModal.jsx`, `ResetCustomizationModal.jsx`, `BottomNav.jsx` |
| C04 | Jomanah Alshammary | Google Gemini / Google Antigravity (Gemini 3.8 Flash) | 2026-11-10 to 2026-11-11 | Implement persistent bookmark button and bidirectional sync between bookmarks and cookbook saves | `BookmarkButton.jsx`, `BookmarkButton.css`, `bookmarkStorage.js`, `cookbookStorage.js`, `RecipeCard.jsx` |
| C05 | Jomanah Alshammary | Google Gemini / Google Antigravity (Gemini 3.8 Flash) | 2026-11-10 to 2026-11-11 | Scaffold Customize Saved Recipes feature (ingredient swap, servings adjustment, notes, tags) keeping original recipe intact | `CustomizeRecipePage.jsx`, `CustomizeRecipePage.css`, `customizationUtils.js`, `cookbookStorage.js` |
| C06 | Jomanah Alshammary | Google Gemini / Google Antigravity (Gemini 3.8 Flash) | 2026-11-11 to 2026-11-12 | Implement User Profile, Dietary Preferences (Halal, Keto, Low-Carb, Wheat, Fish), and Custom Restrictions | `ProfilePage.jsx`, `ProfilePage.css`, `profileStorage.js`, `dietaryUtils.js`, `AuthContext.jsx` |
| C07 | Jomanah Alshammary | Google Gemini / Google Antigravity (Gemini 3.8 Flash) | 2026-11-12 | Implement cascade deletion cleanup when an author deletes their own recipe | `recipeStorage.js`, `cookbookStorage.js`, `bookmarkStorage.js`, `MyRecipesPage.jsx` |
| C08 | Jomanah Alshammary | Google Gemini / Google Antigravity (Gemini 3.8 Flash) | 2026-11-12 | Implement duplicate cookbook collection name validation at storage and UI levels | `cookbookStorage.js`, `CreateCookbookModal.jsx`, `RenameCookbookModal.jsx`, `SaveToCookbookModal.jsx` |
| C09 | Jomanah Alshammary | Google Gemini / Google Antigravity (Gemini 3.8 Flash) | 2026-11-12 | Implement Reset Customization feature and confirmation dialog | `ResetCustomizationModal.jsx`, `CustomizeRecipePage.jsx`, `RecipeDetailsPage.jsx`, `cookbookStorage.js` |
| C10 | Jomanah Alshammary | Google Gemini / Google Antigravity (Gemini 3.8 Flash) | 2026-11-12 | Responsive layout fixes and overflow prevention across mobile and desktop | `CookbookPage.css`, `MyRecipesPage.css`, `ProfilePage.css`, `BottomNav.css`, `Header.css` |
| C11 | Jomanah Alshammary | Google Gemini / Google Antigravity (Gemini 3.8 Flash) | 2026-11-12 | Typography scale refinement, Inter font weight imports, and Save to Cookbook modal single-selection radio | `index.html`, `src/index.css`, `SaveToCookbookModal.jsx`, `CookbookModals.css` |
| C12 | Jomanah Alshammary | Google Gemini / Google Antigravity (Gemini 3.8 Flash) | 2026-11-12 | Generated reusable storage service modules for client-side persistence and cross-tab storage events | `recipeStorage.js`, `cookbookStorage.js`, `bookmarkStorage.js`, `profileStorage.js`, `storageKeys.js` |