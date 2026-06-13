import { createContext, useContext, useEffect, useState } from "react";
import {checkAuth, loginRequest, registrationRequest, logoutRequest,} from "./auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function initAuth() {
            const result = await checkAuth();

            if (mounted) {
                setIsAuth(result);
                setLoading(false);
            }
        }
        initAuth();
        return () => {
            mounted = false;
        };
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
        try{
            await logoutRequest();
        }
        catch(error){
            console.log("Logout Error: ",error);
        }
        finally {
            setIsAuth(false);
        }
    }

    return (
            <AuthContext.Provider
                    value={{isAuth, loading, login, registration, logout,}}>
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