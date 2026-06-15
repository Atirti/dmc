import "./LoginWindowCSS.css";
import {NavLink, useLocation, useNavigate} from "react-router-dom";
import {useState} from "react";
import {useAuth} from "../../../Controll/APIStuff/Autentification/AuthContext.jsx";
import {Alert, Box, Button, Card, CardContent, CircularProgress, Stack, TextField, Typography} from "@mui/material";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import {getNormalErrorMessage} from "../../../Controll/errorHandler.js";

export default function LoginWindow() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [error, setError] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoginLoading, setIsLoginLoading] = useState(false);
    const from = location.state?.from?.pathname || "/home";

    async function handleLogin(event) {
        event.preventDefault();

        if (!username.trim()) {
            setError("Введите логин");
            return;
        }

        if (!password.trim()) {
            setError("Введите пароль");
            return;
        }

        try {
            setIsLoginLoading(true);
            setError("");

            await login(username, password);

            navigate(from, { replace: true });
        } catch (error) {
            setError(getNormalErrorMessage(error));
        } finally {
            setIsLoginLoading(false);
        }
    }

    return (
            <div className="loginPage">
                <Card className="loginWindow" sx={{bgcolor: "#151922", color: "white", borderRadius: "32px",
                    border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none",}}>
                    <CardContent sx={{p: 4, "&:last-child": {pb: 4,},}}>
                        <Stack direction="row" alignItems="center" spacing={2} className="loginHeader">
                            <Box sx={{width: 64, height: 64, borderRadius: "50%", bgcolor: "#12141b", color: "#2E4578",
                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,}}>
                                <AccountCircleOutlinedIcon sx={{ fontSize: 38 }} />
                            </Box>

                            <Box>
                                <Typography variant="h4" sx={{color: "white", fontWeight: 800, lineHeight: 1.1,}}>
                                    DMC Store
                                </Typography>
                                <Typography sx={{color: "#8f94a3", mt: 0.7, fontSize: "1.05rem",}}>
                                    Войдите в аккаунт
                                </Typography>
                            </Box>
                        </Stack>

                        <Box component="form" onSubmit={handleLogin} className="loginForm">
                            <Stack spacing={2.2}>
                                <TextField value={username} onChange={(event) => setUsername(event.target.value)}
                                        label="Логин" fullWidth variant="outlined" className="loginInput"/>

                                <TextField value={password} onChange={(event) => setPassword(event.target.value)}
                                        label="Пароль" type="password" fullWidth variant="outlined" className="loginInput"
                                />
                            </Stack>

                            <div className="registration">
                                Нет аккаунта?
                                <NavLink className="Register" to="/registration">Зарегистрироваться</NavLink>
                            </div>

                            {error && (
                                    <Alert severity="error" sx={{mt: 2.5, bgcolor: "#2a1115", color: "#ffb4b4",
                                        borderRadius: "16px", border: "1px solid rgba(255, 107, 107, 0.25)",
                                        "& .MuiAlert-icon": {color: "#ff6b6b",},}}>
                                        {error}
                                    </Alert>
                            )}

                            <Button type="submit" fullWidth className="loginButton" disabled={isLoginLoading}
                                    endIcon={isLoginLoading ? <CircularProgress size={18} sx={{ color: "#777" }} /> :
                                            <LoginOutlinedIcon />}
                                    sx={{mt: 3, py: 1.5, borderRadius: "18px",
                                        bgcolor: "#2E4578", color: "white", fontWeight: 800, fontSize: "1rem",
                                        textTransform: "none", "&:hover": {bgcolor: "#3c589f",},
                                        "&.Mui-disabled": {bgcolor: "#2b2f3a", color: "#777",},}}
                            >
                                {isLoginLoading ? "Вход..." : "Войти"}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </div>
    );
}