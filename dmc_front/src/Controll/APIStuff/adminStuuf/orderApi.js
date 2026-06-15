import { adminFetch } from "./adminAuth.js";

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

async function handleResponse(response, fallbackMessage) {
    if (!response.ok) {
        const message = await getErrorMessage(response, fallbackMessage);
        throw new Error(message);
    }

    return response.json();
}

export async function getAdminOrders(userId) {
    const response = await adminFetch(`/admin/orders?user_id=${userId}`, {
        method: "GET",
    });

    const data = await handleResponse(response, "Не удалось загрузить заказы");

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data.orders)) {
        return data.orders;
    }

    return [];
}

export async function getAdminOrder({ userId, orderId }) {
    const response = await adminFetch(`/admin/order?user_id=${userId}&order_id=${orderId}`, {
        method: "GET",
    });

    return handleResponse(response, "Не удалось загрузить заказ");
}

export async function updateOrderStatus({ userId, orderId, status }) {
    const response = await adminFetch("/order", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            order_id: Number(orderId),
            user_id: Number(userId),
            status,
        }),
    });

    return handleResponse(response, "Не удалось изменить статус заказа");
}