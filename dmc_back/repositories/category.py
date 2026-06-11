from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


from models import Category


class CategoryRepository:
    """
    Class for queries to categories table.
    """
    def __init__(self, db: AsyncSession):
        self.__db = db

    async def get_all_categories(self):
        result = await self.__db.execute(
            select(Category)
        )

        return result.scalars().all()