from fastapi import APIRouter
from schemas.auth import UserModel, TokenModel
import dependencies


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
async def login(user_model: UserModel):
    """
    login
    :return: JSON with jwt and refresh tokens
    """
    pass

@router.post("/regestration")
async def registration(user_model: UserModel):
    """
    registration
    :return: JSON with jwt and refresh tokens
    """
    pass

@router.post("/refresh_token")
async def refresh_token(token_model: TokenModel):
    """
    update jwt and refresh tokens
    :return: JSON with jwt and refresh tokens
    """
    pass
