import "./ItemWindowCSS.css";
import LeftPanel from "../../View/NavigationBar/LeftPanel.jsx";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addItemToCartRequest} from "../../Controll/APIStuff/get_put_Cart.js";
import {useAuth} from "../../Controll/APIStuff/Autentification/AuthContext.jsx";

function ExpandableText({ text, limit, className, as: Tag = "div" }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!text) {
        return null;
    }
    const shouldCut = text.length > limit;
    const visibleText = shouldCut && !isExpanded ? text.slice(0, limit).trimEnd() : text;

    return (
            <Tag className={className}>
                {visibleText}

                {shouldCut && !isExpanded && (
                        <button type="button" className="textDotsButton" onClick={() => setIsExpanded(true)}>
                            ...</button>)}
                {shouldCut && isExpanded && (
                        <button type="button" className="textCollapseButton" onClick={() => setIsExpanded(false)}>
                            Свернуть</button>
                )}
            </Tag>
    );
}

function ItemWindow() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuth, loading } = useAuth();

    const item = location.state?.item;

    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState("");

    async function handleAddToCart() {
        if (loading) {
            return;
        }

        if (!isAuth) {
            navigate("/login");
            return;
        }

        if (!item) {
            return;
        }

        if (item.count_in_stock <= 0) {
            setError("Товара нет в наличии");
            return;
        }

        const currentCount = item.count_in_cart || 0;
        const newCount = currentCount + 1;

        if (newCount > item.count_in_stock) {
            setError("Нельзя добавить больше товаров, чем есть в наличии");
            return;
        }

        try {
            setIsAdding(true);
            setError("");

            await addItemToCartRequest(item.id, newCount);

            navigate("/cart");
        } catch (error) {
            setError(error.message);
        } finally {
            setIsAdding(false);
        }
    }

    if (!item) {
        return (
                <div className="itemWindow">
                    <LeftPanel />
                    <main className="itemContent">
                        <div className="itemDescriptionBlock">
                            <h1>Данные товара не найдены</h1>

                            <button onClick={() => navigate("/home")}>
                                Вернуться к товарам
                            </button>
                        </div>
                    </main>
                </div>
        );
    }

    return (
            <div className="itemWindow">
                <LeftPanel />

                <main className="itemContent">
                    <div className="itemTop">
                        <div className="itemImageBlock">
                            {item.picture_url ? (
                                    <img className="itemImage" src={item.picture_url} alt={item.title}/>
                            ) : (<div className="itemImagePlaceholder">Нет изображения</div>
                            )}
                        </div>

                        <div className="itemPanel">
                            <ExpandableText as="h1" className="itemPageTitle" text={item.title} limit={35}/>
                            <p className="itemPagePrice">{item.price} Рублей</p>
                            <p className="itemStock">В наличии: {item.count_in_stock}</p>
                            {error && (<div className="itemError">{error}</div>)}
                            <button className="toCartButton" onClick={handleAddToCart}
                                    disabled={isAdding || loading || item.count_in_stock <= 0 ||
                                            item.count_in_cart >= item.count_in_stock}>
                                {isAdding ? "Добавление..." : "В корзину"}</button>
                        </div>
                    </div>

                    <div className="itemDescriptionBlock">
                        <div className="Description">Описание:</div>
                        <ExpandableText className="itemDescription" text={item.description} limit={250}/>
                    </div>
                </main>
            </div>
    );
}

export default ItemWindow;