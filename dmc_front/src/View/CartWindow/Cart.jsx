import { useEffect, useState } from "react";
import "./CartCSS.css";
import LeftPanel from "../LeftPanel/LeftPanel.jsx";
import {getCartRequest, changeCartCountRequest, deleteCartItemRequest,} from "../../Controll/APIStuff/get_put_Cart.js";
import { createOrderRequest } from "../../Controll/APIStuff/post_get_Orders.js";
import { useNavigate } from "react-router-dom";
import {Alert, Avatar, Box, Button, Card, CardContent, CircularProgress, Divider, IconButton, Stack, TextField, Typography,}
    from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import {DeleteOutlined} from "@mui/icons-material";

function Cart() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingItemId, setUpdatingItemId] = useState(null);
    const [address, setAddress] = useState("");
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);

    function sortCartItems(items) {
        return [...items].sort((a, b) => a.id - b.id);
    }

    useEffect(() => {
        async function loadCart() {
            try {
                setIsLoading(true);
                setError("");

                const data = await getCartRequest();
                setCartItems(sortCartItems(data));
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        }

        loadCart();
    }, []);

    async function changeCount(item, newCount) {
        if (newCount < 0) {
            return;
        }

        if (newCount > item.count_in_stock) {
            return;
        }

        try {
            setUpdatingItemId(item.id);
            setError("");

            const data = await changeCartCountRequest(item.id, newCount);
            setCartItems(sortCartItems(data));
        } catch (error) {
            setError(error.message);
        } finally {
            setUpdatingItemId(null);
        }
    }

    function increaseCount(item) {
        changeCount(item, item.count_in_cart + 1);
    }

    function decreaseCount(item) {
        changeCount(item, item.count_in_cart - 1);
    }

    async function removeItem(item) {
        try {
            setUpdatingItemId(item.id);
            setError("");

            const data = await deleteCartItemRequest(item.id);
            setCartItems(sortCartItems(data));
        } catch (error) {
            setError(error.message);
        } finally {
            setUpdatingItemId(null);
        }
    }

    async function goToOrder() {
        if (!address.trim()) {
            setError("Введите адрес доставки");
            return;
        }

        if (cartItems.length === 0) {
            setError("Корзина пуста");
            return;
        }

        try {
            setIsCreatingOrder(true);
            setError("");

            const products = cartItems.map((item) => ({
                product_id: Number(item.id),
                product_count: Number(item.count_in_cart),
            }));

            const createdOrder = await createOrderRequest(address.trim(), products);

            navigate("/order", {
                state: {
                    order: createdOrder,
                },
            });
        } catch (error) {
            setError(error.message || "Ошибка оформления заказа");
        } finally {
            setIsCreatingOrder(false);
        }
    }

    const totalPrice = cartItems.reduce((sum, item) => {
        return sum + item.price * item.count_in_cart;
    }, 0);

    const totalProductsCount = cartItems.reduce((sum, item) => {
        return sum + item.count_in_cart;
    }, 0);

    return (
            <div className="cartPage">
                <LeftPanel />

                <Box className="cartWindow">
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                        <Box sx={{width: 64, height: 64, borderRadius: "50%", bgcolor: "#12141b", color: "#2E4578",
                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,}}>
                            <ShoppingCartOutlinedIcon sx={{ fontSize: 34 }} />
                        </Box>

                        <Box>
                            <Typography variant="h4" sx={{color: "white", fontWeight: 800, lineHeight: 1.1,}}>
                                Корзина
                            </Typography>
                            <Typography sx={{color: "#8f94a3", mt: 0.7, fontSize: "1.05rem",}}>
                                Товары для оформления заказа
                            </Typography>
                        </Box>
                    </Stack>

                    {isLoading && (
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <CircularProgress size={26} sx={{ color: "#2E4578" }} />
                                <Typography sx={{ color: "white" }}>Загрузка корзины...</Typography>
                            </Stack>
                    )}

                    {error && (
                            <Alert severity="error" sx={{mb: 3, bgcolor: "#2a1115", color: "#ffb4b4", borderRadius: "16px",
                                border: "1px solid rgba(255, 107, 107, 0.25)", "& .MuiAlert-icon": {color: "#ff6b6b",},}}>
                                {error}
                            </Alert>
                    )}

                    {!isLoading && cartItems.length === 0 && (
                            <Card sx={{bgcolor: "#151922", color: "white", borderRadius: "32px",
                                        border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none",}}>
                                <CardContent sx={{ p: 4 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Корзина пуста</Typography>
                                    <Typography sx={{ color: "#8f94a3", mt: 1 }}>
                                        Добавьте товары, чтобы оформить заказ.
                                    </Typography>
                                </CardContent>
                            </Card>
                    )}

                    {!isLoading && cartItems.length > 0 && (
                            <Box className="cartContent">
                                <Stack className="cartItems" spacing={2.5}>
                                    {cartItems.map((item) => {
                                        const isUpdating = updatingItemId === item.id;
                                        const itemTotal = item.price * item.count_in_cart;

                                        return (
                                                <Card key={item.id} sx={{bgcolor: "#151922", color: "white", borderRadius: "30px",
                                                            border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none",
                                                            overflow: "hidden",}}>
                                                    <CardContent sx={{p: 2.5, "&:last-child": {pb: 2.5,},}}>
                                                        <Stack direction="row" alignItems="center" spacing={2}>
                                                            <Avatar src={item.picture_url} alt={item.title} variant="rounded"
                                                                    sx={{width: 96, height: 96, borderRadius: "22px",
                                                                        bgcolor: "#252a35", flexShrink: 0,}}/>
                                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                                <Typography noWrap sx={{color: "white", fontSize: "1.1rem",
                                                                            fontWeight: 800,}}>{item.title}</Typography>
                                                                <Typography sx={{color: "#2E4578", fontSize: "1.05rem",
                                                                            fontWeight: 800, mt: 0.7,}}>
                                                                    {item.price} ₽
                                                                </Typography>
                                                                <Typography sx={{color: "#8f94a3", fontSize: "0.95rem",
                                                                            mt: 0.5,}}>
                                                                    В наличии: {item.count_in_stock}
                                                                </Typography>
                                                            </Box>

                                                            <Stack direction="row" alignItems="center" spacing={1}
                                                                    sx={{bgcolor: "#252a35", borderRadius: "18px",
                                                                        px: 1, py: 0.7, height: "45px", flexShrink: 0,}}>

                                                                <IconButton
                                                                        disabled={isUpdating || item.count_in_cart <= 0}
                                                                        onClick={() => decreaseCount(item)}
                                                                        sx={{width: 34, height: 34, color: "white",
                                                                            bgcolor: "#151922", "&:hover": {
                                                                                bgcolor: "#2e4477",
                                                                            }, "&.Mui-disabled": {color: "#555",},
                                                                        }}
                                                                >
                                                                    <RemoveIcon fontSize="small" />
                                                                </IconButton>

                                                                <Typography sx={{minWidth: 24, textAlign: "center",
                                                                            fontWeight: 800, color: "white",}}>
                                                                    {item.count_in_cart}
                                                                </Typography>

                                                                <IconButton disabled={isUpdating ||item.count_in_cart >=
                                                                                item.count_in_stock}
                                                                        onClick={() => increaseCount(item)}
                                                                        sx={{width: 34, height: 34, color: "white",
                                                                            bgcolor: "#151922", "&:hover": {bgcolor: "#2e4477",
                                                                            }, "&.Mui-disabled": {color: "#555",},
                                                                        }}>
                                                                    <AddIcon fontSize="small" />
                                                                </IconButton>
                                                            </Stack>

                                                            <Box sx={{minWidth: 100, textAlign: "right",
                                                                        flexShrink: 0, height: "50px"}}>
                                                                <Typography sx={{color: "#2E4578", fontWeight: 800,
                                                                    fontSize: "1.1rem", whiteSpace: "nowrap",}}>
                                                                    {itemTotal} ₽
                                                                </Typography>

                                                                <IconButton disabled={isUpdating} onClick={() => removeItem(item)}
                                                                        sx={{width: 34, height: 34, color: "#2E4578",background:"#2E4578"}}>
                                                                    <DeleteOutlined/>
                                                                </IconButton>
                                                            </Box>
                                                        </Stack>
                                                    </CardContent>
                                                </Card>
                                        );
                                    })}
                                </Stack>

                                <Card className="cartSummary" sx={{bgcolor: "#151922", color: "white", borderRadius: "32px",
                                            border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none",
                                            height: "fit-content", position: "sticky", top: 120,}}>
                                    <CardContent sx={{p: 3, "&:last-child": {pb: 3,},}}>
                                        <Typography variant="h5" sx={{fontWeight: 800, mb: 2.5,}}>Итого</Typography>
                                        <Stack spacing={1.5}>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography sx={{ color: "#8f94a3" ,paddingRight: "5px" }}>Позиции:</Typography>
                                                <Typography sx={{ fontWeight: 700 }}>{cartItems.length}</Typography>
                                            </Stack>

                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography sx={{ color: "#8f94a3",paddingRight: "5px"  }}>Товары:</Typography>
                                                <Typography sx={{ fontWeight: 700 }}>{totalProductsCount}</Typography>
                                            </Stack>

                                            <Divider sx={{borderColor: "rgba(255,255,255,0.08)",}}/>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography sx={{ color: "#8f94a3",paddingRight: "5px" }}>Сумма: </Typography>
                                                <Typography sx={{color: "#b276ff", fontWeight: 800, fontSize: "1.3rem",}}>
                                                     {totalPrice} ₽
                                                </Typography>
                                            </Stack>
                                        </Stack>

                                        <Stack direction="row" alignItems="flex-start" spacing={1.5}
                                                sx={{bgcolor: "#252a35", borderRadius: "20px", px: 2, py: 1.5, mt: 3,}}>
                                            <LocationOnOutlinedIcon
                                                    sx={{color: "#2E4578", fontSize: 28, mt: 1.1, flexShrink: 0,}}
                                            />

                                            <TextField value={address} onChange={(event) => setAddress(event.target.value)}
                                                    placeholder="Введите адрес доставки" multiline
                                                    rows={3} fullWidth variant="standard"
                                                    InputProps={{disableUnderline: true,}}
                                                    sx={{textarea: {color: "white",}, input: {color: "white",},
                                                        "& .MuiInputBase-input::placeholder": {color: "#8f94a3", opacity: 1,},
                                                    }}
                                            />
                                        </Stack>

                                        <Button
                                                fullWidth
                                                disabled={isCreatingOrder || !address.trim()}
                                                onClick={goToOrder}
                                                sx={{mt: 3, py: 1.5, borderRadius: "18px",
                                                    bgcolor: "#2E4578", color: "white", fontWeight: 800, fontSize: "1rem",
                                                    textTransform: "none", "&:hover": {bgcolor: "#3c589f",},
                                                    "&.Mui-disabled": {bgcolor: "#2b2f3a", color: "#777",},
                                                }}
                                        >
                                            {isCreatingOrder ? "Оформление..." : "Оформить и оплатить"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Box>
                    )}
                </Box>
            </div>
    );
}

export default Cart;