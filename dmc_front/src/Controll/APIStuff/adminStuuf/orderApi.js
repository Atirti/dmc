import { adminFetch } from "./adminAuth.js";

export const ORDER_STATUSES = ["paid", "in delivery", "delivered",];
async function getErrorMessage(response, fallback) {
    if (response.status >= 500) {
        return "Что-то пошло не так";
    }

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

async function handleResponse(response, fallbackMessage) {
    if (!response.ok) {
        const message = await getErrorMessage(response, fallbackMessage);
        throw new Error(message);
    }

    return response.json();
}

export async function getAdminUserIdByUsername(username) {
    const params = new URLSearchParams();

    params.set("username", username);

    const response = await adminFetch(`/admin/get_user?${params.toString()}`, {method: "GET",});

    const data = await handleResponse(response, "Не удалось получить пользователя");

    if (typeof data === "number") {return data;}
    if (typeof data === "string") {return Number(data);}
    if (data.user_id) {return Number(data.user_id);}
    if (data.id) {return Number(data.id);}
    if (data.user?.id) {return Number(data.user.id);}

    throw new Error("Не удалось получить user_id пользователя");
}

export async function getAdminOrders(userId) {
    const response = await adminFetch(`/admin/orders?user_id=${userId}`, {method: "GET",});

    const data = await handleResponse(response, "Не удалось загрузить заказы");

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data.orders)) {
        return data.orders;
    }

    return [];
}

export async function getAdminAllOrders({limit = 10, offset = 0, status = "", sortBy = "created_at",
                                            sortOrder = "desc", createdAtFrom = "", createdAtTo = "",} = {}) {
    const params = new URLSearchParams();

    params.set("limit", String(limit));
    params.set("offset", String(offset));
    params.set("sort_by", sortBy);
    params.set("sort_order", sortOrder);

    if (status) {params.set("status", status);}
    if (createdAtFrom) {params.set("created_at_from", createdAtFrom);}
    if (createdAtTo) {params.set("created_at_to", createdAtTo);}

    const response = await adminFetch(`/admin/all_orders?${params.toString()}`, {method: "GET",});
    const data = await handleResponse(response, "Не удалось загрузить заказы");

    if (Array.isArray(data)) {return data;}
    if (Array.isArray(data.orders)) {return data.orders;}

    return [];
}

export async function updateOrderStatus({ userId, orderId, status }) {
    const response = await adminFetch("/order", {
        method: "PUT",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({order_id: Number(orderId), user_id: Number(userId), status,}),
    });

    return handleResponse(response, "Не удалось изменить статус заказа");
}
