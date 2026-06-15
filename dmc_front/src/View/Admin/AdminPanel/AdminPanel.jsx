import { useState } from "react";
import "./AdminPanelCss.css";
import { Box, Button, Card, CardContent, Collapse, Divider, Stack, Typography } from "@mui/material";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../../Controll/APIStuff/adminStuuf/AdminAuthContext.jsx";
import CategoryList from "../../../Models/Data/CategoryList.jsx";
import ProductList from "../../../Models/Data/ProductList.jsx";
import CategoryModal from "../../../Models/CategoryModal/CategoryModal.jsx";
import ProductModal from "../../../Models/ProductModal/ProductModal.jsx";

function AdminPanel() {
    const navigate = useNavigate();
    const { adminLogout } = useAdminAuth();

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categoriesReloadKey, setCategoriesReloadKey] = useState(0);
    const [isCategoryListOpen, setIsCategoryListOpen] = useState(true);

    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productsReloadKey, setProductsReloadKey] = useState(0);

    //выходялка
    async function handleAdminLogout() {
        try {
            await adminLogout();
            navigate("/admin_login", { replace: true });
        } catch (error) {
            console.log(error);
            navigate("/admin_login", { replace: true });
        }
    }

    function handleCategoryCreated() {
        setCategoriesReloadKey((key) => key + 1);
    }

    function handleProductSaved() {
        setProductsReloadKey((key) => key + 1);
    }

    function handleOpenCreateProduct() {
        setEditingProduct(null);
        setIsProductModalOpen(true);
    }

    function handleOpenEditProduct(product) {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    }

    function handleCloseProductModal() {
        setEditingProduct(null);
        setIsProductModalOpen(false);
    }

    return (
            <div className="adminPage">
                <Box className="adminWindow">
                    <Stack direction="row" spacing={2} className="adminHeader">
                        <Stack direction="row" spacing={2}>
                            <Box sx={{width: 64, height: 64, borderRadius: "50%", bgcolor: "#12141b", color: "#2E4578",
                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,}}>
                                <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 38 }} />
                            </Box>

                            <Box>
                                <Typography variant="h4" sx={{ color: "white", fontWeight: 800, lineHeight: 1.1 }}>
                                    Админ-панель
                                </Typography>
                                <Typography sx={{ color: "#8f94a3", mt: 0.7, fontSize: "1.05rem" }}>
                                    Управление магазином
                                </Typography>
                            </Box>
                        </Stack>

                        <Button onClick={handleAdminLogout} endIcon={<LogoutOutlinedIcon />} sx={{py: 1.4, px: 3,
                            borderRadius: "18px", bgcolor: "#2E4578", color: "white", fontWeight: 800,
                            fontSize: "1rem", textTransform: "none", flexShrink: 0, "&:hover": { bgcolor: "#3c589f" },}}>
                            Выйти
                        </Button>
                    </Stack>

                    <div className="adminContent">
                        <Card className="adminMainCard" sx={{bgcolor: "#151922", color: "white", borderRadius: "32px",
                            border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none",}}>
                            <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                                <Stack direction="row" spacing={2} className="adminSectionHeader">
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 800 }}>Управление товарами</Typography>
                                        <Typography sx={{ color: "#8f94a3", mt: 0.7 }}>
                                            Добавление, изменение и удаление товаров
                                        </Typography>
                                    </Box>

                                    <Button startIcon={<AddCircleOutlineOutlinedIcon />} onClick={handleOpenCreateProduct}
                                            sx={{py: 1.3, px: 2.5, borderRadius: "18px", bgcolor: "#2E4578",
                                                color: "white", fontWeight: 800,textTransform: "none", flexShrink: 0,
                                                "&:hover": { bgcolor: "#3c589f" },}}>
                                        Добавить товар
                                    </Button>
                                </Stack>

                                <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 2.5 }} />

                                <ProductList reloadKey={productsReloadKey} onEdit={handleOpenEditProduct} />
                            </CardContent>
                        </Card>

                        <Card className="adminSideCard" sx={{bgcolor: "#151922", color: "white", borderRadius: "32px",
                            border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none", height: "fit-content",}}>
                            <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                                    Управление категориями
                                </Typography>

                                <Typography sx={{ color: "#8f94a3", mb: 2 }}>
                                    Добавление, изменение и удаление категорий товаров
                                </Typography>

                                <Button fullWidth startIcon={<AddCircleOutlineOutlinedIcon />}
                                        onClick={() => setIsCategoryModalOpen(true)}
                                        sx={{py: 1.3, borderRadius: "16px", bgcolor: "#2E4578",
                                            color: "white", fontWeight: 800, textTransform: "none",
                                            "&:hover": { bgcolor: "#3c589f" },}}>
                                    Добавить категорию
                                </Button>

                                <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 2.5 }} />

                                <Button fullWidth endIcon={isCategoryListOpen ? <KeyboardArrowUpOutlinedIcon /> : <KeyboardArrowDownOutlinedIcon />}
                                        onClick={() => setIsCategoryListOpen((value) => !value)}
                                        sx={{justifyContent: "space-between", color: "white", fontWeight: 800,
                                            fontSize: "1.05rem", textTransform: "none", px: 0, mb: 1,
                                            "&:hover": { bgcolor: "transparent" },}}>
                                    Список категорий
                                </Button>

                                <Collapse in={isCategoryListOpen}>
                                    <CategoryList reloadKey={categoriesReloadKey} />
                                </Collapse>
                            </CardContent>
                        </Card>

                        <Card className="adminSideCard" sx={{bgcolor: "#151922", color: "white", borderRadius: "32px",
                            border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none", height: "fit-content",}}>
                            <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                                <Stack spacing={1.5}>
                                    <Button fullWidth sx={{py: 1.3,
                                        borderRadius: "16px", bgcolor: "#252a35", color: "white", fontWeight: 800,
                                        textTransform: "none", "&:hover": { bgcolor: "#303644" },}}>
                                        Открыть заказы
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </div>
                </Box>

                <CategoryModal open={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)}
                               onCreated={handleCategoryCreated}/>

                <ProductModal open={isProductModalOpen} onClose={handleCloseProductModal}
                              onSaved={handleProductSaved} product={editingProduct}/>
            </div>
    );
}

export default AdminPanel;