# DMC Backend

[Русская документация](README.ru.md)

DMC Store backend built with FastAPI. The application provides APIs for user registration and authentication, a PC components catalog, category management, cart operations, orders, and administrative workflows.

## Stack

- Python 3.10+
- FastAPI
- SQLAlchemy 2 async
- PostgreSQL
- Alembic
- Pydantic v2
- PyJWT
- bcrypt
- pytest, pytest-asyncio, httpx

## Project Structure

```text
dmc_back/
├── main.py                 # FastAPI entry point
├── config.py               # settings loaded from .env
├── database.py             # async engine and session factory
├── dependencies.py         # FastAPI dependencies
├── routers/                # HTTP routes
├── schemas/                # Pydantic schemas and validators
├── services/               # business logic
├── repositories/           # SQLAlchemy queries
├── models/                 # database models
├── migration/              # Alembic migrations
├── tests/                  # automated tests
├── env_example             # environment variable example
├── requierments.txt        # runtime dependencies
└── requirements-dev.txt    # development dependencies
```

## Quick Start

Create a virtual environment and install dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requierments.txt
```

The runtime dependency file is named `requierments.txt` in this repository. If you use `requirements-dev.txt`, note that it references `requirements.txt`, which is currently not present in the repository.

Create `.env`:

```bash
cp env_example .env
```

Fill in the environment variables, apply migrations, and start the server:

```bash
alembic upgrade head
uvicorn main:app --reload
```

By default, the application is available at `http://127.0.0.1:8000`.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `DB_HOST` | main PostgreSQL database host |
| `DB_PORT` | main PostgreSQL database port |
| `DB_NAME` | main database name |
| `DB_USER` | main database user |
| `DB_PASSWORD` | main database password |
| `JWT_SECRET` | secret for user JWTs |
| `JWT_ALGORITHM` | user JWT algorithm, for example `HS256` |
| `JWT_EXPIRE_MINUTES` | user JWT lifetime in minutes |
| `REFRESH_TOKEN_EXPIRE_DAYS` | user refresh token lifetime in days |
| `ADMIN_USERNAME` | administrator username |
| `ADMIN_PASSWORD` | administrator password |
| `ADMIN_JWT_SECRET` | secret for admin JWTs |
| `ADMIN_JWT_ALGORITHM` | admin JWT algorithm |
| `ADMIN_JWT_EXPIRE_MINUTES` | admin JWT lifetime in minutes |
| `TEST_DB_HOST` | test PostgreSQL database host |
| `TEST_DB_PORT` | test PostgreSQL database port |
| `TEST_DB_NAME` | test database name |
| `TEST_DB_USER` | test database user |
| `TEST_DB_PASSWORD` | test database password |

The main database connection is created with `postgresql+asyncpg://...` and `ssl=require`. PostgreSQL must accept SSL connections, or the SSL setting in `database.py` must be adjusted for a local environment.


## Running Tests

Tests use a separate test database from the `TEST_DB_*` environment variables. `tests/conftest.py` includes a guard: the test database must differ from the main database, and the test database URL must contain the string `test`.

Install runtime and test dependencies:

```bash
pip install -r requierments.txt
pip install pytest pytest-asyncio httpx
```

Run tests:

```bash
pytest
```

# Architecture
## Authentication

Protected user endpoints require the following header:

```http
Authorization: Bearer <jwt_token>
```

User refresh tokens are stored in the `refresh_tokens` table, rotated through `/refresh_token`, and deleted on logout.

Admin endpoints require a separate admin JWT obtained through `/admin_login`. The admin refresh token is stored in process memory in `settings.ADMIN_REFRESH_TOKEN`, so it is reset when the application restarts.

## API

`FastAPI(docs_url=None)` disables Swagger UI at `/docs`. The OpenAPI schema is available at `/openapi.json`, and ReDoc is available at `/redoc`.

### Auth

| Method | Path | Authorization | Purpose |
| --- | --- | --- | --- |
| `POST` | `/registration` | no | register a user |
| `POST` | `/login` | no | log in a user |
| `POST` | `/refresh_token` | no | rotate a user refresh token |
| `POST` | `/logout` | user JWT | delete one refresh token |
| `DELETE` | `/logout_everywhere` | user JWT | delete all user refresh tokens |

`POST /registration` and `POST /login`:

```json
{
  "username": "pc_builder",
  "password": "Very_1Pass!"
}
```

Response:

```json
{
  "jwt_token": "...",
  "refresh_token": "..."
}
```

`POST /refresh_token` and `POST /logout`:

```json
{
  "refresh_token": "..."
}
```

### Admin Auth

| Method | Path | Authorization | Purpose |
| --- | --- | --- | --- |
| `POST` | `/admin_login` | no | log in an administrator |
| `POST` | `/admin_refresh_token` | no | rotate the admin refresh token |
| `DELETE` | `/admin_logout` | admin JWT | reset the current admin refresh token |
| `GET` | `/admin/get_user?username=<username>` | admin JWT | get a user `id` by username |

`POST /admin_login` uses the same fields as regular login:

```json
{
  "username": "hardware_admin",
  "password": "Admin_1Pass!"
}
```

### Products

| Method | Path | Authorization | Purpose |
| --- | --- | --- | --- |
| `GET` | `/?limit=20&offset=0&sort=date&order=desc&category_id=1` | no | list products |
| `GET` | `/product?id=1` | no | get one product |
| `POST` | `/product` | admin JWT | create a product |
| `PUT` | `/product` | admin JWT | update a product |
| `DELETE` | `/product?id=1` | admin JWT | delete a product |

