import "./AdminPanelCss.css";
import {Box, Button, Card, CardContent, Divider, Stack, Typography} from "@mui/material";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import {useNavigate} from "react-router-dom";
import {useAdminAuth} from "../../../Controll/APIStuff/adminStuuf/AdminAuthContext.jsx";

function AdminPanel() {
    const navigate = useNavigate();
    const { adminLogout } = useAdminAuth();

    async function handleAdminLogout() {
        try {
            await adminLogout();
            navigate("/admin_login", { replace: true });
        } catch (error) {
            console.log(error);
            navigate("/admin_login", { replace: true });
        }
    }

    return (
            <div className="adminPage">
                <Box className="adminWindow">
                    <Stack direction="row" alignItems="center" justifyContent="space-between"
                           spacing={2} className="adminHeader">
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Box sx={{width: 64, height: 64, borderRadius: "50%", bgcolor: "#12141b",
                                color: "#2E4578", display: "flex", alignItems: "center",
                                justifyContent: "center", flexShrink: 0,}}>
                                <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 38 }} />
                            </Box>

                            <Box>
                                <Typography variant="h4" sx={{color: "white", fontWeight: 800, lineHeight: 1.1,}}>
                                    Админ-панель
                                </Typography>
                                <Typography sx={{color: "#8f94a3", mt: 0.7, fontSize: "1.05rem",}}>
                                    Управление магазином
                                </Typography>
                            </Box>
                        </Stack>

                        <Button
                                onClick={handleAdminLogout}
                                endIcon={<LogoutOutlinedIcon />}
                                sx={{py: 1.4, px: 3, borderRadius: "18px",
                                    bgcolor: "#2E4578", color: "white", fontWeight: 800, fontSize: "1rem",
                                    textTransform: "none", flexShrink: 0, "&:hover": {bgcolor: "#3c589f",},}}
                        >
                            Выйти
                        </Button>
                    </Stack>

                    <div className="adminContent">
                        <Card className="adminMainCard" sx={{bgcolor: "#151922", color: "white", borderRadius: "32px",
                            border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none",}}>
                            <CardContent sx={{p: 3, "&:last-child": {pb: 3,},}}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center"
                                       spacing={2} className="adminSectionHeader">
                                    <Box>
                                        <Typography variant="h5" sx={{fontWeight: 800}}>
                                            Управление товарами
                                        </Typography>
                                        <Typography sx={{color: "#8f94a3", mt: 0.7}}>
                                            Добавление, изменение и удаление товаров
                                        </Typography>
                                    </Box>

                                    <Button
                                            startIcon={<AddCircleOutlineOutlinedIcon />}
                                            sx={{py: 1.3, px: 2.5, borderRadius: "18px",
                                                bgcolor: "#2E4578", color: "white", fontWeight: 800,
                                                textTransform: "none", flexShrink: 0,
                                                "&:hover": {bgcolor: "#3c589f",},}}
                                    >
                                        Добавить товар
                                    </Button>
                                </Stack>

                                <Divider sx={{borderColor: "rgba(255,255,255,0.08)", my: 2.5}}/>

                                <div className="adminEmptyBlock">
                                    <Typography sx={{color: "white", fontWeight: 800, fontSize: "1.15rem"}}>
                                        Таблица товаров
                                    </Typography>
                                    <Typography sx={{color: "#8f94a3", mt: 1}}>
                                        Здесь позже будет список товаров с кнопками редактирования и удаления.
                                    </Typography>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="adminSideCard" sx={{bgcolor: "#151922", color: "white", borderRadius: "32px",
                            border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none",
                            height: "fit-content",}}>
                            <CardContent sx={{p: 3, "&:last-child": {pb: 3,},}}>
                                <Typography variant="h5" sx={{fontWeight: 800, mb: 1}}>
                                    Управление категориями
                                </Typography>

                                <Typography sx={{color: "#8f94a3", mb: 2}}>
                                    Добавление, изменение и удаление категорий товаров
                                </Typography>

                                <Button
                                        fullWidth
                                        startIcon={<AddCircleOutlineOutlinedIcon />}
                                        sx={{py: 1.3, borderRadius: "16px", bgcolor: "#2E4578",
                                            color: "white", fontWeight: 800, textTransform: "none",
                                            "&:hover": {bgcolor: "#3c589f",},}}
                                >
                                    Добавить категорию
                                </Button>

                                <Divider sx={{borderColor: "rgba(255,255,255,0.08)", my: 2.5}}/>

                                <Typography sx={{color: "white", fontWeight: 800, fontSize: "1.05rem"}}>
                                    Список категорий
                                </Typography>
                                <Typography sx={{color: "#8f94a3", mt: 1}}>
                                    Здесь позже будет список категорий с кнопками редактирования и удаления.
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card className="adminSideCard" sx={{bgcolor: "#151922", color: "white", borderRadius: "32px",
                            border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none",
                            height: "fit-content",}}>
                            <CardContent sx={{p: 3, "&:last-child": {pb: 3,},}}>
                                <Typography variant="h5" sx={{fontWeight: 800, mb: 2}}>
                                    Быстрые действия
                                </Typography>

                                <Stack spacing={1.5}>
                                    <Button fullWidth sx={{py: 1.3, borderRadius: "16px", bgcolor: "#252a35",
                                        color: "white", fontWeight: 800, textTransform: "none",
                                        "&:hover": {bgcolor: "#303644",},}}>
                                        Открыть заказы
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </div>
                </Box>
            </div>
    );
}

export default AdminPanel;