import { MdAccountCircle, MdHome, MdShoppingCart} from "react-icons/md";
import { NavLink} from "react-router-dom";
import "./LeftPanelCSS.css";


function LeftPanel() {

    return (
            <div className="LeftPanel">
                <header className="shopTitle">DMC Store</header>

                <div className="menu">
                    <NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>
                        <MdAccountCircle size={25} />
                        Профиль</NavLink>

                    <NavLink to="/home" className={({ isActive }) => isActive ? "active" : ""}>
                        <MdHome size={25} />
                        Главная</NavLink>

                    <NavLink
                            to="/cart"
                            className={({ isActive }) => isActive ? "cartLink active" : "cartLink"}>
                        <MdShoppingCart size={25} />
                        Корзина
                    </NavLink>
                </div>
            </div>
    );
}

export default LeftPanel;