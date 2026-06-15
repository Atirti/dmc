export const DEFAULT_API_BASE_URL = "http://192.168.0.9:8000";

export type ApiRequestOptions = {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    token?: string | null;
};

export class ApiError extends Error {
    status?: number;
    body?: unknown;

    constructor(message: string, status?: number, body?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.body = body;
    }
}

export function normalizeBaseUrl(value: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
        return DEFAULT_API_BASE_URL;
    }

    const withProtocol = /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `http://${trimmed}`;

    return withProtocol.replace(/\/+$/, "");
}

function buildUrl(baseUrl: string, path: string): string {
    const normalizedBase = normalizeBaseUrl(baseUrl);
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    return `${normalizedBase}${normalizedPath}`;
}

function parseJsonSafely(text: string): unknown {
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

function formatApiErrorBody(body: unknown): string | null {
    if (!body || typeof body !== "object") {
        return typeof body === "string" && body.trim() ? body : null;
    }

    const maybeDetail = (body as { detail?: unknown }).detail;

    if (typeof maybeDetail === "string") {
        return maybeDetail;
    }

    if (Array.isArray(maybeDetail)) {
        const messages = maybeDetail
            .map((item) => {
                if (typeof item === "string") {
                    return item;
                }

                if (item && typeof item === "object") {
                    const message = (item as { msg?: unknown }).msg;
                    const location = (item as { loc?: unknown }).loc;
                    const prefix = Array.isArray(location)
                        ? `${location.join(".")}: `
                        : "";

                    return typeof message === "string"
                        ? `${prefix}${message}`
                        : null;
                }

                return null;
            })
            .filter(Boolean);

        if (messages.length > 0) {
            return messages.join("\n");
        }
    }

    const message = (body as { message?: unknown }).message;

    if (typeof message === "string") {
        return message;
    }

    return null;
}

function makeNetworkMessage(_baseUrl: string, originalMessage: string): string {
    return [
        "Не удалось подключиться к серверу.",
        "Проверьте подключение к интернету и повторите попытку.",
        `Техническая ошибка: ${originalMessage}`,
    ].join("\n");
}

export async function apiRequest<T>(
    baseUrl: string,
    path: string,
    options: ApiRequestOptions = {}
): Promise<T> {
    const headers: Record<string, string> = {
        Accept: "application/json",
    };

    if (options.body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    if (options.token) {
        headers.Authorization = `Bearer ${options.token}`;
    }

    let response: Response;

    try {
        response = await fetch(buildUrl(baseUrl, path), {
            method: options.method ?? "GET",
            headers,
            body:
                options.body === undefined
                    ? undefined
                    : JSON.stringify(options.body),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "network error";
        throw new ApiError(makeNetworkMessage(baseUrl, message));
    }

    const contentType = response.headers.get("content-type") ?? "";
    const rawBody = await response.text();
    const responseBody = rawBody.length === 0
        ? null
        : contentType.includes("application/json")
            ? parseJsonSafely(rawBody)
            : rawBody;

    if (!response.ok) {
        const message =
            formatApiErrorBody(responseBody) ||
            `Ошибка сервера: HTTP ${response.status}`;

        throw new ApiError(message, response.status, responseBody);
    }

    return responseBody as T;
}
