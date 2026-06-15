import { createContext, useContext, useEffect, useState } from "react";
import {checkAuth, loginRequest, registrationRequest, logoutRequest, logoutEverywhereRequest} from "./auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function initAuth() {
            try {
                const result = await checkAuth();

                if (mounted) {setIsAuth(result);}
            } catch (error) {
                console.log("Auth check error:", error);

                if (mounted) {setIsAuth(false);}
            } finally {
                if (mounted) {setLoading(false);}
            }
        }

        initAuth();

        return () => {mounted = false;};
    }, []);

    async function login(username, password) {
        await loginRequest(username, password);
        setIsAuth(true);
    }

    async function registration(username, password) {
        await registrationRequest(username, password);
        setIsAuth(true);
    }

    async function logout() {
        try {
            await logoutRequest();
        } catch (error) {
            console.log("Logout Error:", error);
        } finally {
            setIsAuth(false);
            localStorage.removeItem("username");
            sessionStorage.removeItem("username");
        }
    }

    async function logoutEverywhere() {
        try {
            await logoutEverywhereRequest();
        } catch (error) {
            console.log("Logout everywhere Error:", error);
            throw error;
        } finally {
            setIsAuth(false);
            localStorage.removeItem("username");
            sessionStorage.removeItem("username");
        }
    }

    return (
            <AuthContext.Provider
                    value={{isAuth, loading, login, registration, logout, logoutEverywhere}}>
                {children}
            </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth должен использоваться внутри AuthProvider");
    }

    return context;
}