import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

import dependencies
from config import settings
from main import app
import models

TEST_DB_URL = settings.get_test_async_db_url()

if (settings.get_db_async_url() == TEST_DB_URL):
    pytest.fail("The test database should differ from the main one")

if ('test' not in TEST_DB_URL):
    pytest.fail("The test database should differ from the main one")


@pytest_asyncio.fixture()
async def client():
    """
    Create tables in test database
    create engine, session for database
    create async client using httpx, override database in dependencies
    after all clear dependency_overrides, drop tables in test database
    """
    engine = create_async_engine(TEST_DB_URL)
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)

    async def override_get_db():
        async with async_sessionmaker(engine)() as session:
            yield session

    app.dependency_overrides[dependencies.get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()

    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.drop_all)
    await engine.dispose()
