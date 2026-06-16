# DMC Backend

[English documentation](README.md)

Backend интернет-магазина DMC Store на FastAPI. Приложение предоставляет API для регистрации и авторизации пользователей, каталога комплектующих для ПК, управления категориями, корзины, заказов и административных сценариев.

## Стек

- Python 3.10+
- FastAPI
- SQLAlchemy 2 async
- PostgreSQL
- Alembic
- Pydantic v2
- PyJWT
- bcrypt
- pytest, pytest-asyncio, httpx

## Структура проекта

```text
dmc_back/
├── main.py                 # точка входа FastAPI
├── config.py               # настройки из .env
├── database.py             # async engine и session factory
├── dependencies.py         # FastAPI dependencies
├── routers/                # HTTP-роуты
├── schemas/                # Pydantic-схемы и валидаторы
├── services/               # бизнес-логика
├── repositories/           # SQLAlchemy-запросы
├── models/                 # модели БД
├── migration/              # Alembic migrations
├── tests/                  # автотесты
├── env_example             # пример переменных окружения
├── requierments.txt        # runtime-зависимости
└── requirements-dev.txt    # dev-зависимости
```

## Быстрый запуск

Создайте виртуальное окружение и установите зависимости:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requierments.txt
```

Файл runtime-зависимостей в репозитории называется `requierments.txt`. Если используете `requirements-dev.txt`, учитывайте, что он ссылается на `requirements.txt`, которого сейчас нет в репозитории.

Создайте `.env`:

```bash
cp env_example .env
```

Заполните переменные окружения, примените миграции и запустите сервер:

```bash
alembic upgrade head
uvicorn main:app --reload
```

По умолчанию приложение доступно на `http://127.0.0.1:8000`.

## Переменные окружения

| Переменная | Назначение |
| --- | --- |
| `DB_HOST` | хост основной PostgreSQL БД |
| `DB_PORT` | порт основной PostgreSQL БД |
| `DB_NAME` | имя основной БД |
| `DB_USER` | пользователь основной БД |
| `DB_PASSWORD` | пароль основной БД |
| `JWT_SECRET` | секрет для пользовательских JWT |
| `JWT_ALGORITHM` | алгоритм пользовательских JWT, например `HS256` |
| `JWT_EXPIRE_MINUTES` | срок жизни пользовательского JWT в минутах |
| `REFRESH_TOKEN_EXPIRE_DAYS` | срок жизни пользовательского refresh token в днях |
| `ADMIN_USERNAME` | логин администратора |
| `ADMIN_PASSWORD` | пароль администратора |
| `ADMIN_JWT_SECRET` | секрет для админских JWT |
| `ADMIN_JWT_ALGORITHM` | алгоритм админских JWT |
| `ADMIN_JWT_EXPIRE_MINUTES` | срок жизни админского JWT в минутах |
| `TEST_DB_HOST` | хост тестовой PostgreSQL БД |
| `TEST_DB_PORT` | порт тестовой PostgreSQL БД |
| `TEST_DB_NAME` | имя тестовой БД |
| `TEST_DB_USER` | пользователь тестовой БД |
| `TEST_DB_PASSWORD` | пароль тестовой БД |

Подключение к основной БД создается через `postgresql+asyncpg://...` с `ssl=require`. PostgreSQL должен принимать SSL-подключения, либо настройку SSL в `database.py` нужно адаптировать под локальную среду.

## Запуск тестов

Тесты используют отдельную тестовую БД из переменных `TEST_DB_*`. В `tests/conftest.py` есть защита: тестовая БД должна отличаться от основной, а URL тестовой БД должен содержать строку `test`.

Установите runtime и test-зависимости:

```bash
pip install -r requierments.txt
pip install pytest pytest-asyncio httpx
```

Запустите тесты:

```bash
pytest
```

# Архитектура

## Авторизация

Защищенные пользовательские эндпоинты требуют заголовок:

```http
Authorization: Bearer <jwt_token>
```

