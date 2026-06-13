import {Navigate, Outlet, useLocation} from "react-router-dom";
import { useAuth } from "./AuthContext";

export function PublicRoute() {
    const { isAuth, loading } = useAuth();

    if (loading) {
        return <div>Проверка авторизации...</div>;
    }

    if (isAuth) {
        return <Navigate to="/home" replace />;
    }
    return <Outlet />;
}

export  function ProtectedRoute() {
    const { isAuth, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Проверка авторизации...</div>;
    }

    if (!isAuth) {
        return <Navigate to="/home" replace state={{ from: location }} />;
    }

    return <Outlet />;
}
