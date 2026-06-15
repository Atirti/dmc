import { createContext, useContext, useEffect, useState } from "react";
import {adminLoginRequest, adminLogoutRequest, isAdminAuth} from "./adminAuth.js";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminLoading, setAdminLoading] = useState(true);

    useEffect(() => {
        setIsAdmin(isAdminAuth());
        setAdminLoading(false);
    }, []);

    async function adminLogin(username, password) {
        await adminLoginRequest(username, password);
        setIsAdmin(true);
    }

    async function adminLogout() {
        await adminLogoutRequest();
        setIsAdmin(false);
    }

    return (
            <AdminAuthContext.Provider value={{isAdmin, adminLoading, adminLogin, adminLogout}}>
                {children}
            </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);

    if (!context) {
        throw new Error("useAdminAuth должен использоваться внутри AdminAuthProvider");
    }

    return context;
}