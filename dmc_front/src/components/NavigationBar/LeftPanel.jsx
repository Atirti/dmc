import { MdAccountCircle, MdHome,MdShoppingCart,MdLogout } from "react-icons/md";
import { NavLink } from "react-router-dom";
import "./LeftPanelCSS.css";

function LeftPanel() {
    return (
            <div className="LeftPanel">
                <header className="shopTitle">DMC Store</header>

                <div className="menu">
                    <NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>
                        <MdAccountCircle size={25}/>Профиль</NavLink>
                    <NavLink to="/home" className={({ isActive }) => isActive ? "active" : ""}>
                        <MdHome size={25}/>Главная</NavLink>
                    <NavLink to="/cart" className={({ isActive }) => isActive ? "active" : ""}>
                        <MdShoppingCart size={25}/>Корзина<i className="dot"></i></NavLink>
                </div>
                <NavLink to="/" className="Exit">
                    <MdLogout size={25}/>
                    Выход
                </NavLink>
            </div>
    );
}

export default LeftPanel;