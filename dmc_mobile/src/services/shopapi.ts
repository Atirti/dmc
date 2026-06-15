import { apiRequest } from "./api";
import {
    Address,
    CartItem,
    Category,
    normalizeCart,
    normalizeCategories,
    normalizeOrder,
    normalizeOrders,
    normalizeProducts,
    Order,
    Product,
} from "../models/productmodel";

type ProductQuery = {
    limit?: number;
    offset?: number | null;
    sort?: "price" | "date";
    order?: "asc" | "desc";
    categoryId?: number | null;
};

type AuthorizedRequestOptions = {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
};

type AuthorizedRequest = <T>(
    path: string,
    options?: AuthorizedRequestOptions
) => Promise<T>;

function queryString(params: Record<string, string | number | null | undefined>): string {
    const parts = Object.entries(params)
        .filter(([, value]) => value !== null && value !== undefined && value !== "")
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);

    return parts.length > 0 ? `?${parts.join("&")}` : "";
}

function mergeProductCategories(products: Product[], categories: Category[]): Product[] {
    const categoriesById = new Map(categories.map((category) => [category.id, category]));

    return products.map((product) => {
        const category = product.category?.id
            ? categoriesById.get(product.category.id) ?? product.category
            : product.category;

        return {
            ...product,
            category,
        };
    });
}

function formatAddress(address: Address): string {
    return [
        address.street.trim(),
        address.house_num.trim(),
        address.apartament.trim() ? `кв. ${address.apartament.trim()}` : "",
    ]
        .filter(Boolean)
        .join(", ");
}

export async function getProducts(baseUrl: string, query: ProductQuery = {}): Promise<Product[]> {
    const qs = queryString({
        limit: query.limit ?? 20,
        offset: query.offset,
        sort: query.sort ?? "date",
        order: query.order ?? "desc",
        category_id: query.categoryId,
    });
    const response = await apiRequest<unknown>(baseUrl, `/${qs}`);

    return normalizeProducts(response);
}

export async function getCategories(baseUrl: string): Promise<Category[]> {
    const response = await apiRequest<unknown>(baseUrl, "/categories");

    return normalizeCategories(response);
}

export async function getCatalog(baseUrl: string, query: ProductQuery = {}) {
    const [categories, products] = await Promise.all([
        getCategories(baseUrl),
        getProducts(baseUrl, query),
    ]);

    return {
        categories,
        products: mergeProductCategories(products, categories),
    };
}

export async function getCart(authorizedRequest: AuthorizedRequest): Promise<CartItem[]> {
    const response = await authorizedRequest<unknown>("/cart/");

    return normalizeCart(response);
}

export async function setCartProductCount(
    authorizedRequest: AuthorizedRequest,
    productId: number,
    count: number
): Promise<CartItem[]> {
    const response = await authorizedRequest<unknown>("/cart/", {
        method: "PUT",
        body: {
            id: productId,
            count,
        },
    });

    return normalizeCart(response);
}

export async function deleteCartProduct(
    authorizedRequest: AuthorizedRequest,
    productId: number
): Promise<CartItem[]> {
    const qs = queryString({ id: productId });
    const response = await authorizedRequest<unknown>(`/cart/${qs}`, {
        method: "DELETE",
    });

    return normalizeCart(response);
}

export async function getOrders(authorizedRequest: AuthorizedRequest): Promise<Order[]> {
    const response = await authorizedRequest<unknown>("/orders");

    return normalizeOrders(response);
}

export async function createOrder(
    authorizedRequest: AuthorizedRequest,
    cartItems: CartItem[],
    address: Address
): Promise<Order> {
    const response = await authorizedRequest<unknown>("/order", {
        method: "POST",
        body: {
            products: cartItems.map((item) => ({
                product_id: item.id,
                product_count: item.countInCart,
            })),
            address: formatAddress(address),
        },
    });
    const order = normalizeOrder(response);

    if (!order) {
        throw new Error("Не удалось прочитать созданный заказ");
    }

    return order;
}
