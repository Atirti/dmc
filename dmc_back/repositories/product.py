from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, asc, desc, insert, update, delete

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

    async def get_product(self, id: int):
        result = await self.__db.execute(
            select(Product)
            .where(Product.id == id)
        )
        return result.scalar_one_or_none()

    async def get_by_ids(self, ids: list[int]):
        result = await self.__db.execute(
            select(Product)
            .where(Product.id.in_(ids))
        )

        return result.scalars().all()

    async def add_product(self, title: str, description: str, price: float | int, picture_url: str | None,
                          count_in_stock, category_id):
        result = await self.__db.execute(
            insert(Product)
            .values(title=title, description=description, price=price, picture_url=picture_url,
                    count_in_stock=count_in_stock, category_id=category_id)
            .returning(Product)
        )

        await self.__db.commit()
        product = result.scalar_one()
        await self.__db.refresh(product)
        return product
