from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession


from models import User


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_login(self, username: str) -> User | None:
        user = await self.db.execute(
            select(User)
            .where(User.username == username)
        )

        return user.scalar_one_or_none()

    async def create_user(self, username: str, password: str) -> User:
        result = await self.db.execute(
            insert(User).values(username=username, password=password)
            .returning(User)
            )
        await self.db.commit()
        user = result.scalar_one()
        await self.db.refresh(user)
        return user