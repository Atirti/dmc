import { Address, CartItem, Order, Product } from "../models/productmodel";

let localCart: CartItem[] = [];
let localOrders: Order[] = [];
let nextOrderId = 1;

export function getLocalCart(): CartItem[] {
    return localCart.map((item) => ({ ...item }));
}

export function addLocalToCart(product: Product, count = 1): CartItem[] {
    const safeCount = Math.max(1, count);
    const existingIndex = localCart.findIndex((item) => item.id === product.id);

    if (existingIndex >= 0) {
        const existing = localCart[existingIndex];

        localCart[existingIndex] = {
            ...existing,
            countInCart: existing.countInCart + safeCount,
        };
    } else {
        localCart.push({
            ...product,
            countInCart: safeCount,
        });
    }

    return getLocalCart();
}

export function removeLocalFromCart(productId: number, count = 1): CartItem[] {
    const safeCount = Math.max(1, count);

    localCart = localCart
        .map((item) => {
            if (item.id !== productId) {
                return item;
            }

            return {
                ...item,
                countInCart: item.countInCart - safeCount,
            };
        })
        .filter((item) => item.countInCart > 0);

    return getLocalCart();
}

export function clearLocalCart(): CartItem[] {
    localCart = [];

    return getLocalCart();
}

export function createLocalOrder(address: Address): Order {
    const products = localCart.map((item) => ({
        ...item,
        count: item.countInCart,
    }));
    const price = products.reduce((sum, product) => sum + product.price * product.count, 0);
    const order: Order = {
        id: nextOrderId,
        products,
        address,
        status: "Создан локально",
        price,
    };

    nextOrderId += 1;
    localOrders = [order, ...localOrders];
    clearLocalCart();

    return { ...order };
}

export function getLocalOrders(): Order[] {
    return localOrders.map((order) => ({
        ...order,
        products: order.products.map((product) => ({ ...product })),
        address: order.address ? { ...order.address } : null,
    }));
}
