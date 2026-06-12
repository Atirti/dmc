from fastapi import APIRouter
from fastapi.params import Depends

import dependencies
from services import ProductsService
from schemas.products import ProductsRequest, ProductModel, CategoryModel

router = APIRouter(tags=["products"])


@router.get("/", response_model=list[ProductModel])
async def get_products_category(request: ProductsRequest = Depends(),
                                product_service: ProductsService = Depends(dependencies.get_product_service)) -> list[
    ProductModel]:
    return await product_service.get_products(request)


@router.get("/categories", response_model=list[CategoryModel])
async def get_categories(product_service: ProductsService = Depends(dependencies.get_product_service)) -> list[
    CategoryModel]:
    return await product_service.get_categories()
