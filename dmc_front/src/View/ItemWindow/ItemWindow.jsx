import "./ItemWindowCSS.css";
import LeftPanel from "../LeftPanel/LeftPanel.jsx";
import { useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import { addItemToCartRequest} from "../../Controll/APIStuff/Client/get_put_Cart.js";
import {useAuth} from "../../Controll/APIStuff/Autentification/AuthContext.jsx";
import {Alert, Box, Button, Card, CardContent, CircularProgress, Stack, Typography,}
    from "@mui/material";
import {AddShoppingCartOutlined, ArrowBackOutlined, Inventory2Outlined, ShoppingCartOutlined,} from "@mui/icons-material";

function ExpandableText({ text, limit, className, as: Tag = "div" }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!text) {
        return null;
    }

    const shouldCut = text.length > limit;
    const visibleText = shouldCut && !isExpanded ? text.slice(0, limit).trimEnd() : text;

    return (
            <Tag className={className}>
                {visibleText}

                {shouldCut && !isExpanded && (
                        <button type="button" className="textDotsButton" onClick={() => setIsExpanded(true)}>
                            ...</button>)}
                {shouldCut && isExpanded && (
                        <button type="button" className="textCollapseButton" onClick={() => setIsExpanded(false)}>
                            Свернуть</button>
                )}
            </Tag>
    );
}

function ItemWindow() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuth, loading } = useAuth();

    const item = location.state?.item;

    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState("");


    async function handleAddToCart() {
        if (loading) {
            return;
        }

        if (!isAuth) {
            navigate("/");
            return;
        }

        if (!item) {
            return;
        }

        if (item.count_in_stock <= 0) {
            setError("Товара нет в наличии");
            return;
        }

        const currentCount = item.count_in_cart || 0;
        const newCount = currentCount + 1;

        if (newCount > item.count_in_stock) {
            setError("Нельзя добавить больше товаров, чем есть в наличии");
            return;
        }

        try {
            setIsAdding(true);
            setError("");

            await addItemToCartRequest(item.id, newCount);

            navigate("/cart");
        } catch (error) {
            setError(error.message);
        } finally {
            setIsAdding(false);
        }
    }

    if (!item) {
        return (
                <div className="itemWindow">
                    <LeftPanel />

                    <Box component="main" className="itemContent">
                        <Card sx={{bgcolor: "#151922", color: "white", borderRadius: "32px",
                            border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none",}}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                    Данные товара не найдены
                                </Typography>

                                <Typography sx={{ color: "#8f94a3", mt: 1.2 }}>
                                    Вернитесь к списку товаров и выберите товар заново.
                                </Typography>

                                <Button onClick={() => navigate("/home")} startIcon={<ArrowBackOutlined />}
                                        sx={{mt: 3, py: 1.3, px: 2.5, borderRadius: "18px", bgcolor: "#2E4578",
                                            color: "white", fontWeight: 800, textTransform: "none",
                                            "&:hover": {bgcolor: "#3c589f",},}}>
                                    Вернуться к товарам
                                </Button>
                            </CardContent>
                        </Card>
                    </Box>
                </div>
        );
    }

    return (
            <div className="itemWindow">
                <LeftPanel />

                <Box component="main" className="itemContent">
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                        <Box sx={{width: 64, height: 64, borderRadius: "50%", bgcolor: "#12141b", color: "#2E4578",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,}}>
                            <ShoppingCartOutlined sx={{ fontSize: 34 }} />
                        </Box>

                        <Box>
                            <Typography variant="h4" sx={{color: "white", fontWeight: 800, lineHeight: 1.1,}}>
                                Карточка товара
                            </Typography>
                            <Typography sx={{color: "#8f94a3", mt: 0.7, fontSize: "1.05rem",}}>
                                Подробная информация о товаре
                            </Typography>
                        </Box>
                    </Stack>

                    <Box className="itemTop">
                        <Card className="itemImageCard" sx={{bgcolor: "#151922", color: "white", borderRadius: "32px",
                            border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none",
                            overflow: "hidden",}}>
                            <CardContent sx={{p: 2.5, "&:last-child": {pb: 2.5,},}}>
                                <div className="itemImageBlock">
                                    {item.picture_url ? (
                                            <img className="itemImage" src={item.picture_url} alt={item.title}/>
                                    ) : (
                                            <div className="itemImagePlaceholder">Нет изображения</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="itemPanel" sx={{bgcolor: "#151922", color: "white", borderRadius: "32px",
                            border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none",
                            height: "fit-content",}}>
                            <CardContent sx={{p: 3, "&:last-child": {pb: 3,},}}>
                                <ExpandableText as="h1" className="itemPageTitle" text={item.title} limit={45}/>
                                <Typography className="itemPagePrice">{item.price} ₽</Typography>
                                <Stack direction="row" alignItems="center" spacing={1.2}
                                       sx={{bgcolor: "#252a35", borderRadius: "18px", px: 2, py: 1.3, mt: 2.5,}}>
                                    <Inventory2Outlined sx={{ color: "#2E4578", fontSize: 26, flexShrink: 0 }} />
                                    <Typography sx={{ color: "#d0d0d0", fontWeight: 700 }}>
                                        В наличии: {item.count_in_stock}
                                    </Typography>
                                </Stack>

                                {(item.count_in_cart || 0) > 0 && (
                                        <Stack direction="row" alignItems="center" spacing={1.2}
                                               sx={{bgcolor: "#252a35", borderRadius: "18px", px: 2, py: 1.3, mt: 1.5,}}>
                                            <ShoppingCartOutlined sx={{ color: "#2E4578", fontSize: 26, flexShrink: 0 }} />
                                            <Typography sx={{ color: "#d0d0d0", fontWeight: 700 }}>
                                                В корзине: {item.count_in_cart}
                                            </Typography>
                                        </Stack>
                                )}

                                {error && (
                                        <Alert severity="error" sx={{mt: 2.5, bgcolor: "#2a1115", color: "#ffb4b4",
                                            borderRadius: "16px", border: "1px solid rgba(255, 107, 107, 0.25)",
                                            "& .MuiAlert-icon": {color: "#ff6b6b",},}}>
                                            {error}
                                        </Alert>
                                )}

                                <Button fullWidth className="toCartButton"
                                        endIcon={isAdding ? <CircularProgress size={18} sx={{ color: "#777" }} /> :
                                                <AddShoppingCartOutlined />}
                                        onClick={handleAddToCart}
                                        disabled={isAdding || loading || item.count_in_stock <= 0 ||
                                                (item.count_in_cart || 0) >= item.count_in_stock}
                                        sx={{mt: 3, py: 1.5, borderRadius: "18px", bgcolor: "#2E4578", color: "white",
                                            fontWeight: 800, fontSize: "1rem", textTransform: "none",
                                            "&:hover": {bgcolor: "#3c589f",}, "&.Mui-disabled": {bgcolor: "#2b2f3a",
                                                color: "#777",},}}>
                                    {isAdding ? "Добавление..." : "В корзину"}
                                </Button>
                            </CardContent>
                        </Card>
                    </Box>

                    <Card className="itemDescriptionBlock" sx={{bgcolor: "#151922", color: "white", borderRadius: "32px",
                        border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none", mt: 3,}}>
                        <CardContent sx={{p: 3, "&:last-child": {pb: 3,},}}>
                            <Typography variant="h5" sx={{fontWeight: 800, mb: 2,}}>
                                Описание:
                            </Typography>

                            <ExpandableText className="itemDescription" text={item.description} limit={250}/>
                        </CardContent>
                    </Card>
                </Box>
            </div>
    );
}

export default ItemWindow;