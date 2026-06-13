export const api_url = "http://127.0.0.1:8000";

async function parseError(response) {
    const data = await response.json().catch(() => null);

    if (Array.isArray(data?.detail)) {
        return data.detail.map((error) => error.msg).join(", ");
    }

    return data?.detail || "Ошибка запроса";
}

export function getCookie(name) {
    const cookies = document.cookie.split("; ");
    const cookie = cookies.find((item) => item.startsWith(`${name}=`));

    if (!cookie) {
        return null;
    }

    return decodeURIComponent(cookie.substring(name.length + 1));
}

export function deleteCookie(name) {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

function setCookie(name, value) {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
}

export function saveTokens(tokens) {
    setCookie("jwt_token", tokens.jwt_token);
    setCookie("refresh_token", tokens.refresh_token);
}

export function clearTokens() {
    deleteCookie("jwt_token");
    deleteCookie("refresh_token");
}
let refreshPromise = null;


export async function loginRequest(username, password) {
    const response = await fetch(`${api_url}/login`, {
        method: "POST",
        credentials: "include",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({username, password,}),
    });

    if (!response.ok) {
        const message = await parseError(response);
        throw new Error(message);
    }
    const tokens = await response.json();
    saveTokens(tokens);
    return tokens;
}

export async function registrationRequest(username, password) {
    const response = await fetch(`${api_url}/registration`, {
        method: "POST",
        credentials: "include",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({username, password,}),
    });

    if (!response.ok) {
        const message = await parseError(response);
        throw new Error(message);
    }
    const tokens = await response.json();
    saveTokens(tokens);

    return tokens;
}

async function refreshRequestRaw() {
    const refreshToken = getCookie("refresh_token");

    if (!refreshToken) {
        throw new Error("Refresh token отсутствует");
    }

    const response = await fetch(`${api_url}/refresh_token`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            refresh_token: refreshToken,
        }),
    });

    if (!response.ok) {
        const message = await parseError(response);
        throw new Error(message);
    }

    const tokens = await response.json();

    saveTokens(tokens);

    return tokens;
}

export async function refreshRequest() {
    if (refreshPromise) {
        return refreshPromise;
    }
    refreshPromise = refreshRequestRaw()
            .catch((error) => {clearTokens();throw error;})
            .finally(() => {refreshPromise = null;});
    return refreshPromise;
}

export async function logoutRequest() {
    const refreshToken = getCookie("refresh_token");

    if (!refreshToken) {
        clearTokens();
        return null;
    }

    const response = await fetch(`${api_url}/logout`, {
        method: "POST",
        credentials: "include",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({refresh_token: refreshToken,}),
    });

    clearTokens();

    if (!response.ok) {
        const message = await parseError(response);
        throw new Error(message);
    }

    return response.json().catch(() => null);
}

export async function checkAuth() {
    const refreshToken = getCookie("refresh_token");
    if (!refreshToken) {
        clearTokens();
        return false;
    }

    try {
        await refreshRequest();
        return true;

    } catch (error) {
        console.error("Auth check failed:", error);
        clearTokens();
        return false;
    }
}