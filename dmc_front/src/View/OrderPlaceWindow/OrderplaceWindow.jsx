import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./OrderplaceWindowCSS.css";
import LeftPanel from "../LeftPanel/LeftPanel.jsx";

function OrderplaceWindow() {
    const location = useLocation();
    const navigate = useNavigate();

    const [orderId, setOrderId] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [address, setAddress] = useState("");
    const [orderStatus, setOrderStatus] = useState("");
    const [orderPrice, setOrderPrice] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

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
        return getNumber(item?.count_in_cart ?? item?.count ?? item?.product_count);
    }

    function sortOrderItems(items) {
        return [...items].sort((a, b) => {
            return getNumber(a?.id) - getNumber(b?.id);
        });
    }

    function getReadableStatus(status) {
        if (status === "paid") {
            return "Оплачен";
        }

        return getText(status, "Неизвестно");
    }

    useEffect(() => {
        const createdOrder = location.state?.order;

        if (!createdOrder) {
            setError("Информация о заказе не найдена. Вернитесь в корзину и оформите заказ заново.");
            setIsLoading(false);
            return;
        }

        setOrderId(createdOrder.id);
        setAddress(getText(createdOrder.address, ""));
        setOrderStatus(getReadableStatus(createdOrder.status));
        setOrderPrice(getNumber(createdOrder.price));

        if (Array.isArray(createdOrder.products)) {
            setOrderItems(sortOrderItems(createdOrder.products));
        } else {
            setOrderItems([]);
        }

        setIsLoading(false);
    }, [location.state]);

    const totalPrice = orderPrice || orderItems.reduce((sum, item) => {
        const price = getNumber(item?.price);
        const count = getItemCount(item);

        return sum + price * count;
    }, 0);

    const totalProductsCount = orderItems.reduce((sum, item) => {
        return sum + getItemCount(item);
    }, 0);

    return (
            <div className="orderPage">
                <LeftPanel />

                <div className="orderWindow">
                    <div className="orderHeader">
                        <div className="orderTitle">Информация о заказе</div>
                    </div>
                    {isLoading && (<div className="orderMessage">Загрузка заказа...</div>)}
                    {error && (<div className="orderError">{error}</div>)}
                    {!isLoading && !error && orderItems.length === 0 && (
                            <div className="orderMessage">В заказе нет товаров</div>)}
                    {!isLoading && !error && orderItems.length > 0 && (
                            <div className="orderContent">
                                <div className="orderItems">
                                    {orderItems.map((item, index) => {
                                        const id = getText(item?.id, `item-${index}`);
                                        const title = getText(item?.title, "Без названия");
                                        const pictureUrl = getText(item?.picture_url, "");
                                        const price = getNumber(item?.price);
                                        const count = getItemCount(item);
                                        const itemTotal = price * count;

                                        return (
                                                <div className="orderItem" key={id}>
                                                    <img className="orderItemImage" src={pictureUrl} alt={title}/>
                                                    <div className="orderItemInfo">
                                                        <div className="orderItemTitle">{title}</div>
                                                        <div className="orderItemPrice">{price} ₽</div>
                                                        <div className="orderItemCount">Количество: {count}</div>
                                                    </div>
                                                    <div className="orderItemTotal">{itemTotal} ₽</div>
                                                </div>
                                        );
                                    })}
                                </div>

                                <div className="orderSummary">
                                    <div className="summaryTitle">Заказ</div>

                                    <div className="summaryRow">
                                        <span>Номер:</span>
                                        <span>{orderId}</span>
                                    </div>

                                    <div className="summaryRow">
                                        <span>Статус:</span>
                                        <span>{orderStatus}</span>
                                    </div>

                                    <div className="summaryRow">
                                        <span>Адрес:</span>
                                        <span>{address}</span>
                                    </div>

                                    <div className="summaryRow">
                                        <span>Позиции:</span>
                                        <span>{orderItems.length}</span>
                                    </div>

                                    <div className="summaryRow">
                                        <span>Товары:</span>
                                        <span>{totalProductsCount}</span>
                                    </div>

                                    <div className="summaryRow">
                                        <span>Сумма:</span>
                                        <span>{totalPrice} ₽</span>
                                    </div>

                                    <button
                                            className="payButton"
                                            disabled
                                    >
                                        Оплачено
                                    </button>

                                    <button
                                            className="checkoutButton"
                                            onClick={() => navigate("/home")}
                                    >
                                        Вернуться на главную
                                    </button>
                                </div>
                            </div>
                    )}
                </div>
            </div>
    );
}

export default OrderplaceWindow;