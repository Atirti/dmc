import jwt
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends
from services.jwt_service import JwtService
import config
import database

Settings = config.Settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
jwt_service = JwtService(Settings.get_jwt_secret())

def get_jwt_service():
    return jwt_service


def get_current_user(token: str = Depends(oauth2_scheme),
                     jwt_service: JwtService = Depends(get_jwt_service)):
    return jwt_service.decode(token)