Пользовательские refresh tokens хранятся в таблице `refresh_tokens`, ротируются через `/refresh_token` и удаляются при logout.

Админские эндпоинты требуют отдельный админский JWT, полученный через `/admin_login`. Админский refresh token хранится в памяти процесса в `settings.ADMIN_REFRESH_TOKEN`, поэтому сбрасывается при перезапуске приложения.

## API

`FastAPI(docs_url=None)` отключает Swagger UI на `/docs`. OpenAPI-схема доступна на `/openapi.json`, ReDoc доступен на `/redoc`.

### Auth

| Метод | Путь | Авторизация | Назначение |
| --- | --- | --- | --- |
| `POST` | `/registration` | нет | зарегистрировать пользователя |
| `POST` | `/login` | нет | войти как пользователь |
| `POST` | `/refresh_token` | нет | ротировать пользовательский refresh token |
| `POST` | `/logout` | user JWT | удалить один refresh token |
| `DELETE` | `/logout_everywhere` | user JWT | удалить все refresh tokens пользователя |

`POST /registration` и `POST /login`:

```json
{
  "username": "pc_builder",
  "password": "Very_1Pass!"
}
```

Ответ:

```json
{
  "jwt_token": "...",
  "refresh_token": "..."
}
```

`POST /refresh_token` и `POST /logout`:

```json
{
  "refresh_token": "..."
}
```

### Admin Auth

| Метод | Путь | Авторизация | Назначение |
| --- | --- | --- | --- |
| `POST` | `/admin_login` | нет | войти как администратор |
| `POST` | `/admin_refresh_token` | нет | ротировать админский refresh token |
| `DELETE` | `/admin_logout` | admin JWT | сбросить текущий админский refresh token |
| `GET` | `/admin/get_user?username=<username>` | admin JWT | получить `id` пользователя по username |

`POST /admin_login` использует те же поля, что и обычный login:

```json
{
  "username": "hardware_admin",
  "password": "Admin_1Pass!"
}
```

### Products

| Метод | Путь | Авторизация | Назначение |
| --- | --- | --- | --- |
| `GET` | `/?limit=20&offset=0&sort=date&order=desc&category_id=1` | нет | получить список товаров |
| `GET` | `/product?id=1` | нет | получить один товар |
| `POST` | `/product` | admin JWT | создать товар |
| `PUT` | `/product` | admin JWT | обновить товар |
| `DELETE` | `/product?id=1` | admin JWT | удалить товар |

Параметры списка товаров:

- `limit`: от `1` до `500`, по умолчанию `20`
- `offset`: от `0`, по умолчанию `0`
- `sort`: `date` или `price`, по умолчанию `date`
- `order`: `asc` или `desc`, по умолчанию `desc`
- `category_id`: необязательный фильтр по категории

Создание товара:

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

Обновление товара:

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

В `PUT /product` все поля кроме `id` могут быть `null`; обновляются только поля, отличные от `null`.

### Categories

| Метод | Путь | Авторизация | Назначение |
| --- | --- | --- | --- |
| `GET` | `/categories` | нет | получить категории, отсортированные по названию |
| `GET` | `/categories/category?id=1` | нет | получить одну категорию |
| `POST` | `/categories/category` | admin JWT | создать категорию |
| `PUT` | `/categories/category` | admin JWT | обновить категорию |
| `DELETE` | `/categories/category?id=1` | admin JWT | удалить категорию |

Создание категории:

```json
{
  "title": "Graphics Cards"
}
```

Обновление категории:

```json
{
  "id": 1,
  "title": "GPUs"
}
```

Названия категорий уникальны. Категорию нельзя удалить, пока к ней привязаны товары.

### Cart

Все эндпоинты корзины требуют пользовательский JWT.

| Метод | Путь | Назначение |
| --- | --- | --- |
| `GET` | `/cart/` | получить корзину текущего пользователя |
| `PUT` | `/cart/` | добавить товар или изменить его количество |
| `DELETE` | `/cart/?id=1` | удалить товар из корзины |

Добавление или изменение количества:

