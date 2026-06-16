import pytest
import jwt


async def get_admin_headers(client, admin):
    response = await client.post("/admin_login", json=admin)
    return {"Authorization": f"Bearer {response.json()['jwt_token']}"}


async def get_user_headers(client):
    response = await client.post(
        "/registration",
        json={"username": "order_user", "password": "Very_1Pass!"},
    )
    return {"Authorization": f"Bearer {response.json()['jwt_token']}"}


async def get_user_auth(client):
    response = await client.post(
        "/registration",
        json={"username": "order_user", "password": "Very_1Pass!"},
    )
    jwt_token = response.json()["jwt_token"]
    payload = jwt.decode(jwt_token, options={"verify_signature": False})
    return {"Authorization": f"Bearer {jwt_token}"}, payload["user_id"]


async def get_user_auth_by_username(client, username: str):
    response = await client.post(
        "/registration",
        json={"username": username, "password": "Very_1Pass!"},
    )
    jwt_token = response.json()["jwt_token"]
    payload = jwt.decode(jwt_token, options={"verify_signature": False})
    return {"Authorization": f"Bearer {jwt_token}"}, payload["user_id"]


async def create_product(client, admin_headers, count_in_stock=5, price=10):
    category = await client.post(
        "/categories/category",
        json={"title": "order category"},
        headers=admin_headers,
    )

    response = await client.post(
        "/product",
        json={
            "title": "order product",
            "description": "desc",
            "price": price,
            "picture_url": None,
            "count_in_stock": count_in_stock,
            "category_id": category.json()["id"],
        },
        headers=admin_headers,
    )
    return response.json()


@pytest.mark.asyncio
async def test_create_order_decreases_stock(client, admin):
    admin_headers = await get_admin_headers(client, admin)
    user_headers = await get_user_headers(client)
    product = await create_product(client, admin_headers, count_in_stock=5, price=10)

    response = await client.post(
        "/order",
        json={"products": [{"product_id": product["id"], "product_count": 2}], "address": "address"},
        headers=user_headers,
    )

    assert response.status_code == 200
    assert response.json()["price"] == 20
    assert response.json()["products"][0]["id"] == product["id"]
    assert response.json()["products"][0]["count"] == 2

    response = await client.get(f"/product?id={product['id']}")
    assert response.status_code == 200
    assert response.json()["count_in_stock"] == 3


@pytest.mark.asyncio
async def test_get_orders_and_update_order_status(client, admin):
    admin_headers = await get_admin_headers(client, admin)
    user_headers, user_id = await get_user_auth(client)
    product = await create_product(client, admin_headers, count_in_stock=5, price=10)

    created = await client.post(
        "/order",
        json={"products": [{"product_id": product["id"], "product_count": 2}], "address": "address"},
        headers=user_headers,
    )
    assert created.status_code == 200
    order_id = created.json()["id"]

    response = await client.get("/orders", headers=user_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] == order_id

    response = await client.get(f"/order?id={order_id}", headers=user_headers)
    assert response.status_code == 200
    assert response.json()["id"] == order_id

    response = await client.get(f"/admin/orders?user_id={user_id}", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()[0]["id"] == order_id

    response = await client.get(f"/admin/order?user_id={user_id}&order_id={order_id}", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["id"] == order_id

    response = await client.put(
        "/order",
        json={"order_id": order_id, "user_id": user_id, "status": "shipped"},
        headers=admin_headers,
    )
    assert response.status_code == 200
    assert response.json()["status"] == "shipped"

    response = await client.get(f"/order?id={order_id}", headers=user_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "shipped"


@pytest.mark.asyncio
async def test_get_admin_all_orders_filters_by_status_and_paginates(client, admin):
    admin_headers = await get_admin_headers(client, admin)
    first_user_headers, first_user_id = await get_user_auth(client)
    second_user_headers, second_user_id = await get_user_auth_by_username(client, "second_order_user")
    product = await create_product(client, admin_headers, count_in_stock=5, price=10)

    first_order = await client.post(
        "/order",
        json={"products": [{"product_id": product["id"], "product_count": 1}], "address": "first address"},
        headers=first_user_headers,
    )
    second_order = await client.post(
        "/order",
        json={"products": [{"product_id": product["id"], "product_count": 1}], "address": "second address"},
        headers=second_user_headers,
    )
    assert first_order.status_code == 200
    assert second_order.status_code == 200

    await client.put(
        "/order",
        json={"order_id": second_order.json()["id"], "user_id": second_user_id, "status": "packed"},
        headers=admin_headers,
    )

    response = await client.get("/admin/all_orders", headers=admin_headers)
    assert response.status_code == 200
    assert {order["user_id"] for order in response.json()} == {first_user_id, second_user_id}

    response = await client.get("/admin/all_orders?status=packed", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()[0]["id"] == second_order.json()["id"]
    assert response.json()[0]["user_id"] == second_user_id
    assert response.json()[0]["status"] == "packed"

    response = await client.get(
        "/admin/all_orders",
        params={"created_at_from": "2100-01-01T00:00:00+05:00"},
        headers=admin_headers,
    )
    assert response.status_code == 200
    assert response.json() == []

    response = await client.get(
        "/admin/all_orders",
        params={"created_at_from": "2026-06-16T00:00:00"},
        headers=admin_headers,
    )
    assert response.status_code == 422

    response = await client.get(
        "/admin/all_orders",
        params={
            "created_at_from": "2026-06-17T00:00:00+05:00",
            "created_at_to": "2026-06-16T00:00:00+05:00",
        },
        headers=admin_headers,
    )
    assert response.status_code == 400

    response = await client.get("/admin/all_orders?limit=1&offset=1", headers=admin_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1

@pytest.mark.asyncio
async def test_create_order_rejects_missing_product(client):
    user_headers = await get_user_headers(client)

    response = await client.post(
        "/order",
        json={"products": [{"product_id": 999, "product_count": 1}], "address": "address"},
        headers=user_headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"


@pytest.mark.asyncio
async def test_create_order_aggregates_duplicate_products(client, admin):
    admin_headers = await get_admin_headers(client, admin)
    user_headers = await get_user_headers(client)
    product = await create_product(client, admin_headers, count_in_stock=5, price=10)

    response = await client.post(
        "/order",
        json={
            "products": [
                {"product_id": product["id"], "product_count": 2},
                {"product_id": product["id"], "product_count": 1},
            ],
            "address": "address",
        },
        headers=user_headers,
    )

    assert response.status_code == 200
    assert response.json()["price"] == 30
    assert len(response.json()["products"]) == 1
    assert response.json()["products"][0]["count"] == 3

    response = await client.get(f"/product?id={product['id']}")
    assert response.status_code == 200
    assert response.json()["count_in_stock"] == 2


@pytest.mark.asyncio
async def test_create_order_rejects_duplicate_products_above_total_stock(client, admin):
    admin_headers = await get_admin_headers(client, admin)
    user_headers = await get_user_headers(client)
    product = await create_product(client, admin_headers, count_in_stock=3, price=10)

    response = await client.post(
        "/order",
        json={
            "products": [
                {"product_id": product["id"], "product_count": 2},
                {"product_id": product["id"], "product_count": 2},
            ],
            "address": "address",
        },
        headers=user_headers,
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Not enough order product in stock"

    response = await client.get(f"/product?id={product['id']}")
    assert response.status_code == 200
    assert response.json()["count_in_stock"] == 3
