
const api_url = "http://127.0.0.1:8000"; //Заглушка ее потом в енм выкинутьь

async function parseError(response) {
    const data = await response.json().catch(() => null);

    if (Array.isArray(data?.detail)) {
        return data.detail.map((error) => error.msg).join(", ");
    }

    return data?.detail || "Ошибка запроса";
}
function getCookie(name) {
    const cookies = document.cookie.split("; ");

    const cookie = cookies.find((item) => item.startsWith(`${name}=`));

    if (!cookie) {
        return null;
    }

    return cookie.substring(name.length + 1);
}


function deleteCookie(name) {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export async function loginRequest(username, password) {
    const response = await fetch(`${api_url}/auth/login`, {
        method:"POST",
        credentials: "include",
        headers:{"Content-Type": "application/json"},
        body: JSON.stringify({username: username, password: password})
    });
    if (!response.ok) {
        const message = await parseError(response);
        throw new Error(message);
    }
    return response.json()
}

export async function registrationRequest(username, password) {
    const response = await fetch(`${api_url}/auth/registration`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: username,
            password: password,
        }),
    });
    if (!response.ok) {
        const message = await parseError(response);
        throw new Error(message);
    }
    return response.json()
}


export async function refreshRequest() {
    const refreshToken = getCookie("refresh_token");

    if (!refreshToken) {
        throw new Error("Refresh token отсутствует");
    }

    const response = await fetch(`${api_url}/auth/refresh_token`, {
        method:"POST",
        credentials: "include",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({
            refresh_token: refreshToken,
        }),
    });

    if (!response.ok) {
        const message = await parseError(response);
        throw new Error(message);
    }

    const tokens = await response.json();

    document.cookie = `jwt_token=${tokens.jwt_token}; path=/; SameSite=Lax`;
    document.cookie = `refresh_token=${tokens.refresh_token}; path=/; SameSite=Lax`;

    return tokens;
}


export async function logoutRequest() {
    const refreshToken = getCookie("refresh_token");

    if (!refreshToken) {
        deleteCookie("jwt_token");
        deleteCookie("refresh_token");
        return;
    }

    const response = await fetch(`${api_url}/auth/logout`, {
        method:"POST",
        credentials: "include",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({
            refresh_token: refreshToken,
        }),
    });

    deleteCookie("jwt_token");
    deleteCookie("refresh_token");

    if (!response.ok) {
        const message = await parseError(response);
        throw new Error(message);
    }

    return response.json().catch(() => null);
}