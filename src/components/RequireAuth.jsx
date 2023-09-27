import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const RequireAuth = ({ allowedRoles }) => {
  const { auth } = useAuth();
  const location = useLocation();
  
  // Check if the user has any of the allowed roles
  const hasAllowedRole = allowedRoles?.includes(auth?.role);
  
  return (
    hasAllowedRole
      ? <Outlet/>
      : auth?.role
        ? <Navigate to='/unauthorized' state={{from: location}} replace />
        : <Navigate to='/login' state={{from: location}} replace />
  )
}

export default RequireAuth;
