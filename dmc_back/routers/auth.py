from fastapi import APIRouter
from schemas.auth import LoginRequest, TokenRequest, LoginResponse, TokenResponse
import dependencies


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(user_model: LoginRequest) -> LoginResponse:
    """
    returns jwt_token and refresh_token
    """
    pass

@router.post("/regestration", response_model=LoginResponse)
async def registration(user_model: LoginRequest) -> LoginResponse:
    """
    returns jwt_token and refresh_token
    """
    pass

@router.post("/refresh_token", response_model=TokenResponse)
async def refresh_token(token_model: TokenRequest) -> TokenResponse:
    """
    update jwt and refresh tokens
    returns jwt_token and refresh_token
    """
    pass

@router.delete("/logout")
async def logout() -> None:
    """delete refresh token"""
    pass
