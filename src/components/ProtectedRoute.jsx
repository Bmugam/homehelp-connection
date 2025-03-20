import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-homehelp-200 border-t-homehelp-900 mx-auto"></div>
          <p className="mt-2 text-homehelp-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.userType)) {
    // Redirect to appropriate dashboard based on user type
    if (user.userType === 'client') {
      return <Navigate to="/userDashboard" replace />;
    } else if (user.userType === 'provider') {
      return <Navigate to="/providers-dashboard" replace />;
    } else if (user.userType === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      // Fallback to home if user type is unknown
      return <Navigate to="/" replace />;
    }
  }

  // If authorized, render the children
  return children;
};

export default ProtectedRoute;