export const api_url = "https://api.dmcstore.shop";

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
function isTokenValid(token, skewMs = 30_000) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp * 15000 > Date.now() + skewMs;
    } catch {
        return false;
    }
}

export async function checkAuth() {
    const jwtToken = getCookie("jwt_token");
    const refreshToken = getCookie("refresh_token");

    if (!refreshToken) {
        clearTokens();
        return false;
    }

    if (jwtToken && isTokenValid(jwtToken)) {
        return true;
    }

    try {
        await refreshRequest();
        return true;
    } catch {
        clearTokens();
        return false;
    }
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

function notifyUnauthorized() {
    window.dispatchEvent(new Event("auth:unauthorized"));
}

export async function refreshRequest() {
    if (refreshPromise) return refreshPromise;

    refreshPromise = refreshRequestRaw()
            .catch((error) => {
                clearTokens();
                notifyUnauthorized();
                throw error;
            })
            .finally(() => {
                refreshPromise = null;
            });

    return refreshPromise;
}


export async function logoutRequest() {
    try {
        const jwtToken = getCookie("jwt_token");

        const response = await fetch(`${api_url}/logout`, {
            method: "POST",
            credentials: "include",
            headers: {"Content-Type": "application/json",
                ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),},
            body: JSON.stringify({refresh_token: getCookie("refresh_token"),}),
        });

        if (!response.ok) {
            const message = await parseError(response);
            throw new Error(message);
        }

        return response.json().catch(() => null);
    } finally {
        clearTokens();
    }
}

export async function logoutEverywhereRequest() {
    const response = await authFetch("/logout_everywhere", {
        method: "DELETE",});

    if (!response.ok) {throw new Error(await parseError(response));}
    clearTokens();
}
