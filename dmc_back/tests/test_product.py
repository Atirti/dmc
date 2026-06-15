import jwt
import pytest
import pytest_asyncio


@pytest_asyncio.fixture
async def product(client, admin):
    response = await client.post('/admin_login', json=admin)
    jwt = response.json()["jwt_token"]

    response = await client.post('/categories/category', json={"title": "test"},
                                 headers={"Authorization": f"Bearer {jwt}"})
    id_ = response.json()["id"]

    response = await client.post('/product', json={
        "title": "string",
        "description": "string",
        "price": 67,
        "picture_url": "string",
        "count_in_stock": 11,
        "category_id": id_
    },
                                 headers={"Authorization": f"Bearer {jwt}"})

    return response, jwt


@pytest.mark.asyncio
async def test_create_product(client, product):
    response, jwt = product
    assert response.status_code == 200
    assert response.json()["title"] == "string"
    assert response.json()["description"] == "string"
    assert response.json()["price"] == 67
    assert response.json()["picture_url"] == "string"
    assert response.json()["count_in_stock"] == 11
    assert response.json()["category_id"] == 1


@pytest.mark.asyncio
async def test_get_product(client, product):
    response, _ = product
    id_ = response.json()["id"]

    response1 = await client.get(f'/product?id={id_}')
    assert response1.status_code == 200
    assert response1.json() == response.json()


@pytest.mark.asyncio
async def test_get_products(client, admin):
    response = await client.post('/admin_login', json=admin)
    jwt = response.json()["jwt_token"]
    headers = {"Authorization": f"Bearer {jwt}"}

    category = await client.post('/categories/category', json={"title": "test"}, headers=headers)
    category_id = category.json()["id"]

    products = []
    for i in range(10):
        response = await client.post('/product', json={
            "title": f"product {i}",
            "description": "desc",
            "price": i * 10,
            "picture_url": None,
            "count_in_stock": 10,
            "category_id": category_id
        }, headers=headers)
        products.append(response.json())

    response = await client.get("/?limit=5&offset=0&sort=date&order=desc")
    assert response.status_code == 200
    assert len(response.json()) == 5
    assert response.json() == list(reversed(products))[0:5]

    response = await client.get("/?limit=5&offset=5&sort=date&order=desc")
    assert response.status_code == 200
    assert len(response.json()) == 5
    assert response.json() == list(reversed(products))[5:10]

    response = await client.get("/?limit=5&offset=5&sort=date&order=asc")
    assert response.status_code == 200
    assert len(response.json()) == 5
    assert response.json() == products[5:10]

    response = await client.get("/?limit=5&offset=0&sort=price&order=asc")
    assert response.status_code == 200
    assert len(response.json()) == 5
    assert response.json() == sorted(products, key=lambda x: x['price'])[0:5]


@pytest.mark.asyncio
async def test_update_product(client, product):
    response, jwt = product
    old = response.json()

    response = await client.put(f'/product', json={"id": old["id"],
                                                    "title": "new title",
                                                    "description": "new description",
                                                    "price": 123,
                                                    "picture_url": "new url",
                                                    "count_in_stock": 22,
                                                    "category_id": None},
                                headers={"Authorization": f"Bearer {jwt}"})
    assert response.status_code == 200
    assert response.json() != old
    new = response.json()

    response = await client.get(f'/product?id={old["id"]}')
    assert response.json() != old
    assert response.json() == new


@pytest.mark.asyncio
async def test_delete_product(client, product):
    response, jwt = product
    id_ = response.json()["id"]

    response = await client.delete(f'/product?id={id_}', headers={"Authorization": f"Bearer {jwt}"})
    assert response.status_code == 200

    response = await client.delete(f'/product?id={id_}', headers={"Authorization": f"Bearer {jwt}"})
    assert response.status_code == 404
