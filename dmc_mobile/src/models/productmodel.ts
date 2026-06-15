export type Category = {
    id: number;
    title: string;
};

export type Product = {
    id: number;
    title: string;
    price: number;
    description: string;
    pictureUrl?: string | null;
    countInStock?: number | null;
    countInCart?: number | null;
    category?: Category | null;
};

export type CartItem = Product & {
    countInCart: number;
};

export type OrderProduct = Product & {
    count: number;
};

export type Address = {
    street: string;
    house_num: string;
    apartament: string;
};

export type Order = {
    id: number;
    products: OrderProduct[];
    address?: Address | null;
    status?: string | null;
    price?: number | null;
};

function toNumber(value: unknown, fallback = 0): number {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string") {
        const parsed = Number(value.replace(",", "."));

        return Number.isFinite(parsed) ? parsed : fallback;
    }

    return fallback;
}

function readArray(source: unknown, keys: string[]): unknown[] {
    if (Array.isArray(source)) {
        return source;
    }

    if (!source || typeof source !== "object") {
        return [];
    }

    for (const key of keys) {
        const value = (source as Record<string, unknown>)[key];

        if (Array.isArray(value)) {
            return value;
        }
    }

    return [];
}

export function normalizeCategory(input: unknown): Category | null {
    if (!input || typeof input !== "object") {
        return null;
    }

    const record = input as Record<string, unknown>;
    const id = toNumber(record.id, NaN);

    if (!Number.isFinite(id)) {
        return null;
    }

    return {
        id,
        title: String(record.title ?? record.name ?? `Категория ${id}`),
    };
}

export function normalizeCategories(response: unknown): Category[] {
    return readArray(response, ["categories", "items", "data", "results"])
        .map(normalizeCategory)
        .filter((item): item is Category => item !== null);
}

export function normalizeProduct(input: unknown): Product | null {
    if (!input || typeof input !== "object") {
        return null;
    }

    const record = input as Record<string, unknown>;
    const id = toNumber(record.id ?? record.product_id, NaN);

    if (!Number.isFinite(id)) {
        return null;
    }

    const nestedCategory = normalizeCategory(record.category);
    const categoryId = toNumber(record.category_id ?? record.categoryId, NaN);
    const category = nestedCategory ?? (Number.isFinite(categoryId)
        ? {
              id: categoryId,
              title: String(record.category_title ?? record.category_name ?? `Категория ${categoryId}`),
          }
        : null);

    return {
        id,
        title: String(record.title ?? record.name ?? `Товар ${id}`),
        price: toNumber(record.price),
        description: String(record.description ?? ""),
        pictureUrl: typeof record.picture_url === "string"
            ? record.picture_url
            : typeof record.pictureUrl === "string"
                ? record.pictureUrl
                : null,
        countInStock: record.count_in_stock === undefined
            ? null
            : toNumber(record.count_in_stock),
        countInCart: record.count_in_cart === undefined
            ? null
            : toNumber(record.count_in_cart),
        category,
    };
}

export function normalizeProducts(response: unknown): Product[] {
    const source = readArray(response, ["products", "items", "data", "results"]);

    if (source.length === 0 && response && typeof response === "object") {
        const singleProduct = normalizeProduct(response);

        return singleProduct ? [singleProduct] : [];
    }

    return source
        .map(normalizeProduct)
        .filter((item): item is Product => item !== null);
}

export function normalizeCart(response: unknown): CartItem[] {
    return normalizeProducts(response).map((product) => ({
        ...product,
        countInCart: product.countInCart && product.countInCart > 0
            ? product.countInCart
            : 1,
    }));
}

export function normalizeOrder(input: unknown): Order | null {
    if (!input || typeof input !== "object") {
        return null;
    }

    const record = input as Record<string, unknown>;
    const id = toNumber(record.id ?? record.order_id, NaN);

    if (!Number.isFinite(id)) {
        return null;
    }

    const products = readArray(record.products, ["products", "items", "data"])
        .map((item) => {
            const itemRecord = item && typeof item === "object"
                ? item as Record<string, unknown>
                : {};
            const nestedProduct = itemRecord.product ?? item;
            const product = normalizeProduct(nestedProduct);

            if (!product) {
                return null;
            }

            return {
                ...product,
                count: toNumber(itemRecord.count ?? itemRecord.product_count ?? itemRecord.count_in_cart, 1),
            };
        })
        .filter((item): item is OrderProduct => item !== null);

    return {
        id,
        products,
        address: typeof record.address === "string"
            ? { street: record.address, house_num: "", apartament: "" }
            : record.address && typeof record.address === "object"
                ? record.address as Address
                : null,
        status: typeof record.status === "string" ? record.status : null,
        price: record.price === undefined ? null : toNumber(record.price),
    };
}

export function normalizeOrders(response: unknown): Order[] {
    return readArray(response, ["orders", "items", "data", "results"])
        .map(normalizeOrder)
        .filter((item): item is Order => item !== null);
}

export function resolveMediaUrl(baseUrl: string, pictureUrl?: string | null): string | null {
    if (!pictureUrl) {
        return null;
    }

    if (/^https?:\/\//i.test(pictureUrl)) {
        return pictureUrl;
    }

    const normalizedBase = baseUrl.replace(/\/+$/, "");
    const normalizedPath = pictureUrl.startsWith("/") ? pictureUrl : `/${pictureUrl}`;

    return `${normalizedBase}${normalizedPath}`;
}
