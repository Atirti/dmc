from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession


from models import User


class UserRepository:
    """
    Class for queries to users table.
    """
    def __init__(self, db: AsyncSession):
        self.__db = db

    async def get_user_by_login(self, username: str) -> User | None:
        """
        Find a user by username.
        """
        user = await self.__db.execute(
            select(User)
            .where(User.username == username)
        )

        return user.scalar_one_or_none()

    async def create_user(self, username: str, password: str) -> User:
        """
        Creates and returns a new user.
        """
        result = await self.__db.execute(
            insert(User).values(username=username, password=password)
            .returning(User)
            )
        await self.__db.commit()
        user = result.scalar_one()
        await self.__db.refresh(user)
        return user