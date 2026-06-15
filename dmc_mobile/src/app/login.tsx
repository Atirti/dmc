import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { useAuth } from "../controllers/authcontroller";
import { useAppTheme } from "../controllers/themecontroller";
import { AuthFormView } from "../views/authformview";

export default function Login() {
    const { theme } = useAppTheme();
    const {
        authState,
        isSubmitting,
        errorMessage,
        login,
        clearError,
    } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        clearError();
    }, [clearError]);

    useEffect(() => {
        if (authState.isAuthenticated) {
            router.replace("/profile" as never);
        }
    }, [authState.isAuthenticated]);

    async function handleSubmit() {
        const success = await login({ username, password });

        if (success) {
            router.replace("/profile" as never);
        }
    }

    return (
        <AuthFormView
            theme={theme}
            title="Вход"
            subtitle="Войдите в аккаунт"
            submitLabel="Войти"
            username={username}
            password={password}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            switchText="Нет аккаунта?"
            switchLabel="Зарегистрироваться"
            onChangeUsername={setUsername}
            onChangePassword={setPassword}
            onSubmit={handleSubmit}
            onSwitch={() => router.replace("/registration" as never)}
            onBackToProfile={() => router.replace("/profile" as never)}
        />
    );
}
