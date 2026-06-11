from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, asc, desc

from models import Product


class ProductRepository:
    """
    Class for queries to product table.
    """

    def __init__(self, db: AsyncSession):
        self.__db = db

    async def get_products(self, limit: int, offset: int, sort: str, order: str):
        """
        Selects the given number of products,
        starting from the specified product,
        Sorting at the price or price.
        """
        if sort == "price":
            sort_col = Product.price
        else:
            sort_col = Product.created_at

        if order == "desc":
            order_by = desc(sort_col)
        else:
            order_by = asc(sort_col)

        result = await self.__db.execute(
            select(Product)
            .order_by(order_by)
            .offset(offset)
            .limit(limit)
        )

        return result.scalars().all()

    async def get_products_by_category(self, limit: int, offset: int, sort: str, order: str, category_id: int):
        """
        Selects the given number of products by category.,
        starting from the specified product,
        Sorting at the price or price.
        """
        if sort == "price":
            sort_col = Product.price
        else:
            sort_col = Product.created_at

        if order == "desc":
            order_by = desc(sort_col)
        else:
            order_by = asc(sort_col)

        result = await self.__db.execute(
            select(Product)
            .order_by(order_by)
            .offset(offset)
            .limit(limit)
            .where(Product.category_id == category_id)
        )

        return result.scalars().all()
