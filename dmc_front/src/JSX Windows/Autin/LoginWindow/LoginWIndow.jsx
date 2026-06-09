import "./LoginWindowCSS.css";
import {NavLink, useNavigate} from "react-router-dom";
import {useState} from "react";
import {loginRequest} from "../../../APIStuff/auth.js";


export default function LoginWindow() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin() {
        try {
            setError("");

            const tokens = await loginRequest(login, password);
            document.cookie = `jwt_token=${tokens.jwt_token}; path=/; SameSite=Lax`;
            document.cookie = `refresh_token=${tokens.refresh_token}; path=/; SameSite=Lax`;
            navigate("/home");
        } catch (error) {
            setError(error.message);
        }
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
                                <input placeholder=" " type="text" value={login}
                                       onChange={(event) => setLogin(event.target.value)}/>
                                <label>Логин</label>
                            </div>
                        </div>

                        <div className="Password">
                            <div className="inputPassword">
                                <input placeholder=" " type="password"
                                       value={password}
                                       onChange={(event) => setPassword(event.target.value)}/>
                                <label>Пароль</label>
                            </div>
                        </div>
                    </div>

                    <div className="registration">
                        Нет аккаунта?
                        <NavLink className="Register" to="/Registration">Зарегистрироваться</NavLink>
                    </div>

                    <div className="ButtonContainer">
                        <button className="loginButton" onClick={handleLogin}>
                            Войти
                        </button>
                        {error && <div className="errorMessage">{error}</div>}
                    </div>
                </div>
            </div>
    );
}