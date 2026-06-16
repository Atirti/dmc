import { useEffect, useState } from "react";
import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography,} from "@mui/material";
import {createProduct, updateProduct} from "../../Controll/APIStuff/adminStuuf/productApi.js";
import {getCategories} from "../../Controll/APIStuff/adminStuuf/categotyApi.js";
import {getNormalErrorMessage} from "../../Controll/errorHandler.js";

const emptyProduct = {
    title: "",
    description: "",
    price: "",
    picture_url: "",
    count_in_stock: "",
    category_id: "",
};

export default function ProductModal({ open, onClose, onSaved, product }) {
    const [form, setForm] = useState(emptyProduct);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const isEdit = Boolean(product);

    useEffect(() => {
        if (open) {
            loadCategories();
            if (product) {
                setForm({
                    title: product.title || "",
                    description: product.description || "",
                    price: product.price ?? "",
                    picture_url: product.picture_url || "",
                    count_in_stock: product.count_in_stock ?? "",
                    category_id: product.category_id ?? "",
                });
            } else {
                setForm(emptyProduct);
            }

            setError(null);
        }
    }, [open, product]);

    async function loadCategories() {
        try {
            const data = await getCategories();

            if (Array.isArray(data)) {
                setCategories(data);
            }
        } catch (err) {
            setError(getNormalErrorMessage(err));
        }
    }
    //Обновляет одно поле
    function handleChange(field, value) {
        setForm((prev) => ({
            ...prev, [field]: value,}));
    }
    //закрывашка
    function handleClose() {
        if (submitting) return;

        setForm(emptyProduct);
        setError(null);
        onClose?.();
    }
    //сохранялка с проверками
    async function handleSubmit(event) {
        event.preventDefault();

        if (!form.title.trim()) {
            setError("Введите название товара");
            return;
        }

        if (!form.description.trim()) {
            setError("Введите описание товара");
            return;
        }

        if (!form.picture_url.trim()) {
            setError("Введите ссылку на картинку");
            return;
        }

        if (form.price === "" || Number(form.price) < 0) {
            setError("Введите корректную цену");
            return;
        }

        if (form.count_in_stock === "" || Number(form.count_in_stock) < 0) {
            setError("Введите корректный остаток");
            return;
        }

        if (!form.category_id) {
            setError("Выберите категорию");
            return;
        }

        setSubmitting(true);
        setError(null);

        const productData = {
            title: form.title.trim(),
            description: form.description.trim(),
            price: Number(form.price),
            picture_url: form.picture_url.trim(),
            count_in_stock: Number(form.count_in_stock),
            category_id: Number(form.category_id),
        };

        try {
            if (isEdit) {
                await updateProduct({
                    id: product.id,
                    ...productData,
                });
            } else {
                await createProduct(productData);
            }

            await onSaved?.();

            setForm(emptyProduct);
            onClose?.();
        } catch (err) {
            setError(getNormalErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }

    return (
            <Dialog open={open} onClose={handleClose}
                    sx={{"& .MuiDialog-paper": {bgcolor: "#151922", color: "white",
                            borderRadius: "24px", minWidth: 420,},}}>
                <Box component="form" onSubmit={handleSubmit}>
                    <DialogTitle sx={{ fontWeight: 800 }}>
                        {isEdit ? "Изменить товар" : "Новый товар"}
                    </DialogTitle>

                    <DialogContent sx={{ pt: 1 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            <TextField fullWidth placeholder="Название товара" value={form.title}
                                       onChange={(event) => handleChange("title", event.target.value)}
                                       sx={inputSx}/>

                            <TextField fullWidth multiline minRows={3} placeholder="Описание товара" value={form.description}
                                       onChange={(event) => handleChange("description", event.target.value)}
                                       sx={inputSx}/>

                            <TextField fullWidth type="number" placeholder="Цена" value={form.price}
                                       onChange={(event) => handleChange("price", event.target.value)}
                                       sx={inputSx}/>

                            <TextField fullWidth placeholder="Ссылка на картинку" value={form.picture_url}
                                       onChange={(event) => handleChange("picture_url", event.target.value)}
                                       sx={inputSx}/>

                            <TextField fullWidth type="number" placeholder="Количество на складе" value={form.count_in_stock}
                                       onChange={(event) => handleChange("count_in_stock", event.target.value)}
                                       sx={inputSx}/>

                            <TextField select fullWidth value={form.category_id}
                                       onChange={(event) => handleChange("category_id", event.target.value)}
                                       sx={inputSx}>
                                {categories.map((category) => (
                                        <MenuItem key={category.id} value={category.id}>
                                            {category.title}
                                        </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        {error && (
                                <Typography sx={{color: "#ff6b6b", mt: 1.5, fontSize: "0.9rem",}}>{error}</Typography>)}
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 2.5 }}>
                        <Button onClick={handleClose} disabled={submitting}
                                sx={{color: "#8f94a3", textTransform: "none", fontWeight: 700,}}>
                            Отмена</Button>

                        <Button type="submit" disabled={submitting}
                                sx={{bgcolor: "#2E4578", color: "white", fontWeight: 800, textTransform: "none",
                                    px: 3, borderRadius: "14px", "&:hover": {bgcolor: "#3c589f",},}}>
                            {submitting ? "Сохранение..." : isEdit ? "Сохранить" : "Добавить"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
    );
}

const inputSx = {
    "& .MuiOutlinedInput-root": {color: "white",
        bgcolor: "#1f2430", borderRadius: "12px",
        "& fieldset": {borderColor: "rgba(255,255,255,0.1)",},
        "&:hover fieldset": {borderColor: "rgba(255,255,255,0.2)",},
        "&.Mui-focused fieldset": {borderColor: "#2E4578",},
    },
    "& .MuiInputLabel-root": {color: "#8f94a3",},
    "& .MuiSelect-icon": {color: "white",},
};
