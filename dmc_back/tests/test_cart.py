import pytest


async def get_admin_headers(client, admin):
    response = await client.post("/admin_login", json=admin)
    return {"Authorization": f"Bearer {response.json()['jwt_token']}"}


async def get_user_headers(client):
    response = await client.post(
        "/registration",
        json={"username": "cart_user", "password": "Very_1Pass!"},
    )
    return {"Authorization": f"Bearer {response.json()['jwt_token']}"}


async def create_product(client, admin_headers, count_in_stock=5):
    category = await client.post(
        "/categories/category",
        json={"title": "cart category"},
        headers=admin_headers,
    )

    response = await client.post(
        "/product",
        json={
            "title": "cart product",
            "description": "desc",
            "price": 10,
            "picture_url": None,
            "count_in_stock": count_in_stock,
            "category_id": category.json()["id"],
        },
        headers=admin_headers,
    )
    return response.json()


@pytest.mark.asyncio
async def test_change_and_delete_cart_product(client, admin):
    admin_headers = await get_admin_headers(client, admin)
    user_headers = await get_user_headers(client)
    product = await create_product(client, admin_headers)

    response = await client.put("/cart/", json={"id": product["id"], "count": 2}, headers=user_headers)
    assert response.status_code == 200
    assert response.json()[0]["id"] == product["id"]
    assert response.json()[0]["count_in_cart"] == 2

    response = await client.put("/cart/", json={"id": product["id"], "count": 3}, headers=user_headers)
    assert response.status_code == 200
    assert response.json()[0]["count_in_cart"] == 3

    response = await client.delete(f"/cart/?id={product['id']}", headers=user_headers)
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_change_cart_product_rejects_missing_product(client):
    user_headers = await get_user_headers(client)

    response = await client.put("/cart/", json={"id": 999, "count": 1}, headers=user_headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"


@pytest.mark.asyncio
async def test_change_cart_product_rejects_count_above_stock_on_insert(client, admin):
    admin_headers = await get_admin_headers(client, admin)
    user_headers = await get_user_headers(client)
    product = await create_product(client, admin_headers, count_in_stock=2)

    response = await client.put("/cart/", json={"id": product["id"], "count": 3}, headers=user_headers)
    assert response.status_code == 409
    assert response.json()["detail"] == "Not enough product in stock."

    response = await client.get("/cart/", headers=user_headers)
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_change_cart_product_rejects_count_above_stock_on_update(client, admin):
    admin_headers = await get_admin_headers(client, admin)
    user_headers = await get_user_headers(client)
    product = await create_product(client, admin_headers, count_in_stock=2)

    response = await client.put("/cart/", json={"id": product["id"], "count": 1}, headers=user_headers)
    assert response.status_code == 200

    response = await client.put("/cart/", json={"id": product["id"], "count": 3}, headers=user_headers)
    assert response.status_code == 409
    assert response.json()["detail"] == "Not enough product in stock."

    response = await client.get("/cart/", headers=user_headers)
    assert response.status_code == 200
    assert response.json()[0]["count_in_cart"] == 1


@pytest.mark.asyncio
async def test_delete_cart_product_rejects_product_not_in_cart(client):
    user_headers = await get_user_headers(client)

    response = await client.delete("/cart/?id=999", headers=user_headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found in cart"
