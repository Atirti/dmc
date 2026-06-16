import { useState } from "react";
import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography,} from "@mui/material";
import { createCategory } from "../../Controll/APIStuff/adminStuuf/categotyApi.js";
import {getNormalErrorMessage} from "../../Controll/errorHandler.js";


export default function CategoryModal({ open, onClose, onCreated }) {
    const [title, setTitle] = useState("");
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    function handleClose() {
        if (submitting) return;
        setTitle("");
        setError(null);
        onClose?.();
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const trimmedTitle = title.trim();

        if (!trimmedTitle) {
            setError("Введите название категории");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await createCategory(trimmedTitle);
            await onCreated?.();

            setTitle("");
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
                            borderRadius: "24px", minWidth: 360,},}}>
                <Box component="form" onSubmit={handleSubmit}>
                    <DialogTitle sx={{ fontWeight: 800 }}>
                        Новая категория</DialogTitle>

                    <DialogContent sx={{ pt: 1 }}>
                        <TextField autoFocus fullWidth placeholder="Название категории" value={title}
                                   onChange={(event) => setTitle(event.target.value)}
                                   sx={{"& .MuiOutlinedInput-root": {color: "white",bgcolor: "#1f2430",
                                           borderRadius: "12px", "& fieldset": {borderColor: "rgba(255,255,255,0.1)",},
                                           "&:hover fieldset": {borderColor: "rgba(255,255,255,0.2)",},
                                           "&.Mui-focused fieldset": {borderColor: "#2E4578",},},}}/>
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
                            {submitting ? "Сохранение..." : "Добавить"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
    );
}
