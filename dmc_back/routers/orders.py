"""Order routes for users and admins."""

from fastapi import APIRouter, Depends

from schemas import AdminOrderRequest, AdminOrdersRequest, CreateOrderRequest, IdRequest, OrderModel, OrderUpdateRequest
from services.orders import OrdersService

import dependencies

router = APIRouter(tags=["orders"])


@router.get("/orders", response_model=list[OrderModel])
async def get_orders(current_user: dict = Depends(dependencies.get_current_user),
                     orders_service: OrdersService = Depends(dependencies.get_order_service)) -> list[OrderModel]:
    """Return all visible orders for the authenticated user."""
    return await orders_service.get_user_orders(current_user["user_id"])


@router.post("/order", response_model=OrderModel)
async def create_order(request: CreateOrderRequest,
                       current_user: dict = Depends(dependencies.get_current_user),
                       orders_service: OrdersService = Depends(dependencies.get_order_service)) -> OrderModel:
    """Create an order from requested products for the authenticated user."""
    return await orders_service.create_order(current_user["user_id"], request)


@router.get("/order", response_model=OrderModel)
async def get_order(request: IdRequest = Depends(),
                    current_user: dict = Depends(dependencies.get_current_user),
                    orders_service: OrdersService = Depends(dependencies.get_order_service)) -> OrderModel:
    """Return one order for the authenticated user."""
    return await orders_service.get_user_order(current_user["user_id"], request.id)


@router.get("/admin/orders", response_model=list[OrderModel])
async def get_admin_orders(request: AdminOrdersRequest = Depends(),
                           admin=Depends(dependencies.get_admin_user),
                           orders_service: OrdersService = Depends(dependencies.get_order_service)) -> list[OrderModel]:
    """Return all visible orders for a user selected by admin."""
    return await orders_service.get_user_orders(request.user_id)


@router.get("/admin/order", response_model=OrderModel)
async def get_admin_order(request: AdminOrderRequest = Depends(),
                          admin=Depends(dependencies.get_admin_user),
                          orders_service: OrdersService = Depends(dependencies.get_order_service)) -> OrderModel:
    """Return one user order selected by admin."""
    return await orders_service.get_user_order(request.user_id, request.order_id)


@router.put("/order", response_model=OrderModel)
async def update_order_status(request: OrderUpdateRequest,
                       order_service: OrdersService = Depends(dependencies.get_order_service),
                       admin = Depends(dependencies.get_admin_user)):
    """Update order status as admin."""
    return await order_service.update_status(request)
