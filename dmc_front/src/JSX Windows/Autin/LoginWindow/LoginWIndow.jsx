import "./LoginWindowCSS.css";
import {NavLink, useNavigate} from "react-router-dom";

export default function LoginWindow() {
    const navigate = useNavigate();

    function handleNavigate() {
        navigate("/home");
    }

    return (
            <div className="loginPage">
                <div className="loginWindow">
                    <div className="header">
                        <div className="logo">DMC Store</div>
                        <div className="text">Войдите в аккаунт</div>
                    </div>

                    <div className="Inputs">
                        <div className="Login">
                            <div className="inputLogin">
                                <input placeholder=" " type="text" />
                                <label>Логин</label>
                            </div>
                        </div>

                        <div className="Password">
                            <div className="inputPassword">
                                <input placeholder=" " type="password" />
                                <label>Пароль</label>
                            </div>
                        </div>
                    </div>

                    <div className="registration">
                        Нет аккаунта?
                        <NavLink className="Register" to="/Registration">Зарегистрироваться</NavLink>
                    </div>

                    <div className="ButtonContainer">
                        <button className="loginButton" onClick={handleNavigate}>
                            Войти
                        </button>
                    </div>
                </div>
            </div>
    );
}