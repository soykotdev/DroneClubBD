import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { UserRole } from "@droneclub/shared";
import { useAuth } from "./AuthProvider";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

/**
 * Client-side gate for UX only (redirects, hides nav items) — the backend
 * (middleware/auth.ts requireRole) is the actual authorization boundary, per
 * spec Section 14.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, mustChangePassword } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (mustChangePassword && location.pathname !== "/admin/change-password") {
    return <Navigate to="/admin/change-password" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
