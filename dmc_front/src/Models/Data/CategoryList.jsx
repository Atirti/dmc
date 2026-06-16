import { useEffect, useState } from "react";
import {Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Typography,} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {getCategories, deleteCategory, updateCategory} from "../../Controll/APIStuff/adminStuuf/categotyApi.js";
import {getNormalErrorMessage} from "../../Controll/errorHandler.js";

export default function CategoryList({ reloadKey }) {
    const [categories, setCategories] = useState([]);//список ктегорий
    const [loading, setLoading] = useState(false);//заглушка при загрузке
    const [error, setError] = useState(null);
    const [editCategory, setEditCategory] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editError, setEditError] = useState(null);
    const [editSubmitting, setEditSubmitting] = useState(false);

    async function loadCategories() {
        setLoading(true);
        setError(null);

        try {
            const data = await getCategories();//берем категории

            if (Array.isArray(data)) {
                setCategories(data);
            } else {
                setCategories([]);
                setError("Сервер вернул категории не в формате массива");
            }
        } catch (err) {
            setError(getNormalErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    //загружаеть категории и обновление списка когда из панельки работа
    useEffect(() => {
        loadCategories();
    }, [reloadKey]);

    //окно редактирования
    function handleOpenEdit(category) {
        setEditCategory(category);
        setEditTitle(category.title);
        setEditError(null);
    }
    //закрывашка
    function handleCloseEdit() {
        if (editSubmitting) return;
        setEditCategory(null);
        setEditTitle("");
        setEditError(null);
    }
    //сохранит измененое название
    async function handleEditSubmit(event) {
        event.preventDefault();
        const trimmedTitle = editTitle.trim();

        if (!trimmedTitle) {setEditError("Введите название категории");return;}

        setEditSubmitting(true);
        setEditError(null);

        try {
            await updateCategory(editCategory.id, trimmedTitle);
            await loadCategories();
            handleCloseEdit();
        } catch (err) {
            setEditError(getNormalErrorMessage(err));
        } finally {
            setEditSubmitting(false);
        }
    }
    //удаление
    async function handleDeleteCategory(id) {
        try {
            await deleteCategory(id);
            await loadCategories();
        } catch (err) {
            setError(getNormalErrorMessage(err));
        }
    }

    return (
            <Box>
                {loading && (<Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
                    <CircularProgress /></Box>)}

                {error && (<Typography sx={{color: "#ff6b6b", mb: 2,}}>
                    {error}</Typography>)}

                {!loading && categories.length === 0 && !error && (
                        <Typography sx={{ color: "#8f94a3" }}>Категорий пока нет</Typography>)}

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxHeight: 360, overflowY: "auto", pr: 0.5 }}>
                    {categories.map((category) => (
                            <Box key={category.id}
                                 sx={{display: "flex", alignItems: "center", justifyContent: "space-between",
                                     bgcolor: "#151922", color: "white", borderRadius: "16px", px: 2, py: 1.5,}}>
                                <Typography sx={{ fontWeight: 700 }}>
                                    {category.title}
                                </Typography>

                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <IconButton onClick={() => handleOpenEdit(category)} sx={{color: "#8f94a3",}}>
                                        <EditOutlinedIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDeleteCategory(category.id)} sx={{color: "#ff6b6b",}}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                    ))}
                </Box>

                <Dialog open={Boolean(editCategory)} onClose={handleCloseEdit}
                        sx={{"& .MuiDialog-paper": {bgcolor: "#151922", color: "white", borderRadius: "24px", minWidth: 360,},}}>
                    <Box component="form" onSubmit={handleEditSubmit}>
                        <DialogTitle sx={{ fontWeight: 800 }}>
                            Изменить категорию</DialogTitle>

                        <DialogContent sx={{ pt: 1 }}>
                            <TextField autoFocus fullWidth placeholder="Название категории" value={editTitle}
                                       onChange={(event) => setEditTitle(event.target.value)}
                                       sx={{"& .MuiOutlinedInput-root": {color: "white", bgcolor: "#1f2430",
                                               borderRadius: "12px", "& fieldset": {borderColor: "rgba(255,255,255,0.1)",},
                                               "&:hover fieldset": {borderColor: "rgba(255,255,255,0.2)",},
                                               "&.Mui-focused fieldset": {borderColor: "#2E4578",},},}}/>

                            {editError && (
                                    <Typography sx={{color: "#ff6b6b", mt: 1.5, fontSize: "0.9rem",}}>{editError}</Typography>)}
                        </DialogContent>

                        <DialogActions sx={{ px: 3, pb: 2.5 }}>
                            <Button onClick={handleCloseEdit} disabled={editSubmitting}
                                    sx={{color: "#8f94a3", textTransform: "none", fontWeight: 700,}}>
                                Отмена</Button>

                            <Button type="submit" disabled={editSubmitting}
                                    sx={{bgcolor: "#2E4578", color: "white", fontWeight: 800, textTransform: "none",
                                        px: 3, borderRadius: "14px", "&:hover": {bgcolor: "#3c589f",},}}>
                                {editSubmitting ? "Сохранение..." : "Сохранить"}
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>
            </Box>
    );
}
