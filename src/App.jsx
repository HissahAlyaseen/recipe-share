import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AddRecipePage from './pages/AddRecipePage'
import EditRecipePage from './pages/EditRecipePage'
import MyRecipesPage from './pages/MyRecipesPage'
import RecipeDetailsPage from './pages/RecipeDetailsPage'
import Header from './components/common/Header'
import BottomNav from './components/common/BottomNav'

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
          {/* Default landing for Member 2 */}
          <Route path="/" element={<Navigate to="/my-recipes" replace />} />

          {/* Member 2 Routes (Recipe & Personal Management) */}
          <Route path="/my-recipes" element={<MyRecipesPage />} />
          <Route path="/recipes/new" element={<AddRecipePage />} />
          <Route path="/add-recipe" element={<AddRecipePage />} />
          <Route path="/recipes/:id/edit" element={<EditRecipePage />} />
          <Route path="/recipes/:id" element={<RecipeDetailsPage />} />
          <Route path="/cookbook" element={<Placeholder title="Cookbook" />} />
          <Route path="/profile" element={<Placeholder title="Profile" />} />

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
