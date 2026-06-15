export const api_url = "http://127.0.0.1:8000";

export async function authFetch(path, options = {}, retry = true) {
    const jwtToken = getCookie("jwt_token");

    const response = await fetch(`${api_url}${path}`, {
        ...options,
        credentials: "include",
        headers: {
            ...(options.headers || {}),
            ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
        },
    });

    if (response.status !== 401 || !retry) {
        return response;
    }
    await refreshRequest();

    const newJwtToken = getCookie("jwt_token");

    return await fetch(`${api_url}${path}`, {...options,
        credentials: "include",
        headers: {...(options.headers || {}), ...(newJwtToken ? { Authorization: `Bearer ${newJwtToken}` } : {}),
        },
    });
}

export async function parseError(response) {
    const data = await response.json().catch(() => null);

    if (Array.isArray(data?.detail)) {
        return data.detail
                .map((error) => {
                    const location = Array.isArray(error.loc) ? error.loc.join(".") : "";
                    return location ? `${location}: ${error.msg}` : error.msg;
                }).join(", ");
    }
    if (typeof data?.detail === "string") {
        return data.detail;
    }
    return "Ошибка запроса";
}
export function saveUsername(username) {
    setCookie("username", username);
}

export function getCurrentUsername() {
    const username = getCookie("username");

    if (username) {
        return username;
    }

    return "Пользователь";
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
    console.log("new jwt:", getCookie("jwt_token"));
    console.log("new refresh:", getCookie("refresh_token"));
    console.log("response tokens:", tokens);
}

export function clearTokens() {
    deleteCookie("jwt_token");
    deleteCookie("refresh_token");
    deleteCookie("username");
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
    saveUsername(username);
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
    saveUsername(username);

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
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({refresh_token: refreshToken,}),
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

    const response = await authFetch("/logout", {
        method: "POST",
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
export async function logoutEverywhereRequest() {
    const response = await fetch(`${api_url}/logout_everywhere`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!response.ok) {
        let message = "Ошибка выхода со всех устройств";

        try {
            const data = await response.json();
            message = data.detail || message;
        } catch {
            message = response.statusText || message;
        }

        throw new Error(message);
    }
}

export async function checkAuth() {
    const jwtToken = getCookie("jwt_token");
    const refreshToken = getCookie("refresh_token");

    if (!refreshToken) {
        clearTokens();
        return false;
    }

    if (jwtToken) {
        return true;
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