from fastapi import APIRouter, Depends
from schemas.cart import ProductRequest, ProductModel, DeleteRequest
from services import CartService

import dependencies

router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("/", response_model=list[ProductModel])
async def get_cart(current_user: dict = Depends(dependencies.get_current_user),
                   cart_service: CartService = Depends(dependencies.get_cart_service)) -> list[ProductModel]:
    """
    Get list of products in user cart
    """
    return await cart_service.get_cart(current_user['user_id'])


@router.put("/", response_model=list[ProductModel])
async def change_count(request: ProductRequest,
                      current_user: dict = Depends(dependencies.get_current_user),
                      cart_service: CartService = Depends(dependencies.get_cart_service)) -> list[ProductModel]:
    """
    Change count of product in user cart
    """
    await cart_service.change_count(current_user['user_id'], request)
    return await cart_service.get_cart(current_user['user_id'])



@router.delete("/", response_model=list[ProductModel])
async def delete_product(request: DeleteRequest = Depends(),
                         current_user: dict = Depends(dependencies.get_current_user),
                         cart_service: CartService = Depends(dependencies.get_cart_service)) -> list[ProductModel]:
    """
    Delete product from user cart
    """
    await cart_service.delete_product(current_user['user_id'], request)
    return await cart_service.get_cart(current_user['user_id'])
