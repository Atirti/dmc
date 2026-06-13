import "./ItemWindowCSS.css";
import LeftPanel from "../../components/NavigationBar/LeftPanel.jsx";
import { itemsList } from "../../Data/ItemList.jsx";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ExpandableText({ text, limit, className, as: Tag = "div" }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!text) {
        return null;
    }

    const shouldCut = text.length > limit;
    const visibleText = shouldCut && !isExpanded
            ? text.slice(0, limit).trimEnd()
            : text;

    return (
            <Tag className={className}>
                {visibleText}

                {shouldCut && !isExpanded && (
                        <button type="button" className="textDotsButton" onClick={() => setIsExpanded(true)}>
                            ...
                        </button>)}

                {shouldCut && isExpanded && (
                        <button type="button" className="textCollapseButton" onClick={() => setIsExpanded(false)}>
                            Свернуть
                        </button>)}
            </Tag>
    );
}

function ItemWindow() {
    const { id } = useParams();
    const item = itemsList.find((item) => item.id === Number(id));
    const navigate = useNavigate();

    function handleNavigate() {
        navigate("/cart");
    }

    if (!item) {
        return (
                <div className="itemWindow">
                    <LeftPanel />

                    <main className="itemContent">
                        <div className="itemDescriptionBlock">
                            <h1>Товар не найден</h1>
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
                            <img className="itemImage" src={item.picture_url} alt={item.title}/>
                        </div>

                        <div className="itemPanel">
                            <ExpandableText as="h1" className="itemPageTitle" text={item.title} limit={35}/>
                            <p className="itemPagePrice">{item.price} Рублей</p>
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