import { api_url, parseError } from "../Autentification/auth.js";

export async function getItemsRequest(_limit = 10, _offset = 0, _order = "desc", _sort = "date", _categoryId="") {
    const params = new URLSearchParams({
        limit: _limit,
        offset: _offset,
        sort: _sort,
        order: _order,
        categotyId: _categoryId
    });
    if (_categoryId !== "") {
        params.append("category_id", _categoryId);
    }
    const response = await fetch(`${api_url}/?${params.toString()}`, {
        method: "GET",
    });

    if (!response.ok) {
        const message = await parseError(response);
        throw new Error(message);
    }

    return await response.json();
}