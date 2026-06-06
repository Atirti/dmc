import babai from "../../assets/OK.ico";
import "./MainMenuCSS.css";

const itemsList = [
    {
        item_name: "5090RTX ZOTAC",
        item_image: babai,
    },
];

function MainMenu() {
    return (
            <div className="MainMenu">
                <div className="itemsMenu" id="itemsMenu">
                    <div className="itemsMenuList">
                        {itemsList.map((item, index) => (
                                <div key={index} className="itemsMenuListItem">
                                    <img src={item.item_image} alt={item.item_name} />
                                    <p>{item.item_name}</p>
                                </div>
                        ))}
                    </div>
                </div>
            </div>
    );
}

export default MainMenu;