import { authFetch, parseError } from "../Autentification/auth.js";

export async function getCartRequest() {
    const response = await authFetch("/cart/", {
        method: "GET",
    });

    if (!response.ok) {
        const message = await parseError(response);
        throw new Error(message);
    }

    return await response.json();
}

export async function changeCartCountRequest(id, count) {
    const response = await authFetch("/cart/", {
        method: "PUT",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({id: id, count: count,}),
    });

    if (!response.ok) {
        const message = await parseError(response);
        throw new Error(message);
    }

    return await response.json();
}

export async function deleteCartItemRequest(id) {
    const response = await authFetch(`/cart/?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        const message = await parseError(response);
        throw new Error(message);
    }

    return await response.json();
}

export async function addItemToCartRequest(id, count) {
    return await changeCartCountRequest(id, count);
}