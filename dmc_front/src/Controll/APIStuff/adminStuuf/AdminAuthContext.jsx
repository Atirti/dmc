import { createContext, useContext, useEffect, useState } from "react";
import {adminLoginRequest, adminLogoutRequest, isAdminAuth, checkAdminTokenValid, clearAdminTokens,} from "./adminAuth.js";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminLoading, setAdminLoading] = useState(true);

    useEffect(() => {
        async function initAuth() {
            if (!isAdminAuth()) {setAdminLoading(false);return;}

            try {
                const valid = await checkAdminTokenValid();
                setIsAdmin(valid);
                if (!valid) clearAdminTokens();
            } catch {
                setIsAdmin(false);
                clearAdminTokens();
            } finally {
                setAdminLoading(false);
            }
        }

        initAuth();
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
            <AdminAuthContext.Provider value={{ isAdmin, adminLoading, adminLogin, adminLogout }}>
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