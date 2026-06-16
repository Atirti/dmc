# Документация по Front-end Части проекта

### `src/main.jsx`

главная точка монтирования React-приложения. Создаёт root, оборачивает приложение в `BrowserRouter`, `AuthProvider` и `AdminAuthProvider`.

Использует: `src/App.jsx`, `src/Controll/APIStuff/Autentification/AuthContext.jsx`, `src/Controll/APIStuff/adminStuuf/AdminAuthContext.jsx`, `src/index.css`.

Используется: подключается из `index.html` как входной модуль приложения.

### `src/App.jsx`

центральная маршрутизация приложения. Описывает публичные маршруты, защищённые пользовательские маршруты, админский вход и админ-панель.

Использует: окна логина, регистрации, каталога, товара, корзины, профиля, заказа, админского входа, админ-панели, а также `PublicRoute`, `ProtectedRoute`, `AdminProtectedRoute`.

Используется: `src/main.jsx`.

## Пользовательская авторизация и маршруты

### `src/Controll/APIStuff/Autentification/auth.js`

низкоуровневый клиент пользовательской авторизации. Хранит базовый `api_url`, работает с cookie, сохраняет/очищает токены, делает login/registration/logout/refresh и `authFetch` с автообновлением токена.

Использует: browser API `fetch`, `document.cookie`, `window.dispatchEvent`, `atob`.

Используется: `AuthContext.jsx`, клиентские API корзины/заказов/каталога, админские API для общего `api_url`, профиль для чтения username.

### `src/Controll/APIStuff/Autentification/AuthContext.jsx`

React-контекст пользовательской авторизации. Хранит `isAuth` и `loading`, предоставляет `login`, `registration`, `logout`, `logoutEverywhere` через `useAuth`.

Использует: `checkAuth`, `loginRequest`, `registrationRequest`, `logoutRequest`, `logoutEverywhereRequest` из `auth.js`.

Используется: `src/main.jsx`, `Routes.jsx`, окна логина/регистрации, `ItemWindow.jsx`, `Profile.jsx`.

### `src/Controll/APIStuff/Client/Routes.jsx`

компоненты-обёртки для маршрутов. `PublicRoute` не пускает авторизованного пользователя на login/registration, `ProtectedRoute` перенаправляет неавторизованного пользователя на `/login`.

Использует: `useAuth` из `AuthContext.jsx`, `Navigate`, `Outlet`, `useLocation` из `react-router-dom`.

Используется: `src/App.jsx`.

## Клиентские API

### `src/Controll/APIStuff/Client/getItemsForMain.js`

API-запрос списка товаров для каталога. Собирает параметры пагинации, сортировки, порядка и категории.

Использует: `api_url`, `parseError` из `auth.js`.

Используется: `src/View/MainMenu/MainMenu.jsx`.

### `src/Controll/APIStuff/Client/get_put_Cart.js`

API корзины пользователя. Загружает корзину, меняет количество товара, удаляет позицию, очищает корзину и добавляет товар через обновление количества.

Использует: `authFetch`, `parseError` из `auth.js`.

Используется: `src/View/CartWindow/Cart.jsx`, `src/View/ItemWindow/ItemWindow.jsx`.

### `src/Controll/APIStuff/Client/post_get_Orders.js`

API пользовательских заказов. Создаёт заказ из адреса и списка продуктов, получает историю заказов текущего пользователя.

Использует: `authFetch`, `parseError` из `auth.js`.

Используется: `src/View/CartWindow/Cart.jsx`, `src/View/ProfileWindow/Profile.jsx`.

## Админская авторизация и API

### `src/Controll/APIStuff/adminStuuf/adminAuth.js`

низкоуровневый клиент админской авторизации. Хранит админские токены в `localStorage`, проверяет/обновляет сессию администратора, выполняет `adminFetch` с Bearer-токеном и повтором после refresh.

Использует: `api_url` из `auth.js`, browser API `fetch`, `localStorage`, `atob`.

Используется: `AdminAuthContext.jsx`, `categotyApi.js`, `productApi.js`, `orderApi.js`.

### `src/Controll/APIStuff/adminStuuf/AdminAuthContext.jsx`

React-контекст админской авторизации. Хранит `isAdmin` и `adminLoading`, предоставляет `adminLogin` и `adminLogout`.

Использует: `adminLoginRequest`, `adminLogoutRequest`, `isAdminAuth`, `checkAdminTokenValid`, `clearAdminTokens` из `adminAuth.js`.

