from urllib import response

from fastapi import APIRouter
from fastapi.params import Depends

import dependencies
from services import ProductsService
from schemas.products import ProductsRequest

router = APIRouter(tags=["products"])


@router.get("/")
async def get_products_category(request: ProductsRequest = Depends(),
                                product_service: ProductsService = Depends(dependencies.get_product_service)):
    return await product_service.get_products(request)


@router.get("/categories")
async def get_categories(product_service: ProductsService = Depends(dependencies.get_product_service)):
    return await product_service.get_categories()