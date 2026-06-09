from fastapi import APIRouter


router = APIRouter(prefix="/products", tags=["products"])


@router.get("/")
def get_products_category(limit: int = 20, last_product_id: int = None, sort: str = "date", order: str = "desc", category_id: int = None):
    """
    :param limit: count of products
    :param last_product_id: id of last product
    :param sort: date or price
    :param order: asc or desc
    :param category_id: category id, None for all categories
    :return:
    """
    pass

@router.get("/categories}")
def get_categories():
    """

    :return:
    """
    pass