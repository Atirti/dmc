import "./MainMenuCSS.css";
import {NavLink} from "react-router-dom";
import {getItemsRequest} from "../../Controll/APIStuff/getItemsForMain.js";
import {useEffect, useState} from "react";

function MainMenu() {
    const [itemsList, setItemList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sortType, setSortType] = useState("");
    const [order, setOrder] = useState("");
    const [category, setCategory] = useState("");
    const [limit, setLimit] = useState("");

    useEffect(() =>{
        async function loadItems(){
            try{
                const items = await getItemsRequest();
                setItemList(items);
            }
            catch(err){
                console.log(err);
                setError("Не удалось загрузить товары")
            }
            finally {
                setLoading(false);
            }
        }
        loadItems();
    },[])
    if (loading){
        return <div className="LoadingText">Loading...</div>;
    }
    if (error){
        return <div className="ErrorText">Error : {error}</div>;
    }

    return (
            <main className="MainMenu">
                <div className="sortCombos">
                    <div className="ComboBoxSort">
                        <select value={sortType} onChange={(event) => setSortType(event.target.value)}>
                            <option value="date">По дате</option>
                        </select>
                    </div>
                    <div className="ComboBoxOrder">
                        <select value={order} onChange={(event) => setOrder(event.target.value)}>
                            <option value="desc">По убыванию</option>
                            <option value="asc">По возрастанию</option>
                        </select>
                    </div>
                    <div className="ComboBoxCategory">
                        <select value={category} onChange={(event) => setCategory(event.target.value)}>
                            <option value="cat1">Category 1</option>
                            <option value="cat2">Category 2</option>
                            <option value="cat3">Category 3</option>
                            <option value="cat4">Category 4</option>
                        </select>
                    </div>
                    <div className="ComboBoxItemLimit">
                        <select value={limit} onChange={(event) => setLimit(event.target.value)}>
                            <option value="10">10 Предметов</option>
                            <option value="20">20 Предметов</option>
                            <option value="30">30 Предметов</option>
                            <option value="40">40 Предметов</option>
                        </select>
                    </div>
                </div>
                <div className="itemsMenu" id="itemsMenu">
                    <div className="itemsMenuList">
                    {itemsList.map((item) => (
                                <NavLink to={`/home/item/${item.id}`} key={item.id} className="itemsMenuListItem">
                                    <img src={item.picture_url} alt={item.name} />
                                    <p className="itemPrice">{item.price} Рублей</p>
                                    <p className="itemTitle">{item.title}</p>
                                </NavLink>
                        ))}
                    </div>
                </div>
            </main>
    );
}

export default MainMenu;