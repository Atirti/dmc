import "./MainMenuCSS.css";
import { NavLink } from "react-router-dom";
import { getItemsRequest } from "../../Controll/APIStuff/getItemsForMain.js";
import { useEffect, useState } from "react";

function MainMenu() {
    const [itemsList, setItemList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sortType, setSortType] = useState("date");
    const [order, setOrder] = useState("desc");
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(0);

    useEffect(() => {
        async function loadItems() {
            try {
                setLoading(true);
                setError("");
                const offset = page * limit;
                const items = await getItemsRequest(limit, offset, order, sortType);
                setItemList(items);
            } catch (err) {
                console.log(err);
                setError("Не удалось загрузить товары");
            } finally {
                setLoading(false);
            }
        }

        loadItems();
    }, [page, limit, order, sortType]);


    function handleLimitChange(event) {
        setLimit(Number(event.target.value));
        setPage(0);
    }
    function handleOrderChange(event) {
        setOrder(event.target.value);
        setPage(0);
    }
    function handleSortChange(event) {
        setSortType(event.target.value);
        setPage(0);
    }
    function nextPage() {
        setPage((prevPage) => prevPage + 1);
    }
    function prevPage() {
        setPage((prevPage) => Math.max(prevPage - 1, 0));
    }



    if (loading) {return <div className="LoadingText">Loading...</div>;}
    if (error) {return <div className="ErrorText">Error: {error}</div>;}
    return (
            <main className="MainMenu">
                <div className="sortCombos">
                    <div className="ComboBoxSort">
                        <select value={sortType} onChange={handleSortChange}>
                            <option value="date">По дате</option>
                            <option value="price">По цене</option>
                        </select>
                    </div>

                    <div className="ComboBoxOrder">
                        <select value={order} onChange={handleOrderChange}>
                            <option value="desc">По убыванию</option>
                            <option value="asc">По возрастанию</option>
                        </select>
                    </div>

                    <div className="ComboBoxItemLimit">
                        <select value={limit} onChange={handleLimitChange}>
                            <option value={10}>10 Предметов</option>
                            <option value={20}>20 Предметов</option>
                            <option value={30}>30 Предметов</option>
                            <option value={40}>40 Предметов</option>
                        </select>
                    </div>
                </div>

                <div className="itemsMenu" id="itemsMenu">
                    <div className="itemsMenuList">
                        {itemsList.map((item) => (
                                <NavLink to={`/home/item/${item.id}`} key={item.id} className="itemsMenuListItem"
                                        state={{ item }}>{item.picture_url ? (
                                            <img src={item.picture_url} alt={item.title} />) : (
                                            <div className="itemImagePlaceholder">Нет изображения</div>)}
                                    <p className="itemPrice">{item.price} Рублей</p>
                                    <p className="itemTitle">{item.title}</p>
                                </NavLink>
                        ))}
                    </div>
                </div>

                <div className="pages">
                    <button onClick={prevPage} disabled={page === 0}>&lt;</button>
                        <span>Страница {page + 1}</span>
                    <button onClick={nextPage} disabled={itemsList.length < limit} content=">">&gt;</button>
                </div>
            </main>
    );
}

export default MainMenu;