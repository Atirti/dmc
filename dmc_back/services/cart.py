"""Cart business logic."""

from schemas import CartProductChangeRequest, CartProductDeleteRequest
from repositories.cart import CartRepository
from fastapi import HTTPException, status


class CartService:
    """Coordinate cart reads and cart mutations."""

    def __init__(self, repository: CartRepository):
        self.__cart_repository = repository

    async def get_cart(self, user_id: int):
        """
        get all products from user cart
        """
        cart = await self.__cart_repository.get_cart(user_id)
        return [
            {
                "id": row.Product.id,
                "title": row.Product.title,
                "description": row.Product.description,
                "price": row.Product.price,
                "picture_url": row.Product.picture_url,
                "count_in_stock": row.Product.count_in_stock,
                "category_id": row.Product.category_id,
                "count_in_cart": row.count
            }
            for row in cart
        ]

    async def change_count(self, user_id: int, request: CartProductChangeRequest) -> None:
        """
        insert or update product count in cart
        """
        product = await self.__cart_repository.get_product(request.id)
        if product is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        if request.count > product.count_in_stock:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Not enough product in stock.")

        cart = await self.__cart_repository.get_cart_product(user_id, request.id)

        if cart is None:
            await self.__cart_repository.insert_product(user_id, request.id, request.count)

        else:
            await self.__cart_repository.update_product(user_id, request.id, request.count)

    async def delete_product(self, user_id: int, request: CartProductDeleteRequest) -> None:
        """
        delete product from cart
        """
        cart = await self.__cart_repository.get_cart_product(user_id, request.id)
        if cart is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found in cart")

        else:
            await self.__cart_repository.delete_product(user_id, request.id)
