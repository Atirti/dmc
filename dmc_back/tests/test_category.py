import pytest


@pytest.mark.asyncio
async def test_create_category(client, admin):
    response = await client.post('/admin_login', json=admin)
    jwt = response.json()["jwt_token"]

    response = await client.post('/categories/category', json={"title": "test"})
    assert response.status_code == 401

    response = await client.post('/categories/category', json={"title": "test"},
                                 headers={"Authorization": f"Bearer {jwt}"})
    assert response.status_code == 200
    assert "id" in response.json()
    assert "title" in response.json()

    response = await client.post('/categories/category', json={"title": "test"},
                                 headers={"Authorization": f"Bearer {jwt}"})
    assert response.status_code == 409

    response = await client.post('registration', json={"username": "test", "password": "Very_$tronp1ssw"})
    jwt = response.json()["jwt_token"]

    response = await client.post('/categories/category', json={"title": "test"},
                                 headers={"Authorization": f"Bearer {jwt}"})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_category(client, admin):
    response = await client.post('/admin_login', json=admin)
    jwt = response.json()["jwt_token"]

    response = await client.post('/categories/category', json={"title": "test"},
                                 headers={"Authorization": f"Bearer {jwt}"})

    id_ = response.json()["id"]
    response = await client.get(f"/categories/category?id={id_}")
    assert response.status_code == 200
    assert response.json()["id"] == id_
    assert response.json()["title"] == "test"

    response = await client.post('/categories/category', json={"title": "test 2"},
                                 headers={"Authorization": f"Bearer {jwt}"})

    id_ = response.json()["id"]
    response = await client.get(f"/categories/category?id={id_}")
    assert response.status_code == 200
    assert response.json()["id"] == id_
    assert response.json()["title"] == "test 2"

    response = await client.get(f"/categories/category?id=999")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_categories(client, admin):
    response = await client.post('/admin_login', json=admin)
    jwt = response.json()["jwt_token"]

    first = await client.post('/categories/category', json={"title": "b"},
                              headers={"Authorization": f"Bearer {jwt}"})

    second = await client.post('/categories/category', json={"title": "a"},
                               headers={"Authorization": f"Bearer {jwt}"})

    third = await client.post('/categories/category', json={"title": "c"},
                              headers={"Authorization": f"Bearer {jwt}"})

    response = await client.get('/categories')
    assert response.status_code == 200
    assert response.json()[0]["id"] == second.json()["id"]
    assert response.json()[0]["title"] == second.json()["title"]

    assert response.json()[1]["id"] == first.json()["id"]
    assert response.json()[1]["title"] == first.json()["title"]

    assert response.json()[2]["id"] == third.json()["id"]
    assert response.json()[2]["title"] == third.json()["title"]


@pytest.mark.asyncio
async def test_update_category(client, admin):
    response = await client.post('/admin_login', json=admin)
    jwt = response.json()["jwt_token"]

    response = await client.post('/categories/category', json={"title": "test"},
                                 headers={"Authorization": f"Bearer {jwt}"})
    id_ = response.json()["id"]

    response = await client.put('/categories/category', json={"id": id_,
                                                              "title": "xd"},
                                headers={"Authorization": f"Bearer {jwt}"})
    assert response.status_code == 200
    assert response.json()["title"] == "xd"

    response = await client.get(f'/categories/category?id={id_}')
    assert response.status_code == 200
    assert response.json()["title"] == "xd"


@pytest.mark.asyncio
async def test_update_category_duplicate_title(client, admin):
    response = await client.post('/admin_login', json=admin)
    jwt = response.json()["jwt_token"]

    first = await client.post('/categories/category', json={"title": "first"},
                              headers={"Authorization": f"Bearer {jwt}"})
    second = await client.post('/categories/category', json={"title": "second"},
                               headers={"Authorization": f"Bearer {jwt}"})

    response = await client.put('/categories/category', json={"id": second.json()["id"],
                                                              "title": first.json()["title"]},
                                headers={"Authorization": f"Bearer {jwt}"})

    assert response.status_code == 409
    assert response.json()["detail"] == "Category already exists"


@pytest.mark.asyncio
async def test_delete_category(client, admin):
    response = await client.post('/admin_login', json=admin)
    jwt = response.json()["jwt_token"]

    response = await client.post('/categories/category', json={"title": "test"},
                                 headers={"Authorization": f"Bearer {jwt}"})
    id_ = response.json()["id"]
    response = await client.delete(f'/categories/category?id={id_}', headers={"Authorization": f"Bearer {jwt}"})
    assert response.status_code == 200

    response = await client.get(f'/categories/category?id={id_}')
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_used_category(client, admin):
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
    assert response.status_code == 200

    response = await client.delete(f'/categories/category?id={id_}', headers={"Authorization": f"Bearer {jwt}"})
    assert response.status_code == 409
