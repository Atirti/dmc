import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { useAuth } from "../controllers/authcontroller";
import { useAppTheme } from "../controllers/themecontroller";
import { AuthFormView } from "../views/authformview";

export default function Registration() {
    const { theme } = useAppTheme();
    const {
        authState,
        isSubmitting,
        errorMessage,
        register,
        clearError,
    } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        clearError();
    }, [clearError]);

    useEffect(() => {
        if (authState.isAuthenticated) {
            router.replace("/profile" as never);
        }
    }, [authState.isAuthenticated]);

    async function handleSubmit() {
        if (password !== confirmPassword) {
            setLocalError("Пароли не совпадают");
            return;
        }

        setLocalError(null);
        const success = await register({ username, password });

        if (success) {
            router.replace("/profile" as never);
        }
    }

    return (
        <AuthFormView
            theme={theme}
            title="Регистрация"
            subtitle="Создайте аккаунт"
            submitLabel="Зарегистрироваться"
            username={username}
            password={password}
            confirmPassword={confirmPassword}
            showConfirmPassword
            isSubmitting={isSubmitting}
            errorMessage={localError || errorMessage}
            switchText="Уже есть аккаунт?"
            switchLabel="Войти"
            onChangeUsername={setUsername}
            onChangePassword={(value) => {
                setPassword(value);
                setLocalError(null);
            }}
            onChangeConfirmPassword={(value) => {
                setConfirmPassword(value);
                setLocalError(null);
            }}
            onSubmit={handleSubmit}
            onSwitch={() => router.replace("/login" as never)}
            onBackToProfile={() => router.replace("/profile" as never)}
        />
    );
}
