export type AuthCredentials = {
    username: string;
    password: string;
};

export type LoginResponseDto = {
    jwt_token?: string;
    jwt?: string;
    access_token?: string;
    refresh_token?: string;
};

export type AuthTokens = {
    jwtToken: string;
    refreshToken: string;
};

export type JwtPayload = {
    user_id?: number | string;
    username?: string;
    exp?: number;
};

function decodeBase64(base64: string): string {
    if (typeof globalThis.atob === "function") {
        return globalThis.atob(base64);
    }

    const alphabet =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const clean = base64.replace(/=+$/, "");
    let buffer = 0;
    let bits = 0;
    let output = "";

    for (const char of clean) {
        const value = alphabet.indexOf(char);

        if (value < 0) {
            continue;
        }

        buffer = (buffer << 6) | value;
        bits += 6;

        if (bits >= 8) {
            bits -= 8;
            output += String.fromCharCode((buffer >> bits) & 0xff);
        }
    }

    return output;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
    try {
        const payloadPart = token.split(".")[1];

        if (!payloadPart) {
            return null;
        }

        const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
        const json = decodeBase64(padded);

        return JSON.parse(json) as JwtPayload;
    } catch {
        return null;
    }
}

export function mapLoginResponseToTokens(response: LoginResponseDto): AuthTokens {
    const jwtToken = response.jwt_token || response.jwt || response.access_token;
    const refreshToken = response.refresh_token;

    if (!jwtToken || !refreshToken) {
        throw new Error(
            "Не удалось прочитать ответ авторизации"
        );
    }

    return {
        jwtToken,
        refreshToken,
    };
}
