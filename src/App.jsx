import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AddRecipePage from './pages/AddRecipePage'
import EditRecipePage from './pages/EditRecipePage'
import MyRecipesPage from './pages/MyRecipesPage'
import RecipeDetailsPage from './pages/RecipeDetailsPage'
import CookbookPage from './pages/CookbookPage'
import CustomizeRecipePage from './pages/CustomizeRecipePage'
import ProfilePage from './pages/ProfilePage'
import Header from './components/common/Header'
import BottomNav from './components/common/BottomNav'
import { recipeStorage } from './services/recipeStorage'
import { cookbookStorage } from './services/cookbookStorage'
import { profileStorage } from './services/profileStorage'
import { bookmarkStorage } from './services/bookmarkStorage'

// Versioned sync to auto-reset stale or orphaned localStorage keys from previous runs
const STORAGE_SYNC_VERSION = 'v10_bookmarks_sync'

if (typeof window !== 'undefined') {
  try {
    const currentVer = localStorage.getItem('recipe_share_storage_version')
    if (currentVer !== STORAGE_SYNC_VERSION) {
      recipeStorage.resetDefaults()
      cookbookStorage.resetDefaults()
      profileStorage.resetDefaults()
      bookmarkStorage.resetDefaults()
      localStorage.setItem('recipe_share_storage_version', STORAGE_SYNC_VERSION)
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
      localStorage.setItem('recipe_share_storage_version', STORAGE_SYNC_VERSION)
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
        <h1 style={{ fontSize: '28px', color: '#111827', margin: '0 0 12px' }}>
          {title} Page - Coming Soon 🍽️
        </h1>
        <p style={{ color: '#6b7280', fontSize: '15px' }}>
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
      <BrowserRouter>
        <Routes>
          {/* Home Route */}
          <Route path="/" element={<Placeholder title="Home" />} />

          {/* Member 2 Routes (Recipe & Personal Management) */}
          <Route path="/my-recipes" element={<MyRecipesPage />} />
          <Route path="/recipes/new" element={<AddRecipePage />} />
          <Route path="/add-recipe" element={<AddRecipePage />} />
          <Route path="/recipes/:id/edit" element={<EditRecipePage />} />
          <Route path="/recipes/:id" element={<RecipeDetailsPage />} />
          <Route path="/recipes/:id/customize" element={<CustomizeRecipePage />} />
          <Route path="/cookbook" element={<CookbookPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Existing Team Routes preserved */}
          <Route path="/login" element={<Placeholder title="Login" />} />
          <Route path="/signup" element={<Placeholder title="Sign Up" />} />
          <Route path="/search" element={<Placeholder title="Search" />} />
          <Route path="/meal-planner" element={<Placeholder title="Meal Planner" />} />
          <Route path="/admin" element={<Placeholder title="Admin Dashboard" />} />

          {/* Fallback */}
          <Route path="*" element={<Placeholder title="Page Not Found" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
