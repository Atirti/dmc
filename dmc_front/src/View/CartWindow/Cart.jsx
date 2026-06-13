import "./CartCSS.css";
import LeftPanel from "../NavigationBar/LeftPanel.jsx";
import babai from "../../assets/OK.ico";
function Cart() {
    const cartItems = [
        {
            id: 1,
            title: "Очень удивленный смешной кот",
            price: 100,
            count: 3,
            description: "Клевый товар и много слов пытаюсь ответить",
            picture_url: babai,
        },
        {
            id: 2,
            title: "Очень удивленный смешной кот",
            price: 100,
            count: 2,
            description: "Клевый товар и много слов пытаюсь ответить",
            picture_url: babai,
        },
    ];

    const totalPrice = cartItems.reduce((sum, item) => {
        return sum + item.price * item.count;
    }, 0);

    return (
            <div className="cartPage">
                <LeftPanel />

                <div className="cartWindow">
                    <div className="header">
                        <div className="title">Корзина</div>
                    </div>

                    <div className="cartContent">
                        <div className="cartItems">
                            {cartItems.map((item) => (
                                    <div className="cartItem" key={item.id}>
                                        <img className="cartItemImage" src={item.picture_url} alt={item.name} />
                                        <div className="cartItemInfo">
                                            <div className="cartItemTitle">{item.title}</div>
                                            <div className="cartItemPrice">{item.price} ₽</div>
                                        </div>
                                        <div className="cartItemCount">
                                            x{item.count}
                                        </div>
                                        <button className="removeButton">Удалить</button>
                                    </div>
                            ))}
                        </div>

                        <div className="cartSummary">
                            <div className="summaryTitle">Итого</div>
                            <div className="summaryRow">
                                <span>Товары:</span>
                                <span>{cartItems.length}</span>
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
                </div>
            </div>
    );
}

export default Cart;