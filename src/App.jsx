
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function Placeholder({ title }) {
  return <h1>{title} Page - Coming Soon 🍽️</h1>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Placeholder title="Home" />} />
        <Route path="/login" element={<Placeholder title="Login" />} />
        <Route path="/signup" element={<Placeholder title="Sign Up" />} />
        <Route path="/search" element={<Placeholder title="Search" />} />
        <Route path="/recipes/:id" element={<Placeholder title="Recipe Details" />} />
        <Route path="/cookbook" element={<Placeholder title="Cookbook" />} />
        <Route path="/my-recipes" element={<Placeholder title="My Recipes" />} />
        <Route path="/profile" element={<Placeholder title="Profile" />} />
        <Route path="/meal-planner" element={<Placeholder title="Meal Planner" />} />
        <Route path="/admin" element={<Placeholder title="Admin Dashboard" />} />
        <Route path="*" element={<Placeholder title="Page Not Found" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
