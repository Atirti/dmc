import { MdAccountCircle, MdHome, MdShoppingCart, MdLogout } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import "./LeftPanelCSS.css";
import {useAuth} from "../../APIStuff/Autentification/AuthContext.jsx";



function LeftPanel() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    async function handleLogout() {
        try {
            await logout();
            navigate("/");
        } catch (error) {
            alert(error.message);
            navigate("/", {replace: true});
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

                    <NavLink
                            to="/cart"
                            data-count="3"
                            className={({ isActive }) => isActive ? "cartLink active" : "cartLink"}
                    >
                        <MdShoppingCart size={25} />
                        Корзина
                    </NavLink>
                </div>

                <button onClick={handleLogout} className="Exit">
                    <MdLogout size={25} />
                    Выход</button>
            </div>
    );
}

export default LeftPanel;