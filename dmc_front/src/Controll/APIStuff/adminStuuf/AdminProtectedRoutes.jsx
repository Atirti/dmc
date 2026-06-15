import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth} from "./AdminAuthContext.jsx";

function AdminProtectedRoute({ children }) {
    const { isAdmin, adminLoading } = useAdminAuth();

    if (adminLoading) {return null;}
    if (!isAdmin) {return <Navigate to="/admin/login" replace />;}

    return children || <Outlet />;
}

export default AdminProtectedRoute;