import { authFetch, parseError } from "../Autentification/auth.js";

export async function createOrderRequest(address, products) {
    const response = await authFetch("/order", {
        method: "POST",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({address: address, products: products,}),
    });

    if (!response.ok) {
        const message = await parseError(response);
        throw new Error(message);
    }

    return await response.json();
}
export async function getUserOrdersRequest() {
    const response = await authFetch("/orders", {
        method: "GET",
    });

    if (!response.ok) {
        const message = await parseError(response);
        throw new Error(message);
    }

    return await response.json();
}