import {
    MdOutlineAccountCircle,
    MdOutlineHome,
    MdOutlineShoppingCart,
} from "react-icons/md";
import { NavLink } from "react-router-dom";
import {  IconButton } from "@mui/material";
import "./LeftPanelCSS.css";

function LeftPanel() {
    return (
            <div className="LeftPanel">
                <header className="shopTitle">DMC Store</header>

                <div className="menu">
                    <NavLink to="/profile" className={({ isActive }) => isActive ? "navButton active" : "navButton"}>
                        <IconButton className="menuButton" disableRipple>
                            <div className="iconWrapper">
                                <MdOutlineAccountCircle size={25} />
                            </div>
                            <span>Профиль</span>
                        </IconButton>
                    </NavLink>

                    <NavLink to="/home" className={({ isActive }) => isActive ? "navButton active" : "navButton"}>
                        <IconButton className="menuButton" disableRipple>
                            <div className="iconWrapper">
                                <MdOutlineHome size={25} />
                            </div>
                            <span>Главная</span>
                        </IconButton>
                    </NavLink>

                    <NavLink to="/cart" className={({ isActive }) => isActive ? "navButton active" : "navButton"}>
                        <IconButton className="menuButton" disableRipple>
                            <div className="iconWrapper">
                                <MdOutlineShoppingCart size={25} />
                            </div>
                            <span>Корзина</span>
                        </IconButton>
                    </NavLink>
                </div>
            </div>
    );
}

export default LeftPanel;