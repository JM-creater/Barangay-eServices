import { Navigate } from "react-router-dom";
import { useAuth } from "./store/AuthContext";

export const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) return null;
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export const StaffRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isStaff, isApprover, isAdmin, isLoading } = useAuth();
    if (isLoading) return null;
    return isStaff || isApprover || isAdmin ? children : <Navigate to="/" replace />;
};

export const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAdmin, isLoading } = useAuth();
    if (isLoading) return null;
    return isAdmin ? children : <Navigate to="/" replace />;
};