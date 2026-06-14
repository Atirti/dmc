import "./LoginWindowCSS.css";
import {NavLink, useLocation, useNavigate} from "react-router-dom";
import {useState} from "react";
import {useAuth} from "../../../Controll/APIStuff/Autentification/AuthContext.jsx";

export default function LoginWindow() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [error, setError] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const from = location.state?.from?.pathname || "/home";

    async function handleLogin(event) {
        event.preventDefault();
        try {
            setError("");
            await login(username, password);
            navigate(from, { replace: true });
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
                                <input placeholder=" " type="text" value={username}
                                       onChange={(event) => setUsername(event.target.value)}/>
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
                        <NavLink className="Register" to="/registration">Зарегистрироваться</NavLink>
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