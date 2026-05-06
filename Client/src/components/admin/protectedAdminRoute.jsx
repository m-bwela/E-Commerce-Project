import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
    const isAdmin = true; // Replace with actual admin check logic

    if (!isAdmin) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}