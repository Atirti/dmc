from fastapi import APIRouter, Depends
from schemas.orders import OrderModel, PayRequest, OrderRequest, OrderUpdateRequest
from schemas.products import RequestId
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


@router.get("/order", response_model=OrderModel)
async def get_order(request: RequestId = Depends(),
                    current_user: dict = Depends(dependencies.get_current_user),
                    admin_user: dict = Depends(dependencies.get_admin_user)):
    pass


@router.put("/order", response_model=OrderModel)
async def update_order(request: OrderUpdateRequest,
                       order_service: OrdersService = Depends(dependencies.get_order_service),
                       admin_user: dict = Depends(dependencies.get_admin_user)):
    pass


@router.delete("/order")
async def delete_order(request: RequestId = Depends(),
                       order_service: OrdersService = Depends(dependencies.get_order_service),
                       admin_user: dict = Depends(dependencies.get_admin_user)):
    pass
