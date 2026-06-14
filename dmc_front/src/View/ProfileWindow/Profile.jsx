import { useEffect, useState } from "react";
import LeftPanel from "../LeftPanel/LeftPanel.jsx";
import "./ProfileCSS.css";
import { MdAccountCircle, MdLogout } from "react-icons/md";
import { useAuth } from "../../Controll/APIStuff/Autentification/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { getCurrentUsername } from "../../Controll/APIStuff/Autentification/auth.js";
import { getUserOrdersRequest } from "../../Controll/APIStuff/post_get_Orders.js";

function Profile() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [username, setUsername] = useState("Пользователь");
    const [orders, setOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [ordersError, setOrdersError] = useState("");

    function getText(value, fallback = "") {
        if (typeof value === "string") {
            return value;
        }

        if (typeof value === "number") {
            return String(value);
        }

        return fallback;
    }

    function getNumber(value) {
        const number = Number(value);
        return Number.isFinite(number) ? number : 0;
    }

    function getItemCount(item) {
        return getNumber(item?.count ?? item?.count_in_cart ?? item?.product_count);
    }

    function getStatusText(status) {
        if (status === "paid") {return "Оплачен";}

        return getText(status, "Неизвестно");
    }

    function normalizeOrders(data) {
        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.orders)) {
            return data.orders;
        }

        return [];
    }

    useEffect(() => {
        async function loadProfile() {
            try {
                setUsername(getCurrentUsername());
                setIsLoadingOrders(true);
                setOrdersError("");

                const data = await getUserOrdersRequest();
                setOrders(normalizeOrders(data));
            } catch (error) {
                setOrdersError(error.message || "Ошибка загрузки заказов");
            } finally {
                setIsLoadingOrders(false);
            }
        }

        loadProfile();
    }, []);

    async function handleLogout() {
        try {
            await logout();
            navigate("/");
        } catch (error) {
            alert(error.message);
            navigate("/", { replace: true });
        }
    }

    return (
            <div className="Profile">
                <LeftPanel />
                <main>
                    <div className="profilePage">
                        <div className="profilePageHeader">
                            <MdAccountCircle size={100} className="profileImg" />

                            <div className="profileUserStuff">
                                <div className="profileUsername">{username}</div>
                                <button onClick={handleLogout} className="Exit"><MdLogout size={25} />Выход</button>
                            </div>
                        </div>

                        <div className="profilePageOrders">
                            <div className="profileOrdersTitle">Мои заказы</div>
                            {isLoadingOrders && (<div className="profileOrdersMessage">Загрузка заказов...</div>)}
                            {ordersError && (<div className="profileOrdersError">{ordersError}</div>)}
                            {!isLoadingOrders && !ordersError && orders.length === 0 && (
                                    <div className="profileOrdersMessage">У вас пока нет заказов</div>)}

                            {!isLoadingOrders && !ordersError && orders.length > 0 && (
                                    <div className="ordersList">
                                        {orders.map((order) => {
                                            const orderId = getText(order?.id, "—");
                                            const orderStatus = getStatusText(order?.status);
                                            const orderAddress = getText(order?.address, "Адрес не указан");
                                            const orderPrice = getNumber(order?.price);
                                            const products = Array.isArray(order?.products)
                                                    ? order.products
                                                    : [];

                                            const productsCount = products.reduce((sum, product) => {
                                                return sum + getItemCount(product);
                                            }, 0);

                                            return (
                                                    <div className="profileOrderCard" key={orderId}>
                                                        <div className="profileOrderHeader">
                                                            <div className="profileOrderNumber">Заказ #{orderId}</div>
                                                            <div className="profileOrderStatus">{orderStatus}</div>
                                                        </div>

                                                        <div className="profileOrderInfo">
                                                            <div className="profileOrderRow">
                                                                <span>Адрес:</span>
                                                                <span>{orderAddress}</span>
                                                            </div>

                                                            <div className="profileOrderRow">
                                                                <span>Товаров:</span>
                                                                <span>{productsCount}</span>
                                                            </div>

                                                            <div className="profileOrderRow">
                                                                <span>Сумма:</span>
                                                                <span>{orderPrice} ₽</span>
                                                            </div>
                                                        </div>

                                                        <div className="profileOrderProducts">
                                                            {products.map((product, index) => {
                                                                const productId = getText(product?.id, `product-${index}`);
                                                                const title = getText(product?.title, "Без названия");
                                                                const pictureUrl = getText(product?.picture_url, "");
                                                                const price = getNumber(product?.price);
                                                                const count = getItemCount(product);
                                                                const total = price * count;

                                                                return (
                                                                        <div className="profileOrderProduct" key={productId}>
                                                                            <img className="profileOrderProductImage"
                                                                                    src={pictureUrl} alt={title}/>
                                                                            <div className="profileOrderProductInfo">
                                                                                <div className="profileOrderProductTitle">
                                                                                    {title}</div>
                                                                                <div className="profileOrderProductDetails">
                                                                                    {price} ₽ × {count} = {total} ₽</div>
                                                                            </div>
                                                                        </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                            );
                                        })}
                                    </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
    );
}

export default Profile;