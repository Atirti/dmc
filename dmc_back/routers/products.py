from fastapi import APIRouter
from fastapi.params import Depends

import dependencies
from services import ProductsService
from schemas.products import ProductsRequest, ProductRequest, ProductModel, CategoryModel, RequestId

router = APIRouter(tags=["products"])


@router.get("/", response_model=list[ProductModel])
async def get_products(request: ProductsRequest = Depends(),
                       product_service: ProductsService = Depends(dependencies.get_product_service)) -> list[
    ProductModel]:
    return await product_service.get_products(request)


@router.get("/product", response_model=ProductModel)
async def get_product(request: RequestId = Depends(),
                      product_service: ProductsService = Depends(dependencies.get_product_service)):
    pass


@router.post("/product", response_model=ProductModel, tags=["admin"])
async def create_product(request: ProductRequest,
                         product_service: ProductsService = Depends(dependencies.get_product_service),
                         admin=Depends(dependencies.get_admin_user)) -> ProductModel:
    pass


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


@router.get("/categories", response_model=list[CategoryModel])
async def get_categories(product_service: ProductsService = Depends(dependencies.get_product_service)) -> list[
    CategoryModel]:
    return await product_service.get_categories()


@router.get("/categories/category", response_model=list[CategoryModel])
async def get_categories(product_service: ProductsService = Depends(dependencies.get_product_service)) -> list[
    CategoryModel]:
    pass


@router.post("/categories/category", response_model=CategoryModel, tags=["admin"])
async def create_category(product_service: ProductsService = Depends(dependencies.get_product_service),
                          admin=Depends(dependencies.get_admin_user)):
    pass


@router.put("/categories/category", response_model=CategoryModel, tags=["admin"])
async def update_category(request: RequestId = Depends(),
                          product_service: ProductsService = Depends(dependencies.get_product_service),
                          admin=Depends(dependencies.get_admin_user)) -> CategoryModel:
    pass


@router.delete("/categories/category", response_model=CategoryModel, tags=["admin"])
async def delete_category(request: RequestId = Depends(),
                          product_service: ProductsService = Depends(dependencies.get_product_service),
                          admin=Depends(dependencies.get_admin_user)) -> None:
    pass
