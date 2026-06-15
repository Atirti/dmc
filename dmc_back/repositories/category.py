"""Database access methods for categories."""

from sqlalchemy import select, delete, update, insert
from sqlalchemy.ext.asyncio import AsyncSession

from models import Category


class CategoryRepository:
    """
    Class for queries to categories table.
    """

    def __init__(self, db: AsyncSession):
        self.__db = db

    async def get_all_categories(self):
        """Return all categories sorted by title."""
        result = await self.__db.execute(
            select(Category)
            .order_by(Category.title)
        )

        return result.scalars().all()

    async def get_by_title(self, category_title: str):
        """Return category by unique title."""
        result = await self.__db.execute(
            select(Category)
            .where(Category.title == category_title)
        )

        return result.scalar_one_or_none()

    async def create_category(self, category_title: str):
        """Insert and return a new category."""
        result = await self.__db.execute(
            insert(Category)
            .values(title=category_title)
            .returning(Category)
        )

        category = result.scalar_one()
        await self.__db.commit()
        await self.__db.refresh(category)
        return category

    async def get_category_by_id(self, category_id: int):
        """Return category by id."""
        result = await self.__db.execute(
            select(Category)
            .where(Category.id == category_id)
        )

        return result.scalar_one_or_none()

    async def update_category(self, category_id: int, category_title: str):
        """Update category title by id."""
        await self.__db.execute(
            update(Category)
            .values(title=category_title)
            .where(Category.id == category_id)
        )
        await self.__db.commit()

    async def delete_category(self, category_id: int):
        """Delete category by id."""
        await self.__db.execute(
            delete(Category)
            .where(Category.id == category_id)
        )
        await self.__db.commit()
