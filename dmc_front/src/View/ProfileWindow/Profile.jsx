import { useEffect, useState } from "react";
import LeftPanel from "../LeftPanel/LeftPanel.jsx";
import "./ProfileCSS.css";
import { useAuth } from "../../Controll/APIStuff/Autentification/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { getCurrentUsername } from "../../Controll/APIStuff/Autentification/auth.js";
import { getUserOrdersRequest } from "../../Controll/APIStuff/Client/post_get_Orders.js";
import {Alert, Box, Button, Card, CardContent, CircularProgress, Divider, Stack, Typography}
    from "@mui/material";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import BackButton from "../BackButton.jsx";
import {getNormalErrorMessage} from "../../Controll/errorHandler.js";

function Profile() {
    const navigate = useNavigate();
    const { logout,logoutEverywhere } = useAuth();

    const [username, setUsername] = useState("Пользователь");
    const [orders, setOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [ordersError, setOrdersError] = useState("");

    function getText(value, fallback = "") {
        if (typeof value === "string") {
            return value;
        }

        if (typeof value === "number") {
            return String(value);
        }

        return fallback;
    }

    function getNumber(value) {
        const number = Number(value);
        return Number.isFinite(number) ? number : 0;
    }

    function getItemCount(item) {
        return getNumber(item?.count ?? item?.count_in_cart ?? item?.product_count);
    }

    function getStatusText(status) {
        if (status === "paid") {
            return "Оплачен";
        }

        return getText(status, "Неизвестно");
    }

    function normalizeOrders(data) {
        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.orders)) {
            return data.orders;
        }

        return [];
    }

    useEffect(() => {
        async function loadProfile() {
            try {
                setUsername(getCurrentUsername());
                setIsLoadingOrders(true);
                setOrdersError("");

                const data = await getUserOrdersRequest();
                setOrders(normalizeOrders(data));
            } catch (error) {
                setError(getNormalErrorMessage(error));
            } finally {
                setIsLoadingOrders(false);
            }
        }

        loadProfile();
    }, []);

    async function handleLogout() {
        try {
            await logout();
            navigate("/home");
        } catch (error) {
            alert(error.message);
            navigate("/home", { replace: true });
        }
    }
    async function handleLogoutFromEverywhere() {
        try {
            await logoutEverywhere();
            navigate("/home", { replace: true });
        } catch (error) {
            alert(error.message);
            navigate("/home", { replace: true });
        }
    }

    return (
            <div className="Profile">
                <LeftPanel />

                <Box component="main" className="profilePage">
                    <Card className="profileHeaderCard" sx={{bgcolor: "#151922", color: "white", borderRadius: "32px",
                        border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none",}}>
                        <CardContent sx={{p: 3, "&:last-child": {pb: 3,},}}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}
                                   className="profilePageHeader">
                                <Stack direction="row" alignItems="center" spacing={2.5} className="profileUserBlock">
                                    <Box sx={{width: 76, height: 76, borderRadius: "50%", bgcolor: "#12141b",
                                        color: "#2E4578", display: "flex", alignItems: "center",
                                        justifyContent: "center", flexShrink: 0,}}>
                                        <AccountCircleOutlinedIcon sx={{ fontSize: 50 }} />
                                    </Box>

                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography variant="h4" className="profileUsername"
                                                    sx={{color: "white", fontWeight: 800, lineHeight: 1.1,}}>
                                            {username}
                                        </Typography>

                                        <Typography sx={{color: "#8f94a3", mt: 0.7, fontSize: "1.05rem",}}>
                                            Личный кабинет
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Button onClick={handleLogout} endIcon={<LogoutOutlinedIcon />} className="Exit"
                                        sx={{py: 1.4, px: 3, borderRadius: "18px",
                                            bgcolor: "#2E4578", color: "white", fontWeight: 800, fontSize: "1rem",
                                            textTransform: "none", flexShrink: 0, "&:hover": {bgcolor: "#3c589f",},}}>
                                    Выход
                                </Button>
                                <Button onClick={handleLogoutFromEverywhere} endIcon={<LogoutOutlinedIcon />} className="Exit"
                                        sx={{py: 1.4, px: 3, borderRadius: "18px",
                                            bgcolor: "#2E4578", color: "white", fontWeight: 800, fontSize: "1rem",
                                            textTransform: "none", flexShrink: 0, "&:hover": {bgcolor: "#3c589f",},}}>
                                    Выход со всех устройств
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Box className="profilePageOrders">
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box sx={{width: 64, height: 64, borderRadius: "50%", bgcolor: "#171717",
                                    color: "#2E4578", display: "flex", alignItems: "center",
                                    justifyContent: "center", flexShrink: 0,}}>
                                    <BackButton sx={{ fontSize: 34 }} />
                                </Box>

                                <Box>
                                    <Typography variant="h4" sx={{color: "white", fontWeight: 800, lineHeight: 1.1,}}>
                                        Мои заказы
                                    </Typography>
                                    <Typography variant="body1" sx={{color: "#8f94a3", mt: 0.8, fontSize: "1.1rem",}}>
                                        История покупок
                                    </Typography>
                                </Box>
                            </Stack>
                        </Stack>

                        {isLoadingOrders && (
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <CircularProgress size={26} sx={{ color: "#2E4578" }} />
                                    <Typography sx={{ color: "white", fontSize: "1.1rem" }}>
                                        Загрузка заказов...
                                    </Typography>
                                </Stack>
                        )}

                        {ordersError && (
                                <Alert severity="error" sx={{mb: 3, bgcolor: "#2a1115", color: "#ffb4b4",
                                    borderRadius: "16px", border: "1px solid rgba(255, 107, 107, 0.25)",
                                    "& .MuiAlert-icon": {color: "#ff6b6b",},}}>
                                    {ordersError}
                                </Alert>
                        )}

                        {!isLoadingOrders && !ordersError && orders.length === 0 && (
                                <Card sx={{bgcolor: "#151922", color: "white", borderRadius: "32px",
                                    border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none",}}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                            У вас пока нет заказов
                                        </Typography>
                                        <Typography sx={{ color: "#8f94a3", mt: 1 }}>
                                            Оформленные заказы будут отображаться здесь.
                                        </Typography>
                                    </CardContent>
                                </Card>
                        )}

                        {!isLoadingOrders && !ordersError && orders.length > 0 && (
                                <Stack className="profileOrdersList" spacing={2.5}>
                                    {orders.map((order) => {
                                        const orderId = getText(order?.id, "—");
                                        const orderStatus = getStatusText(order?.status);
                                        const orderAddress = getText(order?.address, "Адрес не указан");
                                        const orderPrice = getNumber(order?.price);
                                        const products = Array.isArray(order?.products) ? order.products : [];

                                        return (
                                                <Card key={orderId} className="profileOrderCard" sx={{bgcolor: "#151922",
                                                    color: "white", borderRadius: "30px",
                                                    border: "1px solid rgba(255, 255, 255, 0.06)",
                                                    boxShadow: "none", overflow: "hidden",}}>
                                                    <CardContent sx={{p: 3, "&:last-child": {pb: 3,},}}>
                                                        <Stack direction="row" justifyContent="space-between"
                                                               alignItems="flex-start" spacing={2}
                                                               className="profileOrderTop">
                                                            <Box sx={{ minWidth: 0 }}>
                                                                <Typography variant="h5"
                                                                            sx={{color: "white", fontWeight: 800,
                                                                                lineHeight: 1.2,}}>
                                                                    Заказ №{orderId}
                                                                </Typography>

                                                                <Typography sx={{color: "#2E4578", fontSize: "1.05rem",
                                                                    fontWeight: 800, mt: 0.6,}}>
                                                                    {orderStatus}
                                                                </Typography>
                                                            </Box>

                                                            <Typography variant="h5"
                                                                        sx={{color: "#2e4477", fontWeight: 800,
                                                                            whiteSpace: "nowrap",}}>Стоимость: {orderPrice} ₽
                                                            </Typography>
                                                        </Stack>

                                                        <Stack spacing={1.5} sx={{ mt: 3 }}>
                                                            {products.length > 0 ? (
                                                                    products.map((product, index) => {
                                                                        const productId = getText(product?.id, `product-${index}`);
                                                                        const title = getText(product?.title, "Без названия");
                                                                        const count = getItemCount(product);

                                                                        return (
                                                                                <Stack key={productId} direction="row"
                                                                                       justifyContent="space-between"
                                                                                       alignItems="center" spacing={2}
                                                                                       className="profileOrderProduct">
                                                                                    <Typography sx={{color: "white",
                                                                                        fontSize: "1.05rem",
                                                                                        overflow: "hidden",
                                                                                        textOverflow: "ellipsis",
                                                                                        whiteSpace: "nowrap",}}>
                                                                                        {title}
                                                                                    </Typography>

                                                                                    <Typography sx={{color: "white",
                                                                                        fontSize: "1.05rem",
                                                                                        fontWeight: 800,
                                                                                        whiteSpace: "nowrap",}}>
                                                                                        ×{count}
                                                                                    </Typography>
                                                                                </Stack>
                                                                        );
                                                                    })
                                                            ) : (
                                                                    <Typography sx={{ color: "#a2a7b4" }}>
                                                                        Товары не указаны
                                                                    </Typography>
                                                            )}
                                                        </Stack>

                                                        <Divider sx={{borderColor: "rgba(255, 255, 255, 0.06)", my: 2.2,}}/>

                                                        <Stack direction="row" alignItems="center" spacing={1.5}
                                                               sx={{bgcolor: "#252a35", borderRadius: "20px",
                                                                   px: 2.5, py: 1.8,}}>
                                                            <LocationOnOutlinedIcon sx={{color: "#2E4578", fontSize: 28,
                                                                flexShrink: 0,}}/>
                                                            <Typography sx={{color: "white", fontSize: "1.05rem",
                                                                overflow: "hidden", textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap",}}>
                                                                Адрес доставки: {orderAddress}
                                                            </Typography>
                                                        </Stack>

                                                        <Button
                                                                fullWidth
                                                                onClick={() => navigate("/order", {state: {order: order}})}
                                                                endIcon={<OpenInNewOutlinedIcon />}
                                                                sx={{mt: 2.2, py: 1.4, borderRadius: "18px",
                                                                    bgcolor: "#2E4578", color: "white", fontWeight: 800,
                                                                    fontSize: "1rem", textTransform: "none",
                                                                    "&:hover": {bgcolor: "#3c589f",},}}
                                                        >
                                                            Открыть заказ
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                        );
                                    })}
                                </Stack>
                        )}
                    </Box>
                </Box>
            </div>
    );
}

export default Profile;