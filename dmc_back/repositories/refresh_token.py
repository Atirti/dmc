from datetime import datetime, timezone

from sqlalchemy import insert, select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession

from models import RefreshToken, User


class RefreshTokenRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def add_refresh_token(self, user_id: int, refresh_token: str, refresh_exp: datetime) -> None:
        """
        insert refresh token with expires date
        """
        await self.db.execute(
            insert(RefreshToken).values(user_id=user_id, token=refresh_token, expires_at=refresh_exp)
        )
        await self.db.commit()

    async def update_refresh_token(self, user_id: int, old_refresh_token: str, new_refresh_token: str,
                                   refresh_exp: datetime) -> None:
        """
        replace old token with new, also update expires date
        """
        await self.db.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == user_id, RefreshToken.token == old_refresh_token)
            .values(token=new_refresh_token, expires_at=refresh_exp)
        )
        await self.db.commit()

    async def delete_refresh_token(self, refresh_token: str, user_id: int) -> None:
        await self.db.execute(
            delete(RefreshToken).where(RefreshToken.token == refresh_token, RefreshToken.user_id == user_id)
        )
        await self.db.commit()

    async def delete_all_refresh_tokens(self, user_id: int) -> None:
        await self.db.execute(
            delete(RefreshToken).where(RefreshToken.user_id == user_id)
        )
        await self.db.commit()

    async def get_user_by_refresh_token(self, refresh_token: str) -> User | None:
        """
        find and return user by refresh token
        """
        user = await self.db.execute(
            select(User)
            .join(RefreshToken, RefreshToken.user_id == User.id)
            .where(RefreshToken.token == refresh_token,
                   RefreshToken.expires_at > datetime.now(timezone.utc).replace(tzinfo=None))
        )
        return user.scalar_one_or_none()
