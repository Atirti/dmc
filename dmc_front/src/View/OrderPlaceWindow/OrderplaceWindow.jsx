import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./OrderplaceWindowCSS.css";
import LeftPanel from "../LeftPanel/LeftPanel.jsx";
import {Alert, Avatar, Box, Button, Card, CardContent, CircularProgress, Divider, Stack, Typography,}
    from "@mui/material";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import BackButton from "../BackButton.jsx";

function OrderplaceWindow() {
    const location = useLocation();
    const navigate = useNavigate();

    const [orderId, setOrderId] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [address, setAddress] = useState("");
    const [orderStatus, setOrderStatus] = useState("");
    const [orderPrice, setOrderPrice] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

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
        return getNumber(item?.count_in_cart ?? item?.count ?? item?.product_count);
    }

    function sortOrderItems(items) {
        return [...items].sort((a, b) => {
            return getNumber(a?.id) - getNumber(b?.id);
        });
    }

    function getReadableStatus(status) {
        if (status === "paid") {
            return "Оплачен";
        }

        return getText(status, "Неизвестно");
    }

    useEffect(() => {
        const createdOrder = location.state?.order;

        if (!createdOrder) {
            setError("Информация о заказе не найдена. Вернитесь в корзину и оформите заказ заново.");
            setIsLoading(false);
            return;
        }

        setOrderId(createdOrder.id);
        setAddress(getText(createdOrder.address, ""));
        setOrderStatus(getReadableStatus(createdOrder.status));
        setOrderPrice(getNumber(createdOrder.price));

        if (Array.isArray(createdOrder.products)) {
            setOrderItems(sortOrderItems(createdOrder.products));
        } else {
            setOrderItems([]);
        }

        setIsLoading(false);
    }, [location.state]);

    const totalPrice = orderPrice || orderItems.reduce((sum, item) => {
        const price = getNumber(item?.price);
        const count = getItemCount(item);

        return sum + price * count;
    }, 0);

    const totalProductsCount = orderItems.reduce((sum, item) => {
        return sum + getItemCount(item);
    }, 0);

    return (
            <div className="orderPage">
                <LeftPanel />

                <Box className="orderWindow">
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                        <Box sx={{width: 64, height: 64, borderRadius: "50%", bgcolor: "#12141b", color: "#2E4578",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,}}>
                            <BackButton sx={{ fontSize: 34 }} />
                        </Box>

                        <Box>
                            <Typography variant="h4" sx={{color: "white", fontWeight: 800, lineHeight: 1.1,}}>
                                Информация о заказе
                            </Typography>
                            <Typography sx={{color: "#8f94a3", mt: 0.7, fontSize: "1.05rem",}}>
                                Детали оформленного заказа
                            </Typography>
                        </Box>
                    </Stack>

                    {isLoading && (
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <CircularProgress size={26} sx={{ color: "#2E4578" }} />
                                <Typography sx={{ color: "white" }}>Загрузка заказа...</Typography>
                            </Stack>
                    )}

                    {error && (
                            <Alert severity="error" sx={{mb: 3, bgcolor: "#2a1115", color: "#ffb4b4", borderRadius: "16px",
                                border: "1px solid rgba(255, 107, 107, 0.25)", "& .MuiAlert-icon": {color: "#ff6b6b",},}}>
                                {error}
                            </Alert>
                    )}

                    {!isLoading && !error && orderItems.length === 0 && (
                            <Card sx={{bgcolor: "#151922", color: "white", borderRadius: "32px",
                                border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none",}}>
                                <CardContent sx={{ p: 4 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>В заказе нет товаров</Typography>
                                    <Typography sx={{ color: "#8f94a3", mt: 1 }}>
                                        Вернитесь в корзину и оформите заказ заново.
                                    </Typography>
                                </CardContent>
                            </Card>
                    )}

                    {!isLoading && !error && orderItems.length > 0 && (
                            <Box className="orderContent">
                                <Stack className="orderItems" spacing={2.5}>
                                    {orderItems.map((item, index) => {
                                        const id = getText(item?.id, `item-${index}`);
                                        const title = getText(item?.title, "Без названия");
                                        const pictureUrl = getText(item?.picture_url, "");
                                        const price = getNumber(item?.price);
                                        const count = getItemCount(item);
                                        const itemTotal = price * count;

                                        return (
                                                <Card key={id} sx={{bgcolor: "#151922", color: "white", borderRadius: "30px",
                                                    border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none",
                                                    overflow: "hidden",}}>
                                                    <CardContent sx={{p: 2.5, "&:last-child": {pb: 2.5,},}}>
                                                        <Stack direction="row" alignItems="center" spacing={2}>
                                                            <Avatar src={pictureUrl} alt={title} variant="rounded"
                                                                    sx={{width: 96, height: 96, borderRadius: "22px",
                                                                        bgcolor: "#252a35", flexShrink: 0,}}/>

                                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                                <Typography noWrap sx={{color: "white", fontSize: "1.1rem",
                                                                    fontWeight: 800,}}>{title}</Typography>
                                                                <Typography sx={{color: "#6690ff", fontSize: "1.05rem",
                                                                    fontWeight: 800, mt: 0.7,}}>
                                                                    {price} ₽
                                                                </Typography>
                                                                <Typography sx={{color: "#8f94a3", fontSize: "0.95rem",
                                                                    mt: 0.5,}}>
                                                                    Количество: {count}
                                                                </Typography>
                                                            </Box>

                                                            <Box sx={{minWidth: 100, textAlign: "right",
                                                                flexShrink: 0,}}>
                                                                <Typography sx={{color: "#6690ff", fontWeight: 800,
                                                                    fontSize: "1.1rem", whiteSpace: "nowrap",}}>
                                                                    {itemTotal} ₽
                                                                </Typography>
                                                            </Box>
                                                        </Stack>
                                                    </CardContent>
                                                </Card>
                                        );
                                    })}
                                </Stack>

                                <Card className="orderSummary" sx={{bgcolor: "#151922", color: "white", borderRadius: "32px",
                                    border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none",
                                    height: "fit-content", position: "sticky", top: 120,}}>
                                    <CardContent sx={{p: 3, "&:last-child": {pb: 3,},}}>
                                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                                            <CheckCircleOutlineOutlinedIcon sx={{ color: "#6690ff", fontSize: 30 }} />
                                            <Typography variant="h5" sx={{fontWeight: 800,}}>Заказ</Typography>
                                        </Stack>

                                        <Stack spacing={1.5}>
                                            <Stack direction="row" justifyContent="space-between" spacing={2}>
                                                <Typography sx={{ color: "#8f94a3", paddingRight: "5px" }}>Номер:</Typography>
                                                <Typography sx={{ fontWeight: 700, textAlign: "right" }}>{orderId}</Typography>
                                            </Stack>

                                            <Stack direction="row" justifyContent="space-between" spacing={2}>
                                                <Typography sx={{ color: "#8f94a3", paddingRight: "5px" }}>Статус:</Typography>
                                                <Typography sx={{ color: "#6690ff", fontWeight: 800, textAlign: "right" }}>
                                                    {orderStatus}
                                                </Typography>
                                            </Stack>

                                            <Stack direction="row" justifyContent="space-between" spacing={2}>
                                                <Typography sx={{ color: "#8f94a3", paddingRight: "5px" }}>Адрес:</Typography>
                                                <Typography sx={{ fontWeight: 700, textAlign: "right", wordBreak: "break-word" }}>
                                                    {address}
                                                </Typography>
                                            </Stack>

                                            <Divider sx={{borderColor: "rgba(255,255,255,0.08)",}}/>

                                            <Stack direction="row" justifyContent="space-between" spacing={2}>
                                                <Typography sx={{ color: "#8f94a3", paddingRight: "5px" }}>Позиции:</Typography>
                                                <Typography sx={{ fontWeight: 700 }}>{orderItems.length}</Typography>
                                            </Stack>

                                            <Stack direction="row" justifyContent="space-between" spacing={2}>
                                                <Typography sx={{ color: "#8f94a3", paddingRight: "5px" }}>Товары:</Typography>
                                                <Typography sx={{ fontWeight: 700 }}>{totalProductsCount}</Typography>
                                            </Stack>

                                            <Divider sx={{borderColor: "rgba(255,255,255,0.08)",}}/>

                                            <Stack direction="row" justifyContent="space-between" spacing={2}>
                                                <Typography sx={{ color: "#8f94a3", paddingRight: "5px" }}>Сумма:</Typography>
                                                <Typography sx={{color: "#6690ff", fontWeight: 800, fontSize: "1.3rem",
                                                    whiteSpace: "nowrap",}}>
                                                    {totalPrice} ₽
                                                </Typography>
                                            </Stack>
                                        </Stack>

                                        <Button fullWidth disabled
                                                sx={{mt: 3, py: 1.5, borderRadius: "18px",
                                                    bgcolor: "#2b2f3a", color: "#777", fontWeight: 800, fontSize: "1rem",
                                                    textTransform: "none", "&.Mui-disabled": {bgcolor: "#2b2f3a", color: "#777",},
                                                }}>
                                            Оплачено
                                        </Button>

                                        <Button fullWidth onClick={() => navigate("/home")} startIcon={<HomeOutlinedIcon />}
                                                sx={{mt: 1.5, py: 1.5, borderRadius: "18px",
                                                    bgcolor: "#2E4578", color: "white", fontWeight: 800, fontSize: "1rem",
                                                    textTransform: "none", "&:hover": {bgcolor: "#3c589f",},
                                                }}>
                                            Вернуться на главную
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Box>
                    )}
                </Box>
            </div>
    );
}

export default OrderplaceWindow;