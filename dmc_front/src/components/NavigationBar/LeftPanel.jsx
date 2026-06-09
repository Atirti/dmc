import { MdAccountCircle, MdHome, MdShoppingCart, MdLogout } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import "./LeftPanelCSS.css";
import {logoutRequest} from "../../APIStuff/auth.js";


function LeftPanel() {
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await logoutRequest();
            navigate("/");
        } catch (error) {
            alert(error.message);
        }
    }

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

                    <NavLink to="/cart" className={({ isActive }) => isActive ? "active" : ""}>
                        <MdShoppingCart size={25} />
                        Корзина
                        <i className="dot"></i></NavLink>
                </div>

                <button onClick={handleLogout} className="Exit">
                    <MdLogout size={25} />
                    Выход</button>
            </div>
    );
}

export default LeftPanel;