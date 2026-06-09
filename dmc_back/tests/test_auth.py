import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

@pytest.mark.asyncio
async def test_registration():
    response = client.post("/auth/registration", json={"username": "test_test", "password": "very_$tr0nGP@ssvvord"})
    assert response.status_code == 200
    assert "jwt_token" in response.json()
    assert "refresh_token" in response.json()



@pytest.mark.asyncio
async def test_login():
    response = client.post("/auth/login", json={"username": "test_test", "password": "very_$tr0nGP@ssvvord"})
    assert response.status_code == 200
    assert "jwt_token" in response.json()
    assert "refresh_token" in response.json()