Используется: `src/main.jsx`, `AdminProtectedRoutes.jsx`, `AdminPanel.jsx`, `AdminLoginWindow.jsx`.

### `src/Controll/APIStuff/adminStuuf/AdminProtectedRoutes.jsx`

защита админских маршрутов. Пока идёт проверка сессии возвращает `null`, без админской авторизации перенаправляет на страницу входа.

Использует: `useAdminAuth` из `AdminAuthContext.jsx`, `Navigate`, `Outlet` из `react-router-dom`.

Используется: `src/App.jsx`.

### `src/Controll/APIStuff/adminStuuf/categotyApi.js`

API категорий. Получает список/одну категорию публично, создаёт, обновляет и удаляет категории через админский fetch.

Использует: `adminFetch` из `adminAuth.js`, `api_url` из `auth.js`.

Используется: `CategoryModal.jsx`, `CategoryList.jsx`, `ProductModal.jsx`, `MainMenu.jsx`.

### `src/Controll/APIStuff/adminStuuf/productApi.js`

API товаров для админки и списков. Получает товары с пагинацией/сортировкой, создаёт, обновляет и удаляет товар.

Использует: `adminFetch` из `adminAuth.js`, `api_url` из `auth.js`.

Используется: `ProductList.jsx`, `ProductModal.jsx`.

### `src/Controll/APIStuff/adminStuuf/orderApi.js`

API админских заказов. Получает user id по username, заказы конкретного пользователя, все заказы с фильтрами и меняет статус заказа. Также экспортирует список допустимых статусов `ORDER_STATUSES`.

Использует: `adminFetch` из `adminAuth.js`.

Используется: `OrderList.jsx`, `AdminPanel.jsx`.

## Общие утилиты

### `src/Controll/errorHandler.js`

единый переводчик ошибок в понятные сообщения. Разбирает `detail`, HTTP-статусы, validation errors, ошибки сети и известные backend-сообщения.

Использует: локальных файлов не использует.

Используется: `AdminLoginWindow.jsx`, `LoginWIndow.jsx`, `RegisterWindow.jsx`, `Cart.jsx`, `ItemWindow.jsx`, `MainMenu.jsx`, `Profile.jsx`.

## Основные пользовательские экраны

### `src/View/MainWindow/MainWindow.jsx`

экран главной страницы. Собирает боковую навигацию и каталог товаров в общий layout.

Использует: `MainMenu.jsx`, `LeftPanel.jsx`, `MainWindowCSS.css`.

Используется: `src/App.jsx`.

### `src/View/MainMenu/MainMenu.jsx`

каталог товаров. Загружает категории и товары, управляет фильтром категории, сортировкой, порядком, лимитом и пагинацией, отображает карточки товаров со ссылками на детальную страницу.

Использует: `getItemsRequest`, `getCategories`, `BackButton.jsx`, `getNormalErrorMessage`, `MainMenuCSS.css`.

Используется: `MainWindow.jsx`.

### `src/View/LeftPanel/LeftPanel.jsx`

боковое меню навигации. Содержит ссылки на профиль, главную и корзину с иконками.

Использует: `NavLink` из `react-router-dom`, `IconButton` из MUI, иконки `react-icons/md`, `LeftPanelCSS.css`.

Используется: `MainWindow.jsx`, `Cart.jsx`, `ItemWindow.jsx`, `OrderplaceWindow.jsx`, `Profile.jsx`.

### `src/View/BackButton.jsx`

универсальная круглая кнопка “назад”. При клике вызывает `navigate(-1)`.

Использует: `useNavigate` из `react-router-dom`, MUI `Box`, иконку `ArrowBackOutlined`.

Используется: `Cart.jsx`, `MainMenu.jsx`, `OrderplaceWindow.jsx`, `Profile.jsx`.

### `src/View/ItemWindow/ItemWindow.jsx`

детальная страница товара. Берёт товар из `location.state`, показывает изображение, цену, остаток, описание с разворачиванием и добавляет товар в корзину. Если пользователь не авторизован, отправляет на login.

Использует: `LeftPanel.jsx`, `addItemToCartRequest`, `useAuth`, `getNormalErrorMessage`, `ItemWindowCSS.css`.

Используется: `src/App.jsx`.

### `src/View/CartWindow/Cart.jsx`

корзина пользователя. Загружает товары корзины, меняет количество, удаляет позиции, считает итоговую сумму, принимает адрес и создаёт заказ.