Product list query parameters:

- `limit`: from `1` to `500`, default `20`
- `offset`: from `0`, default `0`
- `sort`: `date` or `price`, default `date`
- `order`: `asc` or `desc`, default `desc`
- `category_id`: optional category filter

Create a product:

```json
{
  "title": "NVIDIA GeForce RTX 4070",
  "description": "12 GB GDDR6X graphics card for 1440p gaming builds",
  "price": 599,
  "picture_url": "https://example.com/components/rtx-4070.jpg",
  "count_in_stock": 10,
  "category_id": 1
}
```

Update a product:

```json
{
  "id": 1,
  "title": "NVIDIA GeForce RTX 4070 SUPER",
  "description": "12 GB GDDR6X graphics card with upgraded CUDA core count",
  "price": 649,
  "picture_url": "https://example.com/components/rtx-4070-super.jpg",
  "count_in_stock": 5,
  "category_id": 1
}
```

In `PUT /product`, all fields except `id` may be `null`; only non-`null` fields are updated.

### Categories

| Method | Path | Authorization | Purpose |
| --- | --- | --- | --- |
| `GET` | `/categories` | no | list categories sorted by title |
| `GET` | `/categories/category?id=1` | no | get one category |
| `POST` | `/categories/category` | admin JWT | create a category |
| `PUT` | `/categories/category` | admin JWT | update a category |
| `DELETE` | `/categories/category?id=1` | admin JWT | delete a category |

Create a category:

```json
{
  "title": "Graphics Cards"
}
```

Update a category:

```json
{
  "id": 1,
  "title": "GPUs"
}
```

Category titles are unique. A category cannot be deleted while products are linked to it.

### Cart

All cart endpoints require a user JWT.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/cart/` | get the current user's cart |
| `PUT` | `/cart/` | add a product or change its quantity |
| `DELETE` | `/cart/?id=1` | remove a product from the cart |

Add or change quantity:

```json
{
  "id": 1,
  "count": 2
}
```

The quantity must be greater than `0` and must not exceed the product's `count_in_stock`.

### Orders

| Method | Path | Authorization | Purpose |
| --- | --- | --- | --- |
| `GET` | `/orders` | user JWT | list current user's orders |
| `POST` | `/order` | user JWT | create an order |
| `GET` | `/order?id=1` | user JWT | get one current-user order |
| `GET` | `/admin/all_orders?limit=20&offset=0&date=2026-06-16&status=packed` | admin JWT | list all orders with optional filters |
| `GET` | `/admin/orders?user_id=1` | admin JWT | list selected user's orders |
| `GET` | `/admin/order?user_id=1&order_id=1` | admin JWT | get selected user's order |
| `PUT` | `/order` | admin JWT | update order status |

Admin all-orders query parameters:

- `limit`: from `1` to `500`, default `20`
- `offset`: from `0`, default `0`
- `date`: optional order creation date in `YYYY-MM-DD` format
- `status`: optional order status string

If `date` and `status` are not provided, `/admin/all_orders` returns all orders from newest to oldest. Response items contain regular order fields plus `user_id`.

Create an order:

```json
{
  "products": [
    {
      "product_id": 1,
      "product_count": 2
    },
    {
      "product_id": 3,
      "product_count": 1
    }
  ],
  "address": "42 Silicon Avenue"
}
```

This example can represent an order with two graphics cards and one power supply, depending on the products stored under ids `1` and `3`.

When an order is created:

- duplicate products in the request are aggregated;
- all products are checked for existence;
- stock availability is checked;
- the total price is calculated as `price * product_count`;
- product stock is decreased;
- the order is created with the `paid` status.

Update order status:

```json
{
  "order_id": 1,
  "user_id": 1,
  "status": "packed"
}
```

## Data Models

All models inherit `id`, `created_at`, and `updated_at` fields from `Base`.

| Table | Purpose | Main fields |
| --- | --- | --- |
| `users` | users | `username`, `password` |
| `refresh_tokens` | user refresh tokens | `user_id`, `token`, `expires_at` |
| `categories` | product categories | `title` |
| `products` | PC components | `title`, `description`, `price`, `picture_url`, `count_in_stock`, `category_id` |
| `carts` | user carts | `user_id`, `product_id`, `count` |
| `orders` | orders | `user_id`, `status`, `address`, `price` |
| `orders_products` | order line items | `order_id`, `product_id`, `count` |

Relationships:

- `users` 1:N `orders`
- `users` 1:N `carts`
- `users` 1:N `refresh_tokens`
- `categories` 1:N `products`
- `orders` 1:N `orders_products`
- `products` 1:N `carts`
- `products` 1:N `orders_products`

## Validation

Main rules:

- `username`: from `4` to `50` characters, only English letters, digits, and punctuation characters.
- `password`: at least `8` characters, only English letters, digits, and punctuation characters; lowercase, uppercase, digit, and punctuation are required.
- All `id` values must be positive integers.
- Product quantities in cart and orders must be positive.
- Price and stock count cannot be negative.
- String fields cannot be empty or whitespace-only.
- `sort` accepts only `date` or `price`.
- `order` accepts only `asc` or `desc`.

## Common API Errors

| Status | When it occurs |
| --- | --- |
| `401 Unauthorized` | incorrect username/password, missing or invalid JWT, expired JWT, invalid refresh token |
| `404 Not Found` | user, product, category, order, or cart product was not found |
| `409 Conflict` | username is already taken, category already exists, category is in use, not enough stock |
| `422 Unprocessable Entity` | Pydantic input validation error |
