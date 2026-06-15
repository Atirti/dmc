import pytest


async def get_admin_headers(client, admin):
    response = await client.post("/admin_login", json=admin)
    return {"Authorization": f"Bearer {response.json()['jwt_token']}"}


@pytest.mark.asyncio
async def test_admin_login(no_db_client, admin):
    response = await no_db_client.post('/admin_login', json=admin)
    assert response.status_code == 200
    assert "jwt_token" in response.json()
    assert "refresh_token" in response.json()

    response = await no_db_client.post('/admin_login', json={"username": "not_admin", "password": "Wrong1_pa$s"})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_admin_refresh_token(no_db_client, admin):
    response = await no_db_client.post('/admin_refresh_token', json={"refresh_token": ""})
    assert response.status_code == 422

    response = await no_db_client.post('/admin_refresh_token', json={"refresh_token": "123"})
    assert response.status_code == 401

    response = await no_db_client.post('/admin_login', json=admin)
    old_refresh_token = response.json()["refresh_token"]

    response = await no_db_client.post('/admin_refresh_token', json={"refresh_token": old_refresh_token})
    assert response.status_code == 200
    assert "jwt_token" in response.json()
    assert "refresh_token" in response.json()

    new_refresh_token = response.json()["refresh_token"]

    response = await no_db_client.post('/admin_refresh_token', json={"refresh_token": old_refresh_token})
    assert response.status_code == 401

    response = await no_db_client.post('/admin_refresh_token', json={"refresh_token": new_refresh_token})
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_admin_get_user_id(client, admin):
    user = {"username": "lookup_user", "password": "Very_$tr0nGP@ss1"}
    await client.post("/registration", json=user)

    response = await client.get(f"/admin/get_user?username={user['username']}")
    assert response.status_code == 401

    admin_headers = await get_admin_headers(client, admin)
    response = await client.get(f"/admin/get_user?username={user['username']}", headers=admin_headers)
    assert response.status_code == 200
    assert isinstance(response.json()["id"], int)
    assert response.json()["id"] > 0

    response = await client.get("/admin/get_user?username=missing_user", headers=admin_headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


@pytest.mark.asyncio
async def test_admin_logout(no_db_client, admin):
    response = await no_db_client.post('/admin_login', json=admin)
    refresh_token = response.json()["refresh_token"]
    jwt_token = response.json()["jwt_token"]

    response = await no_db_client.delete('/admin_logout')
    assert response.status_code == 401

    response = await no_db_client.delete('/admin_logout', headers={"Authorization": f"Bearer {jwt_token}"})
    assert response.status_code == 200

    response = await no_db_client.post('/admin_refresh_token', json={"refresh_token": refresh_token})
    assert response.status_code == 401
