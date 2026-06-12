import jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from services import JwtService, AuthService, ProductsService
from repositories import RefreshTokenRepository, UserRepository, ProductRepository, CategoryRepository
import config
import database

Settings = config.Settings()
oauth2_scheme = HTTPBearer()
db = database.Database(Settings.get_db_async_url())


async def get_db():
    async with db.session_factory() as session:
        yield session


async def get_jwt_service(db: AsyncSession = Depends(get_db)) -> JwtService:
    return JwtService(Settings.get_jwt_secret(), RefreshTokenRepository(db))


async def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(UserRepository(db))


async def get_product_service(db: AsyncSession = Depends(get_db)) -> ProductsService:
    return ProductsService(ProductRepository(db), CategoryRepository(db))


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
                     jwt_service: JwtService = Depends(get_jwt_service)) -> dict:
    return jwt_service.decode(credentials.credentials)
