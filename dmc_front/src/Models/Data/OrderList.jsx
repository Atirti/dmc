import { useEffect, useMemo, useState } from "react";
import {Alert, Box, Button, CircularProgress, Divider, MenuItem, Pagination, Select, Stack, Typography,} from "@mui/material";
import {getAdminOrders, updateOrderStatus,} from "../../Controll/APIStuff/adminStuuf/orderApi.js";

const ORDER_STATUSES = [
    "paid",
    "in delivery",
    "delivered",
];

function OrderList({ userId, reloadKey = 0 }) {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorText, setErrorText] = useState("");
    const [page, setPage] = useState(1);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);
    const ordersPerPage = 5;
    const pageCount = Math.ceil(orders.length / ordersPerPage);

    const visibleOrders = useMemo(() => {
        const startIndex = (page - 1) * ordersPerPage;
        const endIndex = startIndex + ordersPerPage;
        return orders.slice(startIndex, endIndex);
    }, [orders, page]);

    async function loadOrders() {
        if (!userId) {
            setErrorText("Не найден user_id для загрузки заказов");
            return;
        }

        try {
            setIsLoading(true);
            setErrorText("");

            const loadedOrders = await getAdminOrders(userId);

            setOrders(loadedOrders);
            setPage(1);
        } catch (error) {
            console.log(error);
            setErrorText(error.message || "Не удалось загрузить заказы");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleChangeStatus(order, newStatus) {
        const orderId = order.order_id ?? order.id;

        if (!orderId) {
            setErrorText("Не найден order_id заказа");
            return;
        }

        try {
            setUpdatingOrderId(orderId);
            setErrorText("");

            await updateOrderStatus({
                userId,
                orderId,
                status: newStatus,
            });

            setOrders((prevOrders) =>
                    prevOrders.map((currentOrder) => {
                        const currentOrderId = currentOrder.order_id ?? currentOrder.id;

                        if (currentOrderId !== orderId) {return currentOrder;}
                        return {...currentOrder, status: newStatus,};
                    })
            );
        } catch (error) {
            console.log(error);
            setErrorText(error.message || "Не удалось изменить статус заказа");
        } finally {
            setUpdatingOrderId(null);
        }
    }

    useEffect(() => {
        loadOrders();
    }, [userId, reloadKey]);

    if (isLoading) {
        return (
                <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}><CircularProgress /></Box>
        );
    }

    return (
            <Box>{errorText && (<Alert severity="error" sx={{ mb: 2 }}>{errorText}</Alert>)}
                {orders.length === 0 ? (
                        <Typography sx={{ color: "#8f94a3" }}>Заказов пока нет</Typography>
                ) : (
                        <Stack spacing={2}>
                            {visibleOrders.map((order) => {
                                const orderId = order.order_id ?? order.id;
                                const orderUserId = order.user_id ?? userId;
                                const isUpdating = updatingOrderId === orderId;

                                return (
                                        <Box key={orderId} sx={{p: 2, borderRadius: "20px", bgcolor: "#1d2230",
                                                    border: "1px solid rgba(255,255,255,0.08)",}}>
                                            <Stack direction="row" spacing={2}>
                                                <Box>
                                                    <Typography sx={{ color: "white", fontWeight: 800 }}>
                                                        Заказ #{orderId}
                                                    </Typography>
                                                    <Typography sx={{ color: "#8f94a3", mt: 0.4 }}>
                                                        Пользователь: {orderUserId}
                                                    </Typography>
                                                    {order.created_at && (
                                                            <Typography sx={{ color: "#8f94a3" }}>
                                                                Дата: {new Date(order.created_at).toLocaleString()}
                                                            </Typography>)}

                                                    {(order.total_price || order.total || order.price) && (
                                                            <Typography sx={{ color: "#8f94a3" }}>
                                                                Сумма: {order.total_price || order.total || order.price}
                                                            </Typography>)}
                                                </Box>
                                                <Select size="small" value={order.status || ""} disabled={isUpdating}
                                                        onChange={(event) => handleChangeStatus(order, event.target.value)}
                                                        displayEmpty
                                                        sx={{minWidth: 170, bgcolor: "#151922", color: "white",
                                                            borderRadius: "14px", ".MuiOutlinedInput-notchedOutline": {
                                                                borderColor: "rgba(255,255,255,0.14)",},
                                                            ".MuiSvgIcon-root": {color: "white",},
                                                        }}>
                                                    <MenuItem value="" disabled>Статус</MenuItem>
                                                    {ORDER_STATUSES.map((status) => (
                                                            <MenuItem key={status} value={status}>{status}</MenuItem>))}
                                                </Select>
                                            </Stack>

                                            {order.items && order.items.length > 0 && (
                                                    <>
                                                        <Divider sx={{borderColor: "rgba(255,255,255,0.08)", my: 1.5,}}/>
                                                        <Stack spacing={0.7}>
                                                            {order.items.map((item, index) => (
                                                                    <Typography key={index}
                                                                            sx={{color: "#c7cad3", fontSize: "0.95rem",}}>
                                                                        {item.name || item.product_name || item.title ||
                                                                                `Товар ${index + 1}`}
                                                                        {item.quantity ? ` × ${item.quantity}` : ""}
                                                                    </Typography>
                                                            ))}
                                                        </Stack>
                                                    </>
                                            )}

                                            {isUpdating && (<Typography sx={{ color: "#8f94a3", mt: 1 }}>
                                                        Обновление статуса...
                                                    </Typography>
                                            )}
                                        </Box>
                                );
                            })}

                            {pageCount > 1 && (
                                    <Stack direction="row"sx={{ pt: 1 }}>
                                        <Pagination count={pageCount} page={page}
                                                onChange={(_, value) => setPage(value)}
                                                sx={{".MuiPaginationItem-root": {color: "white", borderColor: "rgba(255,255,255,0.16)",},
                                                    ".Mui-selected": {bgcolor: "#2E4578 !important",},}}
                                        />
                                    </Stack>
                            )}
                        </Stack>
                )}

                <Button fullWidth onClick={loadOrders}
                        sx={{mt: 2, py: 1.2, borderRadius: "16px", bgcolor: "#252a35", color: "white", fontWeight: 800,
                            textTransform: "none", "&:hover": { bgcolor: "#303644" },}}>
                    Обновить заказы
                </Button>
            </Box>
    );
}

export default OrderList;