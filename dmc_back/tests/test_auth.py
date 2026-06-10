import pytest


@pytest.mark.asyncio
async def test_registration(client):
    user = {"username": "test_test", "password": "very_$tr0nGP@ssvvord"}

    response = await client.post("/auth/registration", json=user)
    assert response.status_code == 200
    assert "jwt_token" in response.json()
    assert "refresh_token" in response.json()

    response = await client.post("/auth/registration", json={"username": "test_test", "password": "very_$tr0nGPss"})
    assert response.status_code == 409
    assert response.json()['detail'] == "Username already taken"

    # Validation tests
    response = await client.post("/auth/registration", json={"username": "test_test", "password": "123"})
    assert response.status_code == 422
    assert response.json()['detail'][0][
               'msg'] == "Value error, Password must be at least 8 characters"

    response = await client.post("/auth/registration", json={"username": "фыв", "password": "very_$tr0nGPss"})
    assert response.status_code == 422
    assert response.json()['detail'][0][
               'msg'] == "Value error, username must contain only eng letters, numbers, and/or punctuation"

    response = await client.post("/auth/registration",
                                 json={"username": "test_test", "password": "очень слложный Пароль2"})
    assert response.status_code == 422
    assert response.json()['detail'][0][
               'msg'] == "Value error, password must contain only eng letters, numbers, and/or punctuation"

    response = await client.post("/auth/registration", json={"username": "test_test", "password": "password"})
    assert response.status_code == 422
    assert response.json()['detail'][0][
               'msg'] == 'Value error, Password must contains lower and upper case letters, digits and punctuation'


@pytest.mark.asyncio
async def test_login(client):
    user = {"username": "test_test", "password": "very_$tr0nGP@ssvvord"}

    await client.post("/auth/registration", json=user)

    response = await client.post("/auth/login", json={"username": "test_test", "password": "Wrong_pass1"})
    assert response.status_code == 401

    response = await client.post("/auth/login", json=user)
    assert response.status_code == 200
    assert "jwt_token" in response.json()
    assert "refresh_token" in response.json()

    # Validation tests
    response = await client.post("/auth/login", json={"username": "test_test", "password": "123"})
    assert response.status_code == 422
    assert response.json()['detail'][0]['msg'] == "Value error, Password must be at least 8 characters"

    response = await client.post("/auth/login", json={"username": "фыв", "password": "very_$tr0nGPss"})
    assert response.status_code == 422
    assert response.json()['detail'][0][
               'msg'] == "Value error, username must contain only eng letters, numbers, and/or punctuation"

    response = await client.post("/auth/login",
                                 json={"username": "test_test", "password": "очень слложный Пароль2"})
    assert response.status_code == 422
    assert response.json()['detail'][0][
               'msg'] == "Value error, password must contain only eng letters, numbers, and/or punctuation"

    response = await client.post("/auth/login", json={"username": "test_test", "password": "password"})
    assert response.status_code == 422
    assert response.json()['detail'][0][
               'msg'] == 'Value error, Password must contains lower and upper case letters, digits and punctuation'


@pytest.mark.asyncio
async def test_refresh_token(client):
    user = {"username": "test_test", "password": "very_$tr0nGP@ssvvord"}

    response = await client.post("/auth/registration", json=user)
    old_refresh_token = response.json()["refresh_token"]

    response = await client.post("/auth/refresh_token", json={"refresh_token": old_refresh_token})
    assert response.status_code == 200
    assert "jwt_token" in response.json()
    assert "refresh_token" in response.json()

    response = await client.post("/auth/refresh_token", json={"refresh_token": old_refresh_token})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_logout(client):
    user = {"username": "test_test", "password": "very_$tr0nGP@ssvvord"}
    response = await client.post("/auth/registration", json=user)

    refresh_token = response.json()["refresh_token"]
    jwt_token = response.json()["jwt_token"]

    response = await client.post("/auth/logout", json={"refresh_token": refresh_token})
    assert response.status_code == 401
    assert response.json()["detail"] == 'Not authenticated'

    response = await client.post("/auth/logout", json={"refresh_token": refresh_token},
                                 headers={"Authorization": f"Bearer {jwt_token}"})
    assert response.status_code == 200

    response = await client.post("/auth/refresh_token", json={"refresh_token": refresh_token})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_password_reset(client):
    user = {"username": "test_test", "password": "very_$tr0nGP@ssvvord"}
    response = await client.post("/auth/registration", json=user)
    jwt_token = response.json()["jwt_token"]
    first_refresh_token = response.json()["refresh_token"]

    response = await client.post("/auth/login", json=user)
    second_refresh_token = response.json()["refresh_token"]

    response = await client.delete("/auth/logout_everywhere")
    assert response.status_code == 401
    response.json()["detail"] = 'Invalid token'

    response = await client.delete("/auth/logout_everywhere", headers={"Authorization": f"Bearer {jwt_token}"})
    assert response.status_code == 200

    response = await client.post("/auth/refresh_token", json={"refresh_token": first_refresh_token})
    assert response.status_code == 401
    response.json()["detail"] = 'Invalid or expired refresh token'

    response = await client.post("/auth/refresh_token", json={"refresh_token": second_refresh_token})
    assert response.status_code == 401
    response.json()["detail"] = 'Invalid or expired refresh token'
