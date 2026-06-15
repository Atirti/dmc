from repositories import OrdersRepository, ProductRepository
from fastapi import HTTPException, status
from schemas import CreateOrderRequest


class OrdersService:
    def __init__(self, orders_repository: OrdersRepository, product_repository: ProductRepository):
        self.__orders_repository = orders_repository
        self.__product_repository = product_repository

    def __order_to_dict(self, order) -> dict:
        return {
            "id": order.id,
            "products": [
                {
                    "id": op.product.id,
                    "title": op.product.title,
                    "description": op.product.description,
                    "price": op.product.price,
                    "picture_url": op.product.picture_url,
                    "count_in_stock": op.product.count_in_stock,
                    "category_id": op.product.category_id,
                    "count": op.count
                } for op in order.order_products if op.product is not None
            ],
            "status": order.status,
            "price": order.price,
            "address": order.address
        }

    async def get_user_orders(self, user_id: int):
        orders = await self.__orders_repository.get_user_orders(user_id)
        if orders is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orders not found")
        return [self.__order_to_dict(order) for order in orders]

    async def get_user_order(self, user_id: int, order_id: int):
        order = await self.__orders_repository.get_order_by_id(order_id, user_id)
        if order is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        return self.__order_to_dict(order)

    async def create_order(self, user_id: int, request: CreateOrderRequest):
        requested_counts = {}
        for requested_product in request.products:
            requested_counts[requested_product.product_id] = (
                requested_counts.get(requested_product.product_id, 0) + requested_product.product_count
            )

        products = await self.__product_repository.get_by_ids(list(requested_counts.keys()))
        products_by_id = {product.id: product for product in products}

        if len(products_by_id) != len(requested_counts):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        price = 0
        for product_id, requested_count in requested_counts.items():
            product = products_by_id[product_id]
            if product.count_in_stock < requested_count:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Not enough {product.title} in stock")
            price += product.price * requested_count

        order = await self.__orders_repository.create_order(
            user_id, request.address, price,
            [
                {"product_id": product_id, "product_count": requested_count}
                for product_id, requested_count in requested_counts.items()
            ]
        )

        return self.__order_to_dict(order)

    async def update_status(self, request):
        order = await self.get_user_order(request.user_id, request.order_id)
        if order is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        await self.__orders_repository.update_status(request.order_id, request.user_id, request.status)
        return await self.get_user_order(request.user_id, request.order_id)