```json
{
  "id": 1,
  "count": 2
}
```

Количество должно быть больше `0` и не может превышать `count_in_stock` товара.

### Orders

| Метод | Путь | Авторизация | Назначение |
| --- | --- | --- | --- |
| `GET` | `/orders` | user JWT | получить заказы текущего пользователя |
| `POST` | `/order` | user JWT | создать заказ |
| `GET` | `/order?id=1` | user JWT | получить один заказ текущего пользователя |
| `GET` | `/admin/all_orders?limit=20&offset=0&date=2026-06-16&status=packed` | admin JWT | получить все заказы с необязательными фильтрами |
| `GET` | `/admin/orders?user_id=1` | admin JWT | получить заказы выбранного пользователя |
| `GET` | `/admin/order?user_id=1&order_id=1` | admin JWT | получить заказ выбранного пользователя |
| `PUT` | `/order` | admin JWT | обновить статус заказа |

Query-параметры админского списка всех заказов:

- `limit`: от `1` до `500`, по умолчанию `20`
- `offset`: от `0`, по умолчанию `0`
- `date`: необязательная дата создания заказа в формате `YYYY-MM-DD`
- `status`: необязательная строка со статусом заказа

Если `date` и `status` не переданы, `/admin/all_orders` возвращает все заказы от новых к старым. Элементы ответа содержат обычные поля заказа и `user_id`.

Создание заказа:

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

Этот пример может описывать заказ двух видеокарт и одного блока питания, если в базе под id `1` и `3` хранятся соответствующие товары.

При создании заказа:

- одинаковые товары в запросе агрегируются;
- проверяется наличие всех товаров;
- проверяется достаточный остаток на складе;
- итоговая цена считается как `price * product_count`;
- остатки товаров уменьшаются;
- заказ создается со статусом `paid`.

Обновление статуса заказа:

```json
{
  "order_id": 1,
  "user_id": 1,
  "status": "packed"
}
```

## Модели данных

Все модели наследуют поля `id`, `created_at` и `updated_at` из `Base`.

| Таблица | Назначение | Основные поля |
| --- | --- | --- |
| `users` | пользователи | `username`, `password` |
| `refresh_tokens` | пользовательские refresh tokens | `user_id`, `token`, `expires_at` |
| `categories` | категории товаров | `title` |
| `products` | комплектующие для ПК | `title`, `description`, `price`, `picture_url`, `count_in_stock`, `category_id` |
| `carts` | корзины пользователей | `user_id`, `product_id`, `count` |
| `orders` | заказы | `user_id`, `status`, `address`, `price` |
| `orders_products` | позиции заказа | `order_id`, `product_id`, `count` |

Связи:

- `users` 1:N `orders`
- `users` 1:N `carts`
- `users` 1:N `refresh_tokens`
- `categories` 1:N `products`
- `orders` 1:N `orders_products`
- `products` 1:N `carts`
- `products` 1:N `orders_products`

## Валидация

Основные правила:

- `username`: от `4` до `50` символов, только английские буквы, цифры и punctuation-символы.
- `password`: минимум `8` символов, только английские буквы, цифры и punctuation-символы; обязательны lowercase, uppercase, digit и punctuation.
- Все значения `id` должны быть положительными целыми числами.
- Количество товаров в корзине и заказах должно быть положительным.
- Цена и остаток на складе не могут быть отрицательными.
- Строковые поля не могут быть пустыми или состоять только из пробелов.
- `sort` принимает только `date` или `price`.
- `order` принимает только `asc` или `desc`.

## Типовые ошибки API

| Статус | Когда возникает |
| --- | --- |
| `401 Unauthorized` | неверный логин или пароль, отсутствующий или невалидный JWT, истекший JWT, невалидный refresh token |
| `404 Not Found` | пользователь, товар, категория, заказ или товар в корзине не найден |
| `409 Conflict` | username уже занят, категория уже существует, категория используется, недостаточно товара на складе |
| `422 Unprocessable Entity` | ошибка Pydantic-валидации входных данных |
