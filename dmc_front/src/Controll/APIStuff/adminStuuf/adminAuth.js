import {api_url} from "../Autentification/auth.js";

const API_URL = api_url;

const ADMIN_ACCESS_TOKEN_KEY = "admin_jwt_token";
const ADMIN_REFRESH_TOKEN_KEY = "admin_refresh_token";

function saveAdminTokens(data) {
    localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, data.jwt_token);
    localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, data.refresh_token);
}

export function clearAdminTokens() {
    (function migrateOldTokens() {
        localStorage.removeItem("admin_jwt_token");
        localStorage.removeItem("admin_refresh_token");
    })();
}

function getAdminAccessToken() {
    return localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
}

function getAdminRefreshToken() {
    return localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);
}

async function getErrorMessage(response, fallback) {
    try {
        const data = await response.json();

        if (typeof data.detail === "string") return data.detail;

        if (Array.isArray(data.detail)) {
            return data.detail.map((item) => {
                const field = Array.isArray(item.loc) ? item.loc.join(".") : "field";
                return `${field}: ${item.msg}`;
            }).join("; ");
        }

        if (data.detail) return JSON.stringify(data.detail);

        return fallback;
    } catch {
        return fallback;
    }
}

export function isAdminAuth() {
    return Boolean(getAdminAccessToken() && getAdminRefreshToken());
}

export async function adminLoginRequest(username, password) {
    const response = await fetch(`${API_URL}/admin_login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const message = await getErrorMessage(response, "Ошибка входа администратора");
        throw new Error(message);
    }

    const data = await response.json();
    saveAdminTokens(data);
    return data;
}

export async function adminRefreshTokenRequest() {
    const refreshToken = getAdminRefreshToken();

    if (!refreshToken) {
        clearAdminTokens();
        throw new Error("Refresh token администратора отсутствует");
    }

    const response = await fetch(`${API_URL}/admin_refresh_token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
        clearAdminTokens();
        const message = await getErrorMessage(response, "Сессия администратора истекла");
        throw new Error(message);
    }

    const data = await response.json();
    saveAdminTokens(data);
    return data;
}

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
}

export async function checkAdminTokenValid() {
    const accessToken = getAdminAccessToken();
    const refreshToken = getAdminRefreshToken();

    if (!accessToken || !refreshToken) return false;
    if (!isTokenExpired(accessToken)) return true;

    try {
        await adminRefreshTokenRequest();
        return true;
    } catch {
        return false;
    }
}

export async function adminLogoutRequest() {
    const accessToken = getAdminAccessToken();

    try {
        await fetch(`${API_URL}/admin_logout`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` },
        });
    } finally {
        clearAdminTokens();
    }
}

export async function adminFetch(url, options = {}) {
    let accessToken = getAdminAccessToken();

    let response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers: { ...(options.headers || {}), Authorization: `Bearer ${accessToken}` },
    });

    if (response.status !== 401) return response;

    await adminRefreshTokenRequest();

    accessToken = getAdminAccessToken();

    response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers: { ...(options.headers || {}), Authorization: `Bearer ${accessToken}` },
    });

    return response;
}