import { adminFetch } from "./adminAuth.js";
import {api_url} from "../Autentification/auth.js";

const API_URL = api_url;

async function getErrorMessage(response, fallback) {
    try {
        const data = await response.json();

        if (typeof data.detail === "string") {
            return data.detail;
        }

        if (Array.isArray(data.detail)) {
            return data.detail
                    .map((item) => {
                        const field = Array.isArray(item.loc)
                                ? item.loc.join(".")
                                : "field";

                        return `${field}: ${item.msg}`;
                    })
                    .join("; ");
        }

        if (data.detail) {
            return JSON.stringify(data.detail);
        }

        return fallback;
    } catch {
        return fallback;
    }
}

async function readJsonOrNull(response) {
    const text = await response.text();

    if (!text) {
        return null;
    }

    return JSON.parse(text);
}

export async function getProducts(limit = 20, offset = 0, sort = "date", order = "desc", categoryId = null) {
    const params = new URLSearchParams({
        limit,
        offset,
        sort,
        order,
    });

    if (categoryId !== null && categoryId !== undefined && categoryId !== "") {
        params.append("category_id", categoryId);
    }

    const response = await fetch(`${API_URL}/?${params.toString()}`);

    if (!response.ok) {
        const message = await getErrorMessage(response, "Не удалось загрузить товары");
        throw new Error(message);
    }

    return response.json();
}

export async function createProduct(product) {
    const response = await adminFetch("/product", {
        method: "POST",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify(product),
    });

    if (!response.ok) {
        const message = await getErrorMessage(response, "Не удалось создать товар");
        throw new Error(message);
    }

    return readJsonOrNull(response);
}

export async function updateProduct(product) {
    const response = await adminFetch("/product", {
        method: "PUT",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify(product),
    });

    if (!response.ok) {
        const message = await getErrorMessage(response, "Не удалось обновить товар");
        throw new Error(message);
    }

    return readJsonOrNull(response);
}

export async function deleteProduct(id) {
    const response = await adminFetch(`/product?id=${encodeURIComponent(id)}`,
            {method: "DELETE",});
    if (!response.ok) {
        const message = await getErrorMessage(response, "Не удалось удалить товар");
        throw new Error(message);
    }

    return true;
}