import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AdminProvider } from './context/AdminContext'          // Member 3
import { MealPlanProvider } from './context/MealPlanContext'    // Member 3
import AddRecipePage from './pages/AddRecipePage'
import BrowseRecipesPage from './pages/BrowseRecipesPage'
import EditRecipePage from './pages/EditRecipePage'
import MyRecipesPage from './pages/MyRecipesPage'
import RecipeDetailsPage from './pages/RecipeDetailsPage'
import CookbookPage from './pages/CookbookPage'
import CustomizeRecipePage from './pages/CustomizeRecipePage'
import ProfilePage from './pages/ProfilePage'
import Header from './components/common/Header'
import BottomNav from './components/common/BottomNav'
import { member3Routes } from './member3Routes'                  // Member 3
import { STORAGE_KEYS, STORAGE_SYNC_VERSION } from './services/storageKeys'
import { recipeStorage } from './services/recipeStorage'
import { cookbookStorage } from './services/cookbookStorage'
import { profileStorage } from './services/profileStorage'
import { bookmarkStorage } from './services/bookmarkStorage'

if (typeof window !== 'undefined') {
  try {
    const currentVer = localStorage.getItem(STORAGE_KEYS.STORAGE_VERSION)
    if (currentVer !== STORAGE_SYNC_VERSION) {
      recipeStorage.resetDefaults()
      cookbookStorage.resetDefaults()
      profileStorage.resetDefaults()
      bookmarkStorage.resetDefaults()
      localStorage.setItem(STORAGE_KEYS.STORAGE_VERSION, STORAGE_SYNC_VERSION)
    }
  } catch (err) {
    console.error('Storage version sync failed:', err)
  }

  // Global helper available in browser console: window.resetRecipeShareStorage()
  window.resetRecipeShareStorage = () => {
    try {
      localStorage.clear()
      recipeStorage.resetDefaults()
      cookbookStorage.resetDefaults()
      profileStorage.resetDefaults()
      bookmarkStorage.resetDefaults()
      localStorage.setItem(STORAGE_KEYS.STORAGE_VERSION, STORAGE_SYNC_VERSION)
      window.location.reload()
    } catch (err) {
      console.error('Manual reset failed:', err)
    }
  }
}

function Placeholder({ title }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
      <Header />
      <main style={{ flex: 1, padding: '60px 20px' }}>
        <h1 style={{ fontSize: 'var(--fs-title)', color: '#111827', margin: '0 0 12px' }}>
          {title} Page - Coming Soon 🍽️
        </h1>
        <p style={{ color: '#6b7280', fontSize: 'var(--fs-sm)' }}>
          This section is currently being integrated by other team members.
        </p>
      </main>
      <BottomNav />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      {/* Member 3 providers: admin data/login + weekly meal plan */}
      <AdminProvider>
        <MealPlanProvider>
          <BrowserRouter>
            <Routes>
              {/* Home Route */}
              <Route path="/" element={<Placeholder title="Home" />} />

              {/* Member 2 Routes (Recipe & Personal Management) */}
              <Route path="/recipes" element={<BrowseRecipesPage />} />
              <Route path="/my-recipes" element={<MyRecipesPage />} />
              <Route path="/recipes/new" element={<AddRecipePage />} />
              <Route path="/add-recipe" element={<AddRecipePage />} />
              <Route path="/recipes/:id/edit" element={<EditRecipePage />} />
              <Route path="/recipes/:id" element={<RecipeDetailsPage />} />
              <Route path="/recipes/:id/customize" element={<CustomizeRecipePage />} />
              <Route path="/cookbook" element={<CookbookPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Member 3 Routes (Meal Planner & Admin):
                  /meal-planner, /admin/login, /admin, /admin/users, /admin/recipes, /admin/reviews */}
              {member3Routes}

              {/* Member 1 placeholders (until their pages are merged) */}
              <Route path="/login" element={<Placeholder title="Login" />} />
              <Route path="/signup" element={<Placeholder title="Sign Up" />} />
              <Route path="/search" element={<Placeholder title="Search" />} />

              {/* Fallback */}
              <Route path="*" element={<Placeholder title="Page Not Found" />} />
            </Routes>
          </BrowserRouter>
        </MealPlanProvider>
      </AdminProvider>
    </AuthProvider>
  )
}

export default App
