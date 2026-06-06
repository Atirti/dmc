import "./MainMenuCSS.css";
import {NavLink} from "react-router-dom";
import {itemsList} from "../../Data/ItemList.jsx";

function MainMenu() {
    return (
            <main className="MainMenu">
                <div className="itemsMenu" id="itemsMenu">
                    <div className="itemsMenuList">
                        {itemsList.map((item) => (
                                <NavLink to={`/home/item/${item.id}`} key={item.id} className="itemsMenuListItem">
                                    <img src={item.picture_url}/>
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