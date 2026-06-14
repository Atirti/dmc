import { createRoot } from 'react-dom/client'
import React from "react";
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import {AuthProvider} from "./Controll/APIStuff/Autentification/AuthContext.jsx";

createRoot(document.getElementById('root')).render(
        <React.StrictMode>
            <BrowserRouter>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </BrowserRouter>
        </React.StrictMode>
)
