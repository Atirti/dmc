from fastapi import APIRouter
from fastapi.params import Depends

import dependencies
from services import ProductsService
from schemas.products import ProductsRequest, ProductRequest, ProductModel, CategoryModel, RequestId, CategoryRequest

router = APIRouter(tags=["products"])


@router.get("/", response_model=list[ProductModel])
async def get_products(request: ProductsRequest = Depends(),
                       product_service: ProductsService = Depends(dependencies.get_product_service)) -> list[
    ProductModel]:
    """
    return list of limit products
    start form offset
    sort by date or price
    asc or desc
    """
    return await product_service.get_products(request)


@router.post("/product", response_model=ProductModel, tags=["admin"])
async def create_product(request: ProductRequest,
                         product_service: ProductsService = Depends(dependencies.get_product_service),
                         admin=Depends(dependencies.get_admin_user)) -> ProductModel:
    return await product_service.add_product(request)


@router.get("/product", response_model=ProductModel)
async def get_product(request: RequestId = Depends(),
                      product_service: ProductsService = Depends(dependencies.get_product_service)):
    return await product_service.get_product(request)


"""
@router.put("/product", response_model=ProductModel, tags=["admin"])
async def update_product(request: ProductModel,
                         product_service: ProductsService = Depends(dependencies.get_product_service),
                         admin=Depends(dependencies.get_admin_user)) -> ProductModel:
    pass

@router.delete("/product", response_model=ProductModel, tags=["admin"])
async def delete_product(request: RequestId = Depends(),
                         product_service: ProductsService = Depends(dependencies.get_product_service),
                         admin=Depends(dependencies.get_admin_user)) -> None:
    pass
"""


@router.get("/categories", response_model=list[CategoryModel])
async def get_categories(product_service: ProductsService = Depends(dependencies.get_product_service)) -> list[
    CategoryModel]:
    return await product_service.get_categories()


@router.post("/categories/category", response_model=CategoryModel, tags=["admin"])
async def create_category(request: CategoryRequest,
                          product_service: ProductsService = Depends(dependencies.get_product_service),
                          admin=Depends(dependencies.get_admin_user)):
    return await product_service.add_category(request.title)


@router.get("/categories/category", response_model=CategoryModel)
async def get_category(request: RequestId = Depends(),
                         product_service: ProductsService = Depends(dependencies.get_product_service)) -> list[
    CategoryModel]:
    return await product_service.get_category(request.id)


@router.put("/categories/category", response_model=CategoryModel, tags=["admin"])
async def update_category(request: CategoryModel,
                          product_service: ProductsService = Depends(dependencies.get_product_service),
                          admin=Depends(dependencies.get_admin_user)) -> CategoryModel:
    return await product_service.update_category(request.id, request.title)


@router.delete("/categories/category", tags=["admin"])
async def delete_category(request: RequestId = Depends(),
                          product_service: ProductsService = Depends(dependencies.get_product_service),
                          admin=Depends(dependencies.get_admin_user)) -> None:
    await product_service.remove_category(request.id)