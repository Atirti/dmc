from fastapi import APIRouter, Depends, HTTPException, status

from schemas import LoginRequest, LogoutRequest, TokenRequest, TokenResponse
import dependencies
from services import AuthService, JwtService

router = APIRouter(tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(user_model: LoginRequest,
                auth_service: AuthService = Depends(dependencies.get_auth_service),
                jwt_service: JwtService = Depends(dependencies.get_jwt_service)) -> TokenResponse:
    """
    returns jwt_token and refresh_token
    """
    user = await auth_service.login(user_model.username, user_model.password)
    dct = await jwt_service.add_refresh_token(user.id, user.username)

    return dct


@router.post("/registration", response_model=TokenResponse)
async def registration(user_model: LoginRequest,
                       auth_service: AuthService = Depends(dependencies.get_auth_service),
                       jwt_service: JwtService = Depends(dependencies.get_jwt_service)) -> TokenResponse:
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


@router.post("/admin_login", tags=["admin"], response_model=TokenResponse)
async def admin_login(user_model: LoginRequest,
                      auth_service: AuthService = Depends(dependencies.get_auth_service),
                      jwt_service=Depends(dependencies.get_jwt_service)) -> TokenResponse:
    await auth_service.admin_login(user_model.username, user_model.password)
    dct = jwt_service.create_admin_token()
    dependencies.settings.ADMIN_REFRESH_TOKEN = dct["refresh_token"]

    return dct


@router.post("/admin_refresh_token", tags=["admin"], response_model=TokenResponse)
async def admin_refresh_token(token_model: TokenRequest,
                              jwt_service=Depends(dependencies.get_jwt_service)) -> TokenResponse:
    if dependencies.settings.ADMIN_REFRESH_TOKEN == token_model.refresh_token:
        dct = jwt_service.create_admin_token()
        dependencies.settings.ADMIN_REFRESH_TOKEN = dct["refresh_token"]
        return dct
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token is invalid")


@router.delete("/admin_logout", tags=["admin"])
async def admin_logout(admin=Depends(dependencies.get_admin_user)):
    dependencies.settings.ADMIN_REFRESH_TOKEN = ""
