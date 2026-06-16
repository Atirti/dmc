import { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { getAdminAllOrders, getAdminOrders, getAdminUserIdByUsername, updateOrderStatus, ORDER_STATUSES } from "../../Controll/APIStuff/adminStuuf/orderApi.js";
import {getNormalErrorMessage} from "../../Controll/errorHandler.js";

function getTimezoneOffsetString() {
    const offsetMinutes = -new Date().getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const absoluteOffset = Math.abs(offsetMinutes);
    const hours = String(Math.floor(absoluteOffset / 60)).padStart(2, "0");
    const minutes = String(absoluteOffset % 60).padStart(2, "0");

    return `${sign}${hours}:${minutes}`;
}

function toDateTimeOffset(value) {
    if (!value) {
        return "";
    }

    if (/(Z|[+-]\d{2}:\d{2})$/.test(value)) {
        return value;
    }

    const [date, time = "00:00"] = value.split("T");
    const timeWithSeconds = time.length === 5 ? `${time}:00` : time;

    return `${date}T${timeWithSeconds}${getTimezoneOffsetString()}`;
}

function getOrderId(order) {
    return order.order_id ?? order.id;
}

function getOrderUserId(order) {
    return order.user_id ?? order.userId ?? order.user?.id;
}

function getOrderDate(order) {
    return order.created_at || order.createdAt || order.date || "";
}

function getOrderProducts(order) {
    if (Array.isArray(order.products)) {
        return order.products;
    }

    if (Array.isArray(order.items)) {
        return order.items;
    }

    return [];
}

function sortOrders(orders, sortBy, sortOrder) {
    return [...orders].sort((firstOrder, secondOrder) => {
        let firstValue = firstOrder[sortBy];
        let secondValue = secondOrder[sortBy];

        if (sortBy === "created_at") {
            firstValue = new Date(getOrderDate(firstOrder)).getTime() || 0;
            secondValue = new Date(getOrderDate(secondOrder)).getTime() || 0;
        }

        if (firstValue > secondValue) {
            return sortOrder === "asc" ? 1 : -1;
        }

        if (firstValue < secondValue) {
            return sortOrder === "asc" ? -1 : 1;
        }

    return 0;
    });
}

function getAdminOrderErrorMessage(error) {
    const message = getNormalErrorMessage(error);

    if (message.trim().toLowerCase() === "user not found") {
        return "Пользователь не найден";
    }

    return message;
}

function OrderList({ username = "", limit = 10, offset = 0, status = "", sortBy = "created_at",
                       sortOrder = "desc", createdAtFrom = "", createdAtTo = "" }) {
    const [orders, setOrders] = useState([]);
    const [currentUserId, setCurrentUserId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function loadOrders() {
        try {
            setIsLoading(true);
            setErrorMessage("");

            const normalizedUsername = username.trim();
            const normalizedLimit = Math.max(Number(limit) || 10, 1);
            const normalizedOffset = Math.max(Number(offset) || 0, 0);

            if (normalizedUsername) {
                const userId = await getAdminUserIdByUsername(normalizedUsername);
                const data = await getAdminOrders(userId);
                let filteredData = data;

                setCurrentUserId(userId);

                if (status) {
                    filteredData = filteredData.filter((order) => order.status === status);
                }

                filteredData = sortOrders(filteredData, sortBy, sortOrder);

                setOrders(filteredData.slice(normalizedOffset, normalizedOffset + normalizedLimit));
                return;
            }

            setCurrentUserId("");

            const data = await getAdminAllOrders({
                limit: normalizedLimit,
                offset: normalizedOffset,
                status,
                sortBy,
                sortOrder,
                createdAtFrom: toDateTimeOffset(createdAtFrom),
                createdAtTo: toDateTimeOffset(createdAtTo),
            });

            setOrders(data);
        } catch (error) {
            setCurrentUserId("");
            setOrders([]);
            setErrorMessage(getAdminOrderErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
    }, [username, limit, offset, status, sortBy, sortOrder, createdAtFrom, createdAtTo]);

    async function handleStatusChange(order, status) {
        const orderId = getOrderId(order);
        const userId = getOrderUserId(order);

        if (!orderId || !userId) {
            setErrorMessage("Не найден order_id или user_id заказа");
            return;
        }

        try {
            await updateOrderStatus({
                userId,
                orderId,
                status,
            });

            await loadOrders();
        } catch (error) {
            setErrorMessage(getAdminOrderErrorMessage(error));
        }
    }

    if (isLoading) {
        return (
                <Typography sx={{ color: "#8f94a3" }}>
                    Загрузка заказов...
                </Typography>
        );
    }

    if (errorMessage) {
        return (
                <Typography sx={{ color: "#ff6b6b" }}>
                    {errorMessage}
                </Typography>
        );
    }

    if (!orders.length) {
        return (
                <Typography sx={{ color: "#8f94a3" }}>
                    Заказы не найдены
                </Typography>
        );
    }

    return (
            <Box sx={{height: "620px", overflowY: "auto", pr: 1, minWidth: 0,
                scrollbarWidth: "thin",
                "&::-webkit-scrollbar": {width: "8px",},
                "&::-webkit-scrollbar-track": {bgcolor: "#151922", borderRadius: "8px",},
                "&::-webkit-scrollbar-thumb": {bgcolor: "#2E4578", borderRadius: "8px",},
                "&::-webkit-scrollbar-thumb:hover": {bgcolor: "#3c589f",},}}>
                <Stack spacing={2}>
                    {orders.map((order) => {
                        const orderId = getOrderId(order);
                        const orderUserId = getOrderUserId(order);
                        const products = getOrderProducts(order);

                        return (
                                <Card key={orderId} sx={{bgcolor: "#1d2230", color: "white", borderRadius: "20px",
                                    border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none",
                                    height: "300px", minHeight: "300px", maxHeight: "300px",
                                    width: "100%", overflow: "hidden", display: "flex", flexDirection: "column",}}>
                                    <CardContent sx={{height: "100%", overflow: "hidden", display: "flex",
                                        flexDirection: "column", boxSizing: "border-box",
                                        "&:last-child": { pb: 2 },}}>
                                        <Stack spacing={1} sx={{height: "100%", minHeight: 0}}>
                                            <Typography sx={{ fontWeight: 800, flexShrink: 0 }}>
                                                Заказ #{orderId}
                                            </Typography>

                                            <Typography sx={{ color: "#8f94a3", flexShrink: 0, overflow: "hidden",
                                                textOverflow: "ellipsis", whiteSpace: "nowrap",}}>
                                                username: {username || "не указан"} {currentUserId ? `(ID ${currentUserId})` : orderUserId ? `(ID ${orderUserId})` : ""}
                                            </Typography>

                                            <Typography sx={{ color: "#8f94a3", flexShrink: 0, overflow: "hidden",
                                                textOverflow: "ellipsis", whiteSpace: "nowrap",}}>
                                                Статус: {order.status}
                                            </Typography>

                                            <Typography sx={{ color: "#8f94a3", flexShrink: 0, overflow: "hidden",
                                                textOverflow: "ellipsis", whiteSpace: "nowrap",}}>
                                                Цена: {order.price ?? order.total_price ?? order.total}
                                            </Typography>

                                            <Typography sx={{ color: "#8f94a3", flexShrink: 0, overflow: "hidden",
                                                textOverflow: "ellipsis", whiteSpace: "nowrap",}}>
                                                Адрес: {order.address || "не указан"}
                                            </Typography>

                                            <Box sx={{flex: 1, minHeight: 0, overflowY: "auto", pr: 1,
                                                scrollbarWidth: "thin",
                                                "&::-webkit-scrollbar": {width: "6px",},
                                                "&::-webkit-scrollbar-track": {bgcolor: "#1d2230", borderRadius: "8px",},
                                                "&::-webkit-scrollbar-thumb": {bgcolor: "#2E4578", borderRadius: "8px",},}}>
                                                {products.map((product, index) => (
                                                        <Typography key={product.id ?? product.product_id ?? index}
                                                                    sx={{ color: "#8f94a3" }}>
                                                            {product.title || product.name || product.product_name ||
                                                                    `Товар ${index + 1}`} × {product.count ||
                                                                product.quantity || product.product_count || 1}
                                                        </Typography>
                                                ))}
                                            </Box>

                                            <Stack direction="row" spacing={1} sx={{pt: 1, flexShrink: 0,
                                                flexWrap: "wrap", rowGap: 1,}}>
                                                {ORDER_STATUSES.map((status) => (
                                                        <Button key={status} onClick={() => handleStatusChange(order, status)}
                                                                sx={{borderRadius: "14px", bgcolor: "#2E4578", color: "white",
                                                                    fontWeight: 800, textTransform: "none",
                                                                    "&:hover": { bgcolor: "#3c589f" },}}>
                                                            {status}
                                                        </Button>
                                                ))}
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>
                        );
                    })}
                </Stack>
            </Box>
    );
}

export default OrderList;
