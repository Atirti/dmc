from fastapi import APIRouter, Depends
from schemas.orders import OrderModel, ProductRequest, PayRequest

import dependencies

router = APIRouter(tags=["orders"])


@router.get("/orders", response_model=list[OrderModel])
async def get_orders(current_user: dict = Depends(dependencies.get_current_user)) -> list[OrderModel]:
    pass


@router.post("/order", response_model=OrderModel)
async def create_order(request: list[ProductRequest],
                       current_user: dict = Depends(dependencies.get_current_user)) -> OrderModel:
    pass


@router.post("/pay")
async def pay_order(request: PayRequest = Depends(),
                    current_user: dict = Depends(dependencies.get_current_user)) -> None:
    pass
