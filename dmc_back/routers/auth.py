from fastapi import APIRouter, Depends
from schemas.auth import LoginRequest, TokenRequest, LoginResponse, TokenResponse, LogoutRequest
import dependencies
from services import AuthService, JwtService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(user_model: LoginRequest,
                auth_service: AuthService = Depends(dependencies.get_auth_service),
                jwt_service: JwtService = Depends(dependencies.get_jwt_service)) -> LoginResponse:
    """
    returns jwt_token and refresh_token
    """
    user = await auth_service.login(user_model.username, user_model.password)
    dct = await jwt_service.add_refresh_token(user.id, user.username)

    return dct


@router.post("/registration", response_model=LoginResponse)
async def registration(user_model: LoginRequest,
                       auth_service: AuthService = Depends(dependencies.get_auth_service),
                       jwt_service: JwtService = Depends(dependencies.get_jwt_service)) -> LoginResponse:
    """
    returns jwt_token and refresh_token
    """
    user = await auth_service.registration(user_model.username, user_model.password)
    dct = await jwt_service.add_refresh_token(user.id, user.username)

    return dct


@router.post("/refresh_token", response_model=TokenResponse)
async def refresh_token(token_model: TokenRequest,
                        jwt_service=Depends(dependencies.get_jwt_service)) -> TokenResponse:
    """
    update jwt and refresh tokens
    returns jwt_token and refresh_token
    """
    dct = await jwt_service.update_refresh_token(token_model.refresh_token)

    return dct


@router.post("/logout")
async def logout(request: LogoutRequest,
                 current_user: dict = Depends(dependencies.get_current_user),
                 jwt_service=Depends(dependencies.get_jwt_service)) -> None:
    """delete refresh token"""
    await jwt_service.delete_refresh_token(request.refresh_token, current_user["user_id"])


@router.delete("/logout_everywhere")
async def logout_everywhere(current_user: dict = Depends(dependencies.get_current_user),
                            jwt_service=Depends(dependencies.get_jwt_service)) -> None:
    """delete all user refresh tokens using id from jwt token"""
    await jwt_service.delete_all_refresh_tokens(current_user["user_id"])
