import React from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import {AuthProvider} from "./Controll/APIStuff/Autentification/AuthContext.jsx";
import {AdminAuthProvider} from "./Controll/APIStuff/adminStuuf/AdminAuthContext.jsx";

createRoot(document.getElementById("root")).render(
        <React.StrictMode>
            <BrowserRouter>
                <AuthProvider>
                    <AdminAuthProvider>
                        <App />
                    </AdminAuthProvider>
                </AuthProvider>
            </BrowserRouter>
        </React.StrictMode>
);
