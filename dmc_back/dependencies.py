"""FastAPI dependency providers for database sessions and services."""

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from services import JwtService, AuthService, ProductsService, CartService, OrdersService
from repositories import RefreshTokenRepository, UserRepository, ProductRepository, CategoryRepository, CartRepository, \
    OrdersRepository
import config
import database

settings = config.Settings()
oauth2_scheme = HTTPBearer()
db = database.Database(settings.get_db_async_url())


async def get_db():
    """Yield an async SQLAlchemy session for the current request."""
    async with db.session_factory() as session:
        yield session


async def get_jwt_service(db: AsyncSession = Depends(get_db)) -> JwtService:
    """Build JWT service with the current database session."""
    return JwtService(settings.get_jwt_secret(), RefreshTokenRepository(db))


async def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    """Build auth service with the current database session."""
    return AuthService(UserRepository(db), settings.get_admin_user())


async def get_product_service(db: AsyncSession = Depends(get_db)) -> ProductsService:
    """Build product service with product and category repositories."""
    return ProductsService(ProductRepository(db), CategoryRepository(db))


async def get_cart_service(db: AsyncSession = Depends(get_db)) -> CartService:
    """Build cart service with the current database session."""
    return CartService(CartRepository(db))


async def get_order_service(db: AsyncSession = Depends(get_db)) -> OrdersService:
    """Build order service with order and product repositories."""
    return OrdersService(OrdersRepository(db), ProductRepository(db))


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
                           jwt_service: JwtService = Depends(get_jwt_service)) -> dict:
    """Decode bearer token and return the authenticated user payload."""
    return jwt_service.decode(credentials.credentials)


def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
                         jwt_service: JwtService = Depends(get_jwt_service)) -> dict:
    """Validate admin bearer token."""
    return jwt_service.decode_admin(credentials.credentials)
