import pytest


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