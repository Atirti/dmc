import "./RegisterWIndowCSS.css";
import {NavLink, useNavigate} from "react-router-dom";
import {useState} from "react";
import {useAuth} from "../../../Controll/APIStuff/Autentification/AuthContext.jsx";
import {Alert, Box, Button, Card, CardContent, CircularProgress, Stack, TextField, Typography} from "@mui/material";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import AppRegistrationOutlinedIcon from "@mui/icons-material/AppRegistrationOutlined";

function  RegisterWindow() {
    const navigate = useNavigate();
    const { registration } = useAuth();
    const [error, setError] = useState("");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");
    const [isRegisterLoading, setIsRegisterLoading] = useState(false);

    async function handleRegister(event) {
        event.preventDefault();

        if (!login.trim()) {
            setError("Введите логин");
            return;
        }

        if (!password.trim()) {
            setError("Введите пароль");
            return;
        }

        if (!passwordRepeat.trim()) {
            setError("Повторите пароль");
            return;
        }

        if (password !== passwordRepeat) {
            setError("Пароли не совпадают");
            return;
        }

        try {
            setIsRegisterLoading(true);
            setError("");

            await registration(login, password);

            navigate("/home", { replace: true });
        } catch (error) {
            setError(error.message);
        } finally {
            setIsRegisterLoading(false);
        }
    }

    return (
            <div className="registerPage">
                <Card className="registerWindow" sx={{bgcolor: "#151922", color: "white", borderRadius: "32px",
                    border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none",}}>
                    <CardContent sx={{p: 4, "&:last-child": {pb: 4,},}}>
                        <Stack direction="row" alignItems="center" spacing={2} className="registerHeader">
                            <Box sx={{width: 64, height: 64, borderRadius: "50%", bgcolor: "#12141b", color: "#2E4578",
                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,}}>
                                <PersonAddAltOutlinedIcon sx={{ fontSize: 38 }} />
                            </Box>

                            <Box>
                                <Typography variant="h4" sx={{color: "white", fontWeight: 800, lineHeight: 1.1,}}>
                                    DMC Store
                                </Typography>
                                <Typography sx={{color: "#8f94a3", mt: 0.7, fontSize: "1.05rem",}}>
                                    Регистрация
                                </Typography>
                            </Box>
                        </Stack>

                        <Box component="form" onSubmit={handleRegister} className="registerForm">
                            <Stack spacing={2.2}>
                                <TextField value={login} onChange={(event) => setLogin(event.target.value)}
                                        label="Логин" fullWidth variant="outlined" className="registerInput"/>

                                <TextField value={password} onChange={(event) => setPassword(event.target.value)}
                                           label="Пароль" type="password" fullWidth variant="outlined" className="registerInput"/>
                                <TextField value={passwordRepeat}
                                        onChange={(event) => setPasswordRepeat(event.target.value)} label="Подтверждение пароля"
                                        type="password" fullWidth variant="outlined" className="registerInput"/>
                            </Stack>

                            <div className="LoginExitst">
                                Уже есть аккаунт?
                                <NavLink to="/">Войти</NavLink>
                            </div>

                            {error && (
                                    <Alert severity="error" sx={{mt: 2.5, bgcolor: "#2a1115", color: "#ffb4b4",
                                        borderRadius: "16px", border: "1px solid rgba(255, 107, 107, 0.25)",
                                        "& .MuiAlert-icon": {color: "#ff6b6b",},}}>
                                        {error}
                                    </Alert>
                            )}

                            <Button type="submit" fullWidth className="registerButton" disabled={isRegisterLoading}
                                    endIcon={isRegisterLoading ? <CircularProgress size={18} sx={{ color: "#777" }} /> :
                                            <AppRegistrationOutlinedIcon />}
                                    sx={{mt: 3, py: 1.5, borderRadius: "18px",
                                        bgcolor: "#2E4578", color: "white", fontWeight: 800, fontSize: "1rem",
                                        textTransform: "none", "&:hover": {bgcolor: "#3c589f",},
                                        "&.Mui-disabled": {bgcolor: "#2b2f3a", color: "#777",},}}
                            >
                                {isRegisterLoading ? "Регистрация..." : "Зарегистрироваться"}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </div>
    );
}

export default RegisterWindow;