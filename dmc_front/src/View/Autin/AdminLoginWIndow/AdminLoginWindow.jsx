import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {Alert, Box, Button, Card, CardContent, CircularProgress, Stack, TextField, Typography} from "@mui/material";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import {useAdminAuth} from "../../../Controll/APIStuff/adminStuuf/AdminAuthContext.jsx";
import "./AdminLoginWindowCSS.css";

function AdminLoginWindow() {
    const navigate = useNavigate();
    const { adminLogin } = useAdminAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoginLoading, setIsLoginLoading] = useState(false);

    async function handleAdminLogin(event) {
        event.preventDefault();

        if (!username.trim()) {
            setError("Введите логин администратора");
            return;
        }

        if (!password.trim()) {
            setError("Введите пароль администратора");
            return;
        }

        try {
            setIsLoginLoading(true);
            setError("");

            await adminLogin(username, password);

            navigate("/admin", { replace: true });
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoginLoading(false);
        }
    }

    return (
            <div className="adminLoginPage">
                <Card className="adminLoginWindow" sx={{bgcolor: "#151922", color: "white", borderRadius: "32px",
                    border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none",}}>
                    <CardContent sx={{p: 4, "&:last-child": {pb: 4,},}}>
                        <Stack direction="row" alignItems="center" spacing={2} className="adminLoginHeader">
                            <Box sx={{width: 64, height: 64, borderRadius: "50%", bgcolor: "#12141b", color: "#2E4578",
                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,}}>
                                <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 38 }} />
                            </Box>

                            <Box>
                                <Typography variant="h4" sx={{color: "white", fontWeight: 800, lineHeight: 1.1,}}>
                                    Admin Panel
                                </Typography>
                                <Typography sx={{color: "#8f94a3", mt: 0.7, fontSize: "1.05rem",}}>
                                    Вход администратора
                                </Typography>
                            </Box>
                        </Stack>

                        <Box component="form" onSubmit={handleAdminLogin} className="adminLoginForm">
                            <Stack spacing={2.2}>
                                <TextField
                                        value={username}
                                        onChange={(event) => setUsername(event.target.value)}
                                        label="Логин"
                                        fullWidth
                                        variant="outlined"
                                        className="adminLoginInput"
                                />

                                <TextField
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        label="Пароль"
                                        type="password"
                                        fullWidth
                                        variant="outlined"
                                        className="adminLoginInput"
                                />
                            </Stack>

                            {error && (
                                    <Alert severity="error" sx={{mt: 2.5, bgcolor: "#2a1115", color: "#ffb4b4",
                                        borderRadius: "16px", border: "1px solid rgba(255, 107, 107, 0.25)",
                                        "& .MuiAlert-icon": {color: "#ff6b6b",},}}>
                                        {error}
                                    </Alert>
                            )}

                            <Button
                                    type="submit"
                                    fullWidth
                                    disabled={isLoginLoading}
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

export default AdminLoginWindow;