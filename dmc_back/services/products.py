from repositories import ProductRepository,  CategoryRepository
from schemas.products import ProductsRequest


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

    async def get_categories(self):
        return await self.__category_repository.get_all_categories()