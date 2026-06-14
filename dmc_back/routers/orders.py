from fastapi import APIRouter, Depends
from schemas.orders import OrderModel, PayRequest, OrderRequest
from services.orders import OrdersService

import dependencies

router = APIRouter(tags=["orders"])


@router.get("/orders", response_model=list[OrderModel])
async def get_orders(current_user: dict = Depends(dependencies.get_current_user),
                     orders_service: OrdersService = Depends(dependencies.get_order_service)) -> list[OrderModel]:
    return await orders_service.get_user_orders(current_user["user_id"])


@router.post("/order", response_model=OrderModel)
async def create_order(request: OrderRequest,
                       current_user: dict = Depends(dependencies.get_current_user),
                       orders_service: OrdersService = Depends(dependencies.get_order_service)) -> OrderModel:
    return await orders_service.create_order(current_user["user_id"], request)
