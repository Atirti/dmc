import "./RegisterWIndowCSS.css"
import {NavLink, useNavigate} from "react-router-dom";


function  RegisterWindow() {
    const  navigate = useNavigate();
    function handleNavigate(){
        navigate("/")
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
                            <input placeholder=" " type="text"/>
                            <label>Логин</label>
                        </div>
                        <div className="Password">
                            <div className="inputPassword">
                                <input placeholder=" " type="password" />
                                <label>Пароль</label>
                            </div>
                            <div className="inputPassword2">
                                <input placeholder=" " type="password" />
                                <label>Подтверждение Пароля</label>
                            </div>
                        </div>
                    </div>
                    <div className="LoginExitst">
                        Уже есть аккаунт?
                        <NavLink to="/">Войти</NavLink>
                    </div>
                    <div className="buttonContainer">
                        <button className="registerButton" onClick={handleNavigate}>Зарегистрироваться</button>
                    </div>
                </div>
            </div>
    );
}

export default RegisterWindow;