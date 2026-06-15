"""Product and category business logic."""

from fastapi import HTTPException, status

from repositories import ProductRepository, CategoryRepository
from schemas import IdRequest, ProductCreateRequest, ProductListRequest, ProductModel


class ProductsService:
    """Coordinate product and category reads and mutations."""

    def __init__(self, product_repository: ProductRepository, category_repository: CategoryRepository):
        self.__product_repository = product_repository
        self.__category_repository = category_repository

    async def get_products(self, request: ProductListRequest):
        """Return products with optional category filtering."""
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

    async def get_product(self, request: IdRequest):
        """Return one product or raise 404."""
        product = await self.__product_repository.get_product(id=request.id)
        if product is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        return product

    async def add_product(self, request: ProductCreateRequest):
        """Create a product after validating its category."""
        if await self.__category_repository.get_category_by_id(request.category_id) is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

        return await self.__product_repository.add_product(request.title, request.description, request.price,
                                                           request.picture_url, request.count_in_stock,
                                                           request.category_id)

    async def update_product(self, request: ProductModel):
        """Update a product after validating product and category ids."""
        if await self.__product_repository.get_product(id=request.id) is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        if request.category_id is not None:
            if await self.__category_repository.get_category_by_id(request.category_id) is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

        result = await self.__product_repository.update_product(request.id, request.title, request.description,
                                                                request.price,
                                                                request.picture_url, request.count_in_stock,
                                                                request.category_id)
        if result is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Input values")
        return result

    async def delete_product(self, request: IdRequest):
        """Delete an existing product."""
        if await self.__product_repository.get_product(id=request.id) is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        await self.__product_repository.delete_product(request.id)

    async def get_categories(self):
        """Return all categories."""
        return await self.__category_repository.get_all_categories()

    async def add_category(self, title: str):
        """Create a category with a unique title."""
        if await self.__category_repository.get_by_title(title) is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category already exists")
        return await self.__category_repository.create_category(title)

    async def get_category(self, category_id: int):
        """Return one category or raise 404."""
        category = await self.__category_repository.get_category_by_id(category_id)
        if category is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        return category

    async def update_category(self, category_id: int, title: str):
        """Update category title after existence and uniqueness checks."""
        if await self.__category_repository.get_category_by_id(category_id) is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

        existing = await self.__category_repository.get_by_title(title)
        if existing is not None and existing.id != category_id:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category already exists")

        await self.__category_repository.update_category(category_id, title)
        return await self.get_category(category_id)

    async def remove_category(self, category_id: int):
        """Delete category when no products reference it."""
        if any(await self.__product_repository.get_products_by_category(
                limit=1, category_id=category_id, offset=0, sort="date", order="desc"
        )):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category in use")
        await self.__category_repository.delete_category(category_id)
