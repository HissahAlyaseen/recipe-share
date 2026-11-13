import { Navigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

// Wraps admin pages: if the admin is not logged in, redirect to /admin/login.
export default function ProtectedAdminRoute({ children }) {
  const { isAdmin } = useAdmin();
  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}
