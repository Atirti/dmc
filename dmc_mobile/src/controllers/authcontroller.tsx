import React, { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from "react";
import { AuthCredentials, AuthTokens, decodeJwtPayload, LoginResponseDto, mapLoginResponseToTokens } from "../models/authmodel";
import { AuthState, guestAuthState, initialAuthState, User } from "../models/usermodel";
import { apiRequest, ApiError, ApiRequestOptions, DEFAULT_API_BASE_URL, normalizeBaseUrl } from "../services/api";

type AuthorizedRequest = <T>( path: string, options?: Omit<ApiRequestOptions, "token"> ) => Promise<T>;

type AuthContextValue = {
    authState: AuthState;
    isSubmitting: boolean;
    errorMessage: string | null;
    apiBaseUrl: string;
    setApiBaseUrl: (value: string) => void;
    login: (credentials: AuthCredentials) => Promise<boolean>;
    register: (credentials: AuthCredentials) => Promise<boolean>;
    refreshSession: () => Promise<boolean>;
    logout: () => Promise<void>;
    clearError: () => void;
    authorizedRequest: AuthorizedRequest;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function validateCredentials({ username, password }: AuthCredentials) {
    const trimmedUsername = username.trim();

    if (trimmedUsername.length < 4) {
        return "Логин должен быть не короче 4 символо";
    }

    if (trimmedUsername.length > 50) {
        return "Логин должен быть не длиннее 50 символов";
    }

    if (password.length < 8) {
        return "Пароль должен быть не короче 8 символов";
    }

    const allowed = /^[A-Za-z0-9!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~]+$/;

    if (!allowed.test(trimmedUsername) || !allowed.test(password)) {
        return "Используйте английские буквы, цифры и знаки пунктуации";
    }

    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~]/.test(password)) {
        return "Пароль должен содержать строчную и заглавную букву, цифру и знак пунктуации";
    }

    return null;
}

function buildUserFromToken(token: string): User {
    const payload = decodeJwtPayload(token);
    const username = payload?.username || "user";
    const id = payload?.user_id?.toString() || username;

    return {
        id,
        username,
        name: username,
    };
}

function buildAuthState(tokens: AuthTokens): AuthState {
    return {
        isAuthenticated: true,
        user: buildUserFromToken(tokens.jwtToken),
        tokens,
    };
}

export function AuthProvider({ children }: PropsWithChildren) {
    const envApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;
    const [apiBaseUrl, setApiBaseUrlState] = useState(normalizeBaseUrl(envApiBaseUrl));
    const [authState, setAuthState] = useState<AuthState>(initialAuthState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const setApiBaseUrl = useCallback((value: string) => {
        setApiBaseUrlState(normalizeBaseUrl(value));
        setErrorMessage(null);
    }, []);

    const authenticate = useCallback(
        async (path: "/login" | "/registration", credentials: AuthCredentials) => {
            const validationMessage = validateCredentials(credentials);

            if (validationMessage) {
                setErrorMessage(validationMessage);
                return false;
            }

            setIsSubmitting(true);
            setErrorMessage(null);

            try {
                const response = await apiRequest<LoginResponseDto>(apiBaseUrl, path, {
                    method: "POST",
                    body: {
                        username: credentials.username.trim(),
                        password: credentials.password,
                    },
                });
                const tokens = mapLoginResponseToTokens(response);

                setAuthState(buildAuthState(tokens));
                return true;
            } catch (error) {
                setErrorMessage(
                    error instanceof Error
                        ? error.message
                        : "Не удалось выполнить вход"
                );
                return false;
            } finally {
                setIsSubmitting(false);
            }
        },
        [apiBaseUrl]
    );

    const login = useCallback(
        (credentials: AuthCredentials) => authenticate("/login", credentials),
        [authenticate]
    );

    const register = useCallback(
        (credentials: AuthCredentials) => authenticate("/registration", credentials),
        [authenticate]
    );

    const refreshSession = useCallback(async () => {
        const refreshToken = authState.tokens?.refreshToken;

        if (!refreshToken) {
            return false;
        }

        try {
            const response = await apiRequest<LoginResponseDto>(apiBaseUrl, "/refresh_token", {
                method: "POST",
                body: {
                    refresh_token: refreshToken,
                },
            });
            const tokens = mapLoginResponseToTokens(response);

            setAuthState(buildAuthState(tokens));
            setErrorMessage(null);
            return true;
        } catch (error) {
            setAuthState(guestAuthState);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Сессия истекла. Войдите снова"
            );
            return false;
        }
    }, [apiBaseUrl, authState.tokens?.jwtToken, authState.tokens?.refreshToken]);

    const logout = useCallback(async () => {
        const refreshToken = authState.tokens?.refreshToken;

        setAuthState(guestAuthState);
        setErrorMessage(null);

        if (!refreshToken) {
            return;
        }

        try {
            await apiRequest<unknown>(apiBaseUrl, "/logout", {
                method: "POST",
                token: authState.tokens?.jwtToken,
                body: {
                    refresh_token: refreshToken,
                },
            });
        } catch {
            // Локально пользователь уже вышел. Ошибку logout не показываем,
            // чтобы не возвращать пользователя в авторизованное состояние.
        }
    }, [apiBaseUrl, authState.tokens?.jwtToken, authState.tokens?.refreshToken]);

    const clearError = useCallback(() => {
        setErrorMessage(null);
    }, []);

    const authorizedRequest = useCallback<AuthorizedRequest>(
        async (path, options = {}) => {
            const accessToken = authState.tokens?.jwtToken;
            const refreshToken = authState.tokens?.refreshToken;

            if (!accessToken) {
                throw new Error("Нужно войти в аккаунт");
            }

            try {
                return await apiRequest(apiBaseUrl, path, {
                    ...options,
                    token: accessToken,
                });
            } catch (error) {
                if (!(error instanceof ApiError) || error.status !== 401 || !refreshToken) {
                    throw error;
                }

                const refreshResponse = await apiRequest<LoginResponseDto>(apiBaseUrl, "/refresh_token", {
                    method: "POST",
                    body: {
                        refresh_token: refreshToken,
                    },
                });
                const tokens = mapLoginResponseToTokens(refreshResponse);

                setAuthState(buildAuthState(tokens));
                setErrorMessage(null);

                return await apiRequest(apiBaseUrl, path, {
                    ...options,
                    token: tokens.jwtToken,
                });
            }
        },
        [apiBaseUrl, authState.tokens?.jwtToken, authState.tokens?.refreshToken]
    );

    const value = useMemo<AuthContextValue>(
        () => ({
            authState,
            isSubmitting,
            errorMessage,
            apiBaseUrl,
            setApiBaseUrl,
            login,
            register,
            refreshSession,
            logout,
            clearError,
            authorizedRequest,
        }),
        [
            authState,
            isSubmitting,
            errorMessage,
            apiBaseUrl,
            setApiBaseUrl,
            login,
            register,
            refreshSession,
            logout,
            clearError,
            authorizedRequest,
        ]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}
