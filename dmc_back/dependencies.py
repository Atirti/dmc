import jwt
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends
from services import JwtService
import config
import database

Settings = config.Settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
db = database.Database(Settings.get_db_async_url())


async def get_db():
    async for session in db.get_sesion():
        yield session

def get_jwt_service(db: Depends(get_db)) -> JwtService:
    jwt_service = JwtService(Settings.get_jwt_secret(), db)

    return jwt_service

def get_current_user(token: str = Depends(oauth2_scheme),
                     jwt_service: JwtService = Depends(get_jwt_service)) -> dict:
    return jwt_service.decode(token)