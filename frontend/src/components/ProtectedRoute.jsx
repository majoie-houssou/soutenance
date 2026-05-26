import { Navigate } from 'react-router-dom';
import { isAuthenticated, getRole } from '../services/authService';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const authenticated = isAuthenticated();
  const role = getRole();

  if (!authenticated) {
    return <Navigate to="/connexion" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/connexion" replace />;
  }

  return children;
};

export default ProtectedRoute;