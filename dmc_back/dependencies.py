import jwt
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from services import JwtService, AuthService
from repositories import RefreshTokenRepository, UserRepository
import config
import database

Settings = config.Settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
db = database.Database(Settings.get_db_async_url())


async def get_db():
    async for session in db.get_sesion():
        yield session

def get_jwt_service(db: AsyncSession = Depends(get_db)) -> JwtService:
    return JwtService(Settings.get_jwt_secret(), RefreshTokenRepository(db))

def get_current_user(token: str = Depends(oauth2_scheme),
                     jwt_service: JwtService = Depends(get_jwt_service)) -> dict:
    return jwt_service.decode(token)

def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(UserRepository(db))

