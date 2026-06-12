from fastapi import APIRouter, Depends
from schemas.cart import Request, ProductModel

import dependencies

router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("/", response_model=list[ProductModel])
async def get_cart(current_user: dict = Depends(dependencies.get_current_user)) -> list[ProductModel]:
    pass


@router.put("/", response_model=list[ProductModel])
async def add_product(request: Request = Depends(),
                      current_user: dict = Depends(dependencies.get_current_user)) -> list[ProductModel]:
    pass


@router.delete("/", response_model=list[ProductModel])
async def delete_product(request: Request = Depends(),
                         current_user: dict = Depends(dependencies.get_current_user)) -> list[ProductModel]:
    pass