Использует: `LeftPanel.jsx`, `BackButton.jsx`, API корзины из `get_put_Cart.js`, `createOrderRequest`, `getNormalErrorMessage`, `CartCSS.css`.

Используется: `src/App.jsx`.

### `src/View/OrderPlaceWindow/OrderplaceWindow.jsx`

страница информации об оформленном заказе. Получает заказ из `location.state`, нормализует поля, показывает товары, адрес, статус, сумму и кнопку возврата на главную.

Использует: `LeftPanel.jsx`, `BackButton.jsx`, `OrderplaceWindowCSS.css`.

Используется: `src/App.jsx`.

### `src/View/ProfileWindow/Profile.jsx`

личный кабинет пользователя. Показывает username, кнопки выхода и выхода со всех устройств, загружает и отображает историю заказов.

Использует: `LeftPanel.jsx`, `BackButton.jsx`, `useAuth`, `getCurrentUsername`, `getUserOrdersRequest`, `getNormalErrorMessage`, `ProfileCSS.css`.

Используется: `src/App.jsx`.

## Окна авторизации

### `src/View/Autin/LoginWindow/LoginWIndow.jsx`

пользовательская форма входа. Валидирует логин/пароль, вызывает `login`, после успеха возвращает на исходный маршрут или `/home`.

Использует: `useAuth`, `getNormalErrorMessage`, `LoginWindowCSS.css`.

Используется: `src/App.jsx`.

### `src/View/Autin/RegisterWindow/RegisterWindow.jsx`

пользовательская форма регистрации. Валидирует логин, пароль и повтор пароля, вызывает `registration`, после успеха отправляет на главную.

Использует: `useAuth`, `getNormalErrorMessage`, `RegisterWIndowCSS.css`.

Используется: `src/App.jsx`.

### `src/View/Autin/AdminLoginWIndow/AdminLoginWindow.jsx`

форма входа администратора. Валидирует поля, вызывает `adminLogin`, после успеха отправляет на `/admin`.

Использует: `useAdminAuth`, `getNormalErrorMessage`, `AdminLoginWindowCSS.css`.

Используется: `src/App.jsx`.

## Админ-панель и её компоненты

### `src/View/Admin/AdminPanel/AdminPanel.jsx`

основной экран админки. Управляет товарами, категориями и заказами, открывает модалки создания/редактирования, переключает вкладки заказов пользователя и всех заказов, выполняет logout администратора.

Использует: `useAdminAuth`, `CategoryList.jsx`, `ProductList.jsx`, `OrderList.jsx`, `CategoryModal.jsx`, `ProductModal.jsx`, `ORDER_STATUSES`, `AdminPanelCss.css`.

Используется: `src/App.jsx`.

### `src/Models/Data/ProductList.jsx`

список товаров в админке. Загружает товары страницами, показывает кнопки редактирования/удаления, сообщает родителю выбранный товар через `onEdit`.

Использует: `getProducts`, `deleteProduct` из `productApi.js`.

Используется: `AdminPanel.jsx`.

### `src/Models/Data/CategoryList.jsx`

список категорий в админке. Загружает категории, удаляет их, открывает встроенный диалог редактирования названия.

Использует: `getCategories`, `deleteCategory`, `updateCategory` из `categotyApi.js`.

Используется: `AdminPanel.jsx`.

### `src/Models/Data/OrderList.jsx`

список заказов для админки. В режиме `username` ищет user id и заказы конкретного пользователя, без username загружает все заказы с фильтрами. Позволяет менять статус заказа.

Использует: `getAdminAllOrders`, `getAdminOrders`, `getAdminUserIdByUsername`, `updateOrderStatus`, `ORDER_STATUSES` из `orderApi.js`.

Используется: `AdminPanel.jsx`.

### `src/Models/ProductModal/ProductModal.jsx`

модальное окно создания и редактирования товара. Загружает категории для select, валидирует поля формы, вызывает создание или обновление товара.

Использует: `createProduct`, `updateProduct` из `productApi.js`, `getCategories` из `categotyApi.js`.

Используется: `AdminPanel.jsx`.

### `src/Models/CategoryModal/CategoryModal.jsx`

модальное окно создания категории. Валидирует название, вызывает создание категории и уведомляет родителя через `onCreated`.

Использует: `createCategory` из `categotyApi.js`.

Используется: `AdminPanel.jsx`.
