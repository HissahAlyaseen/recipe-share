// Member 3 routes. They are inserted into the team's <Routes> in App.jsx with {member3Routes}.
import { Route } from 'react-router-dom'
import Header from './components/common/Header'
import BottomNav from './components/common/BottomNav'
import MealPlanner from './pages/MealPlanner/MealPlanner'
import AdminLogin from './pages/Admin/AdminLogin'
import AdminLayout from './pages/Admin/AdminLayout'
import ProtectedAdminRoute from './pages/Admin/ProtectedAdminRoute'
import AdminDashboard from './pages/Admin/AdminDashboard'
import ManageUsers from './pages/Admin/ManageUsers'
import ManageRecipes from './pages/Admin/ManageRecipes'
import ManageReviews from './pages/Admin/ManageReviews'

export const member3Routes = (
  <>
    {/* Meal planner is a normal user page, so it gets the team's Header + BottomNav */}
    <Route
      path="/meal-planner"
      element={
        <>
          <Header />
          <MealPlanner />
          <BottomNav />
        </>
      }
    />

    {/* Admin pages use their own sidebar layout, without the user Header/BottomNav */}
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route
      path="/admin"
      element={
        <ProtectedAdminRoute>
          <AdminLayout />
        </ProtectedAdminRoute>
      }
    >
      <Route index element={<AdminDashboard />} />
      <Route path="users" element={<ManageUsers />} />
      <Route path="recipes" element={<ManageRecipes />} />
      <Route path="reviews" element={<ManageReviews />} />
    </Route>
  </>
)
