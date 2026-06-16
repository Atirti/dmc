import { useEffect, useState } from "react";
import {Box, Button, CircularProgress, IconButton, Typography,} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {deleteProduct, getProducts} from "../../Controll/APIStuff/adminStuuf/productApi.js";
import {getNormalErrorMessage} from "../../Controll/errorHandler.js";

export default function ProductList({ reloadKey, onEdit }) {
    const [products, setProducts] = useState([]);
    const [limit] = useState(20);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function loadProducts(nextOffset = 0, append = false) {
        setLoading(true);
        setError(null);

        try {
            const data = await getProducts(limit, nextOffset, "date", "desc");

            if (Array.isArray(data)) {
                setProducts((prev) => {
                    if (!append) {
                        return data;
                    }

                    const existingIds = new Set(prev.map((product) => product.id));
                    const newProducts = data.filter((product) => !existingIds.has(product.id));

                    return [...prev, ...newProducts];
                });

                setOffset(nextOffset);
                setHasMore(data.length === limit);
            } else {
                setProducts([]);
                setHasMore(false);
                setError("Сервер вернул товары не в формате массива");
            }
        } catch (err) {
            setError(getNormalErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProducts(0, false);
    }, [reloadKey]);

    //удаление в него даем айди продукта
    async function handleDeleteProduct(id) {
        try {
            await deleteProduct(id);
            await loadProducts(0, false);
        } catch (err) {
            setError(getNormalErrorMessage(err));
        }
    }
    //топогинация
    function handleLoadMore() {
        loadProducts(offset + limit, true);
    }

    return (
        <Box>
            {loading && products.length === 0 && (
                <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}><CircularProgress /></Box>
            )}

            {error && (<Typography sx={{color: "#ff6b6b", mb: 2,}}>{error}</Typography>)}

            {!loading && products.length === 0 && !error && (
                <Typography sx={{ color: "#8f94a3" }}>Товаров пока нет</Typography>)}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxHeight: 430, overflowY: "auto", pr: 0.5 }}>
                {products.map((product) => (
                    <Box key={product.id}
                         sx={{display: "flex", alignItems: "center", justifyContent: "space-between",
                             bgcolor: "#20242d", color: "white", borderRadius: "16px", px: 2, py: 1.5,}}>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 800 }}>
                                {product.title}
                            </Typography>

                            <Typography sx={{ color: "#8f94a3", fontSize: "0.9rem", mt: 0.5 }}>
                                Цена: {product.price} | Остаток: {product.count_in_stock}
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <IconButton onClick={() => onEdit?.(product)} sx={{color: "#8f94a3",}}>
                                <EditOutlinedIcon />
                            </IconButton>

                            <IconButton onClick={() => handleDeleteProduct(product.id)} sx={{color: "#ff6b6b",}}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </Box>
                ))}
            </Box>

            {hasMore && (
                <Button fullWidth onClick={handleLoadMore} disabled={loading}
                        sx={{mt: 2, py: 1.1, borderRadius: "14px", bgcolor: "#252a35",
                            color: "white", fontWeight: 800, textTransform: "none",
                            "&:hover": { bgcolor: "#303644" },}}>
                    {loading ? "Загрузка..." : "Загрузить еще"}
                </Button>
            )}
        </Box>
    );
}
