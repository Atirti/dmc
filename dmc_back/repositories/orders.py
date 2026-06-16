"""Database access methods for orders."""

from datetime import date as dt_date, datetime, time, timedelta

from sqlalchemy import desc, select, insert, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models import Order, Product, OrderProduct


class OrdersRepository:
    """Read and mutate order records and their product rows."""

    def __init__(self, db: AsyncSession):
        self.__db = db

    async def get_user_orders(self, user_id: int):
        """Return visible orders for a user with products preloaded."""
        result = await self.__db.execute(
            select(Order)
            .options(selectinload(Order.order_products).selectinload(OrderProduct.product))
            .where(Order.user_id == user_id, Order.status != "not paid")
        )
        return result.scalars().all()

    async def get_all_orders(self, limit: int, offset: int, order_date: dt_date | None = None,
                             order_status: str | None = None):
        """Return admin orders filtered by date and/or status, newest first."""
        query = (
            select(Order)
            .options(selectinload(Order.order_products).selectinload(OrderProduct.product))
        )

        if order_date is not None:
            start_date = datetime.combine(order_date, time.min)
            end_date = start_date + timedelta(days=1)
            query = query.where(Order.created_at >= start_date, Order.created_at < end_date)

        if order_status is not None:
            query = query.where(Order.status == order_status)

        result = await self.__db.execute(
            query
            .order_by(desc(Order.created_at))
            .offset(offset)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_order_by_id(self, order_id: int, user_id: int) -> Order | None:
        """Return one user order with products preloaded."""
        result = await self.__db.execute(
            select(Order)
            .options(selectinload(Order.order_products).selectinload(OrderProduct.product))
            .where(Order.id == order_id, Order.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def create_order(self, user_id: int, address: str, price: float, products: list[dict]) -> Order:
        """Create order, attach products, decrement stock, and return the loaded order."""
        result = await self.__db.execute(
            insert(Order)
            .values(user_id=user_id, address=address, price=price, status="paid")
            .returning(Order)
        )
        order = result.scalar_one()

        await self.__db.execute(
            insert(OrderProduct),
            [{"order_id": order.id, "product_id": p["product_id"], "count": p["product_count"]} for p in products]
        )

        for p in products:
            await self.__db.execute(
                update(Product)
                .where(Product.id == p["product_id"])
                .values(count_in_stock=Product.count_in_stock - p["product_count"])
            )

        await self.__db.commit()
        await self.__db.refresh(order)

        result = await self.__db.execute(
            select(Order)
            .options(selectinload(Order.order_products).selectinload(OrderProduct.product))
            .where(Order.id == order.id)
        )

        return result.scalar_one()

    async def update_status(self, order_id: int, user_id: int, status: str):
        """Update status for a user's order."""
        await self.__db.execute(
            update(Order)
            .values(status=status)
            .where(Order.id == order_id, Order.user_id == user_id)
        )
        await self.__db.commit()
