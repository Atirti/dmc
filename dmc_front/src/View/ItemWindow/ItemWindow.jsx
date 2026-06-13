import "./ItemWindowCSS.css";
import LeftPanel from "../../View/NavigationBar/LeftPanel.jsx";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function ExpandableText({ text, limit, className, as: Tag = "div" }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!text) {
        return null;
    }

    const shouldCut = text.length > limit;

    const visibleText =
            shouldCut && !isExpanded ? text.slice(0, limit).trimEnd() : text;

    return (
            <Tag className={className}>{visibleText}{shouldCut && !isExpanded && (
                        <button type="button" className="textDotsButton" onClick={() => setIsExpanded(true)}>...
                        </button>)}
                {shouldCut && isExpanded && (
                        <button type="button" className="textCollapseButton" onClick={() => setIsExpanded(false)}>
                            Свернуть</button>)}
            </Tag>
    );
}

function ItemWindow() {
    const location = useLocation();
    const navigate = useNavigate();
    const item = location.state?.item;

    function handleNavigate() {
        navigate("/cart");
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
                            ) : (
                                    <div className="itemImagePlaceholder">Нет изображения</div>
                            )}
                        </div>

                        <div className="itemPanel">
                            <ExpandableText as="h1" className="itemPageTitle" text={item.title} limit={35}/>
                            <p className="itemPagePrice">{item.price} Рублей</p>
                            <p className="itemStock">В наличии: {item.count_in_stock}</p>
                            <button className="toCartButton" onClick={handleNavigate}>В корзину</button>
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