from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, update, delete

from models import Cart, Product


class CartRepository:
    def __init__(self, db: AsyncSession):
        self.__db = db

    async def get_cart(self, user_id: int):
        """
        select all Products in users cart
        returns list of products, with count
        """
        cart = await self.__db.execute(
            select(Product, Cart.count)
            .join(Cart, Product.id == Cart.product_id)
            .where(Cart.user_id == user_id)
        )

        return cart.all()

    async def get_cart_product(self, user_id: int, product_id: int):
        """
        Find product by user_id and product_id
        returns row in cart and count of products in stock
        """
        cart_product = await self.__db.execute(
            select(Cart, Cart.count, Product.count_in_stock)
            .join(Product, Product.id == Cart.product_id)
            .where(Cart.user_id == user_id, Cart.product_id == product_id)
        )

        return cart_product.one_or_none()

    async def insert_product(self, user_id: int, product_id: int, count: int) -> None:
        """
        insert new product in cart
        """
        await self.__db.execute(
            insert(Cart)
            .values(user_id=user_id, product_id=product_id, count=count))

        await self.__db.commit()

    async def update_product(self, user_id: int, product_id: int, count: int) -> None:
        """
        add count to product in cart
        """
        await self.__db.execute(
            update(Cart)
            .where(Cart.user_id == user_id, Cart.product_id == product_id)
            .values(count=count)
        )

        await self.__db.commit()

    async def delete_product(self, user_id: int, product_id: int) -> None:
        """
        remove row from cart
        """
        await self.__db.execute(
            delete(Cart)
            .where(Cart.user_id == user_id, Cart.product_id == product_id)
        )

        await self.__db.commit()
