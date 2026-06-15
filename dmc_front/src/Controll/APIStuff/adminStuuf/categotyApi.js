import { adminFetch } from "./adminAuth.js";
import {api_url} from "../Autentification/auth.js";

const API_URL = api_url;

//норм текст ошибки
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

        if (data.detail) {return JSON.stringify(data.detail);}
        return fallback;
    } catch {
        return fallback;
    }
}

async function readJsonOrNull(response) {
    const text = await response.text();
    if (!text) {return null;}
    return JSON.parse(text);
}

export async function getCategories() {
    const response = await fetch(`${API_URL}/categories`);

    if (!response.ok) {
        const message = await getErrorMessage(response, "Не удалось загрузить категории");
        throw new Error(message);
    }

    return response.json();
}
//загруз категорий, дальше в лист пеход
export async function getCategory(id) {
    const response = await fetch(
            `${API_URL}/categories/category?id=${encodeURIComponent(id)}`
    );

    if (!response.ok) {
        const message = await getErrorMessage(
                response,
                "Не удалось загрузить категорию"
        );

        throw new Error(message);
    }

    return response.json();
}

//создание категории и в модал кину
export async function createCategory(title) {
    const response = await adminFetch("/categories/category", {
        method: "POST",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({ title }),
    });

    if (!response.ok) {
        const message = await getErrorMessage(response, "Не удалось создать категорию");
        throw new Error(message);
    }

    return readJsonOrNull(response);
}
//апдейт категории
export async function updateCategory(id, title) {
    const response = await adminFetch("/categories/category", {
        method: "PUT",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({ id, title }),
    });

    if (!response.ok) {
        const message = await getErrorMessage(response, "Не удалось обновить категорию");
        throw new Error(message);
    }

    return readJsonOrNull(response);
}

export async function deleteCategory(id) {
    const response = await adminFetch(`/categories/category?id=${encodeURIComponent(id)}`,
            {method: "DELETE",}
    );

    if (!response.ok) {
        const message = await getErrorMessage(response, "Не удалось удалить категорию");
        throw new Error(message);
    }

    return true;
}