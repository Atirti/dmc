from pydantic_settings.sources.providers import aws
from fastapi import HTTPException, status
from repositories import ProductRepository, CategoryRepository
from schemas.products import ProductsRequest, ProductRequest, RequestId


class ProductsService:
    def __init__(self, product_repository: ProductRepository, category_repository: CategoryRepository):
        self.__product_repository = product_repository
        self.__category_repository = category_repository

    async def get_products(self, request: ProductsRequest):
        if request.category_id is None:
            return await self.__product_repository.get_products(limit=request.limit,
                                                                offset=request.offset,
                                                                sort=request.sort,
                                                                order=request.order)
        else:
            return await self.__product_repository.get_products_by_category(limit=request.limit,
                                                                            offset=request.offset,
                                                                            sort=request.sort,
                                                                            order=request.order,
                                                                            category_id=request.category_id)

    async def get_product(self, request: RequestId):
        product = await self.__product_repository.get_product(id=request.id)
        if product is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        return product

    async def add_product(self, request: ProductRequest):
        return await self.__product_repository.add_product(request.title, request.description, request.price,
                                                           request.picture_url, request.count_in_stock,
                                                           request.category_id)

    async def get_categories(self):
        return await self.__category_repository.get_all_categories()
