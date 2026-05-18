import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { hasRole } from "../../utils/permissions";

export default function RoleGuard({ children, roles, redirectTo = "/access-denied" }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !hasRole(user, roles)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
