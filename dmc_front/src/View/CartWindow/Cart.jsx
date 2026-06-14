import { useEffect, useState } from "react";
import "./CartCSS.css";
import LeftPanel from "../NavigationBar/LeftPanel.jsx";
import {getCartRequest, changeCartCountRequest,deleteCartItemRequest} from "../../Controll/APIStuff/get_put_Cart.js";

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingItemId, setUpdatingItemId] = useState(null);

    function sortCartItems(items) {
        return [...items].sort((a, b) => a.id - b.id);
    }

    useEffect(() => {
        async function loadCart() {
            try {
                setIsLoading(true);
                setError("");

                const data = await getCartRequest();
                setCartItems(sortCartItems(data));
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        }

        loadCart();
    }, []);


    async function changeCount(item, newCount) {
        if (newCount < 0) {
            return;
        }

        if (newCount > item.count_in_stock) {
            return;
        }

        try {
            setUpdatingItemId(item.id);
            setError("");

            const data = await changeCartCountRequest(item.id, newCount);
            setCartItems(sortCartItems(data));
        } catch (error) {
            setError(error.message);
        } finally {
            setUpdatingItemId(null);
        }
    }

    function increaseCount(item) {
        changeCount(item, item.count_in_cart + 1);
    }

    function decreaseCount(item) {
        changeCount(item, item.count_in_cart - 1);
    }

    async function removeItem(item) {
        try {
            setUpdatingItemId(item.id);
            setError("");

            const data = await deleteCartItemRequest(item.id);
            setCartItems(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setUpdatingItemId(null);
        }
    }

    const totalPrice = cartItems.reduce((sum, item) => {
        return sum + item.price * item.count_in_cart;
    }, 0);

    const totalProductsCount = cartItems.reduce((sum, item) => {
        return sum + item.count_in_cart;
    }, 0);

    return (
            <div className="cartPage">
                <LeftPanel />

                <div className="cartWindow">
                    <div className="header">
                        <div className="title">Корзина</div>
                    </div>{isLoading && (<div className="cartMessage">Загрузка корзины...</div>)}
                    {error && (<div className="cartError">{error}</div>)}

                    {!isLoading && cartItems.length === 0 && (<div className="cartMessage">Корзина пуста</div>)}

                    {!isLoading && cartItems.length > 0 && (
                            <div className="cartContent">
                                <div className="cartItems">
                                    {cartItems.map((item) => (
                                            <div className="cartItem" key={item.id}>
                                                <img className="cartItemImage" src={item.picture_url} alt={item.title}/>
                                                <div className="cartItemInfo">
                                                    <div className="cartItemTitle">{item.title}</div>
                                                    <div className="cartItemPrice">{item.price} ₽</div>
                                                    <div className="cartItemStock">В наличии: {item.count_in_stock}</div>
                                                </div>

                                                <div className="cartItemCountControl">
                                                    <button className="minusButton" disabled={
                                                        updatingItemId === item.id || item.count_in_cart <= 0}
                                                            onClick={() => decreaseCount(item)}>-
                                                    </button>
                                                    <span className="cartItemCount">{item.count_in_cart}</span>
                                                    <button className="addButton" disabled={
                                                        updatingItemId === item.id || item.count_in_cart >= item.count_in_stock}
                                                            onClick={() => increaseCount(item)}>
                                                        +
                                                    </button>
                                                </div>

                                                <button className="removeButton" disabled={updatingItemId === item.id}
                                                        onClick={() => removeItem(item)}>
                                                    Удалить
                                                </button>
                                            </div>
                                    ))}
                                </div>

                                <div className="cartSummary">
                                    <div className="summaryTitle">Итого</div>

                                    <div className="summaryRow">
                                        <span>Позиции:</span>
                                        <span>{cartItems.length}</span>
                                    </div>

                                    <div className="summaryRow">
                                        <span>Товары:</span>
                                        <span>{totalProductsCount}</span>
                                    </div>

                                    <div className="summaryRow">
                                        <span>Сумма:</span>
                                        <span>{totalPrice} ₽</span>
                                    </div>

                                    <button className="checkoutButton">
                                        Оформить заказ
                                    </button>
                                </div>
                            </div>
                    )}
                </div>
            </div>
    );
}

export default Cart;