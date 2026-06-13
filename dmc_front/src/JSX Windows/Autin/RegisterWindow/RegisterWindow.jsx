import "./RegisterWIndowCSS.css"
import {NavLink, useNavigate} from "react-router-dom";
import {useState} from "react";
import {useAuth} from "../../../APIStuff/Autentification/AuthContext.jsx";


function  RegisterWindow() {
    const navigate = useNavigate();
    const { registration } = useAuth();
    const [error, setError] = useState("");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");

    async function handleRegister(event) {
        event.preventDefault();
        try {
            setError("");

            if (password !== passwordRepeat) {
                setError("Пароли не совпадают");
                return;
            }
            await registration(login, password);
            navigate("/home", { replace: true });
        } catch (error) {
            setError(error.message);
        }
    }
    return (
            <div className="registerPage">
                <div className="registerWindow">
                    <div className="header">
                        <div className="logo">DMC Store</div>
                        <div className="text">Регистрация</div>
                    </div>
                    <div className="Inputs">
                        <div className="Login">
                            <input placeholder=" " type="text"
                                   value={login}
                                   onChange={(event) => setLogin(event.target.value)}/>
                            <label>Логин</label>
                        </div>
                        <div className="Password">
                            <div className="inputPassword">
                                <input placeholder=" " type="password"
                                       value={password}
                                       onChange={(event) => setPassword(event.target.value)}/>
                                <label>Пароль</label>
                            </div>
                            <div className="inputPassword2">
                                <input placeholder=" " type="password"
                                       value={passwordRepeat}
                                       onChange={(event) => setPasswordRepeat(event.target.value)}/>
                                <label>Подтверждение Пароля</label>
                            </div>
                        </div>
                    </div>
                    <div className="LoginExitst">
                        Уже есть аккаунт?
                        <NavLink to="/">Войти</NavLink>
                    </div>
                    <div className="buttonContainer">
                        <button className="registerButton" onClick={handleRegister}>Зарегистрироваться</button>
                    </div>
                    {error && <div className="errorMessage">{error}</div>}
                </div>
            </div>
    );
}

export default RegisterWindow;