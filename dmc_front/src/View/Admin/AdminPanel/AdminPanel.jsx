import { useState } from "react";
import "./AdminPanelCss.css";
import {Box, Button, Card, CardContent, Collapse, Divider, MenuItem, Stack, Tab, Tabs, TextField, Typography} from "@mui/material";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../../Controll/APIStuff/adminStuuf/AdminAuthContext.jsx";
import CategoryList from "../../../Models/Data/CategoryList.jsx";
import ProductList from "../../../Models/Data/ProductList.jsx";
import OrderList from "../../../Models/Data/OrderList.jsx";
import CategoryModal from "../../../Models/CategoryModal/CategoryModal.jsx";
import ProductModal from "../../../Models/ProductModal/ProductModal.jsx";
import { ORDER_STATUSES } from "../../../Controll/APIStuff/adminStuuf/orderApi.js";

function AdminPanel() {
    const navigate = useNavigate();
    const { adminLogout } = useAdminAuth();
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categoriesReloadKey, setCategoriesReloadKey] = useState(0);
    const [isCategoryListOpen, setIsCategoryListOpen] = useState(true);
    const [orderUsername, setOrderUsername] = useState("");
    const [searchedOrderUsername, setSearchedOrderUsername] = useState("");
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productsReloadKey, setProductsReloadKey] = useState(0);
    const [orderSortBy, setOrderSortBy] = useState("created_at");
    const [orderSortOrder, setOrderSortOrder] = useState("desc");
    const [orderStatus, setOrderStatus] = useState("");
    const [orderLimit, setOrderLimit] = useState(10);
    const [orderOffset, setOrderOffset] = useState(0);
    const [userOrderLimit, setUserOrderLimit] = useState(10);
    const [userOrderOffset, setUserOrderOffset] = useState(0);
    const [createdAtFrom, setCreatedAtFrom] = useState("");
    const [createdAtTo, setCreatedAtTo] = useState("");
    const [activeOrderTab, setActiveOrderTab] = useState("user");

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

    function handleSearchUserOrders() {
        setSearchedOrderUsername(orderUsername.trim());
        setUserOrderOffset(0);
    }

    function handleResetUserOrders() {
        setOrderUsername("");
        setSearchedOrderUsername("");
        setUserOrderOffset(0);
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

                        <Button onClick={handleAdminLogout} endIcon={<LogoutOutlinedIcon />} sx={{
                            py: 1.4, px: 3, borderRadius: "18px", bgcolor: "#2E4578", color: "white",
                            fontWeight: 800, fontSize: "1rem", textTransform: "none", flexShrink: 0,
                            "&:hover": { bgcolor: "#3c589f" },}}>
                            Выйти
                        </Button>
                    </Stack>

                    <div className="adminContent">
                        <Card className="adminMainCard" sx={{bgcolor: "#151922", color: "white", borderRadius: "32px",
                            border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none",}}>
                            <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                                <Stack direction="row" spacing={2} className="adminSectionHeader">
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                            Управление товарами
                                        </Typography>
                                        <Typography sx={{ color: "#8f94a3", mt: 0.7 }}>
                                            Добавление, изменение и удаление товаров
                                        </Typography>
                                    </Box>

                                    <Button startIcon={<AddCircleOutlineOutlinedIcon />} onClick={handleOpenCreateProduct}
                                            sx={{py: 1.3, px: 2.5, borderRadius: "18px", bgcolor: "#2E4578",
                                                color: "white", fontWeight: 800, textTransform: "none", flexShrink: 0,
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
                                        onClick={() => setIsCategoryModalOpen(true)} sx={{py: 1.3,borderRadius: "16px",
                                    bgcolor: "#2E4578", color: "white", fontWeight: 800, textTransform: "none",
                                    "&:hover": { bgcolor: "#3c589f" },}}>
                                    Добавить категорию
                                </Button>

                                <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 2.5 }} />

                                <Button fullWidth endIcon={isCategoryListOpen ? <KeyboardArrowUpOutlinedIcon />
                                        : <KeyboardArrowDownOutlinedIcon />}
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

                        <div className="adminOrdersRow">
                            <Box className="adminOrdersTabs">
                                <Tabs value={activeOrderTab}
                                      onChange={(event, value) => setActiveOrderTab(value)}
                                      variant="fullWidth"
                                      sx={{minHeight: 48,
                                          "& .MuiTabs-indicator": { bgcolor: "#2E4578", height: 3 },
                                          "& .MuiTab-root": {color: "#8f94a3", fontWeight: 800, minHeight: 48,
                                              textTransform: "none",}, "& .Mui-selected": { color: "white" },}}>
                                    <Tab value="user" label="Заказы пользователя" />
                                    <Tab value="all" label="Все заказы" />
                                </Tabs>
                            </Box>

                            <Card className="adminSideCard" sx={{bgcolor: "#151922", color: "white", borderRadius: "32px",
                                border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none", height: "fit-content",
                                display: activeOrderTab === "user" ? "block" : "none", width: "100%", minWidth: 0,}}>
                            <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                                    Заказы пользователя
                                </Typography>

                                <Typography sx={{ color: "#8f94a3", mb: 2 }}>Поиск заказов по username</Typography>

                                <TextField fullWidth label="username" value={orderUsername}
                                           onChange={(event) => setOrderUsername(event.target.value)}
                                           onKeyDown={(event) => {
                                               if (event.key === "Enter") {handleSearchUserOrders();}
                                           }}
                                           sx={{mb: 2, input: {color: "white",}, label: {color: "#8f94a3",},
                                               "& .MuiInputLabel-root": {color: "#8f94a3", bgcolor: "#151922", px: 0.5,},
                                               "& .MuiInputLabel-root.Mui-focused": {color: "#8f94a3",},
                                               "& .MuiInputLabel-root.MuiInputLabel-shrink": {color: "#8f94a3", bgcolor: "#151922", px: 0.5,},
                                               "& .MuiOutlinedInput-root": {borderRadius: "16px", bgcolor: "#1d2230",
                                                   "& fieldset": {borderColor: "rgba(255,255,255,0.12)",},
                                                   "&:hover fieldset": {borderColor: "rgba(255,255,255,0.22)",},
                                                   "&.Mui-focused fieldset": {borderColor: "#2E4578",},
                                               },
                                           }}
                                />

                                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                    <Button onClick={handleSearchUserOrders} sx={{borderRadius: "14px",
                                        bgcolor: "#2E4578", color: "white", fontWeight: 800, textTransform: "none",
                                        "&:hover": { bgcolor: "#3c589f" },}}>
                                        Найти
                                    </Button>

                                    <Button onClick={handleResetUserOrders} sx={{borderRadius: "14px",
                                        bgcolor: "#1d2230", color: "#8f94a3", fontWeight: 800, textTransform: "none",
                                        "&:hover": { bgcolor: "#252b3a" },}}>
                                        Сбросить
                                    </Button>
                                </Stack>

                                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                    <Button disabled={userOrderOffset === 0}
                                            onClick={() => setUserOrderOffset((value) => Math.max(value - userOrderLimit, 0))}
                                            sx={{borderRadius: "14px", bgcolor: "#2E4578", color: "white",
                                                fontWeight: 800, textTransform: "none",
                                                "&:hover": { bgcolor: "#3c589f" },
                                                "&.Mui-disabled": { bgcolor: "#1d2230", color: "#8f94a3" },}}>
                                        Назад
                                    </Button>

                                    <Button disabled={!searchedOrderUsername}
                                            onClick={() => setUserOrderOffset((value) => value + userOrderLimit)}
                                            sx={{borderRadius: "14px", bgcolor: "#2E4578", color: "white",
                                                fontWeight: 800, textTransform: "none",
                                                "&:hover": { bgcolor: "#3c589f" },
                                                "&.Mui-disabled": { bgcolor: "#1d2230", color: "#8f94a3" },}}>
                                        Далее
                                    </Button>
                                </Stack>

                                {searchedOrderUsername ? (
                                        <OrderList username={searchedOrderUsername} limit={userOrderLimit}
                                                   offset={userOrderOffset} />
                                ) : (
                                        <Typography sx={{ color: "#8f94a3" }}>Введите username и нажмите Найти</Typography>
                                )}
                            </CardContent>
                            </Card>

                            <Card className="adminSideCard" sx={{bgcolor: "#151922",
                                color: "white", borderRadius: "32px", border: "1px solid rgba(255, 255, 255, 0.06)",
                                boxShadow: "none", height: "fit-content", width: "100%", minWidth: 0,
                                display: activeOrderTab === "all" ? "block" : "none",}}>
                            <CardContent sx={{ p: 3, "&:last-child": { pb: 4 } }}>
                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Все заказы</Typography>

                                <Typography sx={{ color: "#8f94a3", mb: 2 }}>Сортировки</Typography>

                                <TextField fullWidth select label="Сортировать по" value={orderSortBy}
                                           onChange={(event) => {
                                               setOrderSortBy(event.target.value);
                                               setOrderOffset(0);
                                           }}
                                           sx={{mb: 2, input: {color: "white",}, label: {color: "#8f94a3",},
                                               "& .MuiInputLabel-root": {color: "#8f94a3", bgcolor: "#151922", px: 0.5,},
                                               "& .MuiInputLabel-root.Mui-focused": {color: "#8f94a3",},
                                               "& .MuiInputLabel-root.MuiInputLabel-shrink": {color: "#8f94a3", bgcolor: "#151922", px: 0.5,},
                                               "& .MuiSelect-icon": {color: "#8f94a3",},
                                               "& .MuiOutlinedInput-root": {borderRadius: "16px", bgcolor: "#1d2230",
                                                   color: "white",
                                                   "& fieldset": {borderColor: "rgba(255,255,255,0.12)",},
                                                   "&:hover fieldset": {borderColor: "rgba(255,255,255,0.22)",},
                                                   "&.Mui-focused fieldset": {borderColor: "#2E4578",},
                                               },
                                           }}
                                >
                                    <MenuItem value="created_at">По дате</MenuItem>
                                    <MenuItem value="status">По статусу</MenuItem>
                                </TextField>

                                <TextField fullWidth select label="Порядок" value={orderSortOrder}
                                           onChange={(event) => {
                                               setOrderSortOrder(event.target.value);
                                               setOrderOffset(0);
                                           }}
                                           sx={{mb: 2, input: {color: "white",}, label: {color: "#8f94a3",},
                                               "& .MuiInputLabel-root": {color: "#8f94a3", bgcolor: "#151922", px: 0.5,},
                                               "& .MuiInputLabel-root.Mui-focused": {color: "#8f94a3",},
                                               "& .MuiInputLabel-root.MuiInputLabel-shrink": {color: "#8f94a3", bgcolor: "#151922", px: 0.5,},
                                               "& .MuiSelect-icon": {color: "#8f94a3",},
                                               "& .MuiOutlinedInput-root": {borderRadius: "16px", bgcolor: "#1d2230",
                                                   color: "white",
                                                   "& fieldset": {borderColor: "rgba(255,255,255,0.12)",},
                                                   "&:hover fieldset": {borderColor: "rgba(255,255,255,0.22)",},
                                                   "&.Mui-focused fieldset": {borderColor: "#2E4578",},
                                               },
                                           }}
                                >
                                    <MenuItem value="desc">По убыванию</MenuItem>
                                    <MenuItem value="asc">По возрастанию</MenuItem>
                                </TextField>

                                <TextField fullWidth select label="Статус" value={orderStatus}
                                           onChange={(event) => {
                                               setOrderStatus(event.target.value);
                                               setOrderOffset(0);
                                           }}
                                           sx={{mb: 2, input: {color: "white",}, label: {color: "#8f94a3",},
                                               "& .MuiInputLabel-root": {color: "#8f94a3", bgcolor: "#151922", px: 0.5,},
                                               "& .MuiInputLabel-root.Mui-focused": {color: "#8f94a3",},
                                               "& .MuiInputLabel-root.MuiInputLabel-shrink": {color: "#8f94a3", bgcolor: "#151922", px: 0.5,},
                                               "& .MuiSelect-icon": {color: "#8f94a3",},
                                               "& .MuiOutlinedInput-root": {borderRadius: "16px", bgcolor: "#1d2230",
                                                   color: "white",
                                                   "& fieldset": {borderColor: "rgba(255,255,255,0.12)",},
                                                   "&:hover fieldset": {borderColor: "rgba(255,255,255,0.22)",},
                                                   "&.Mui-focused fieldset": {borderColor: "#2E4578",},
                                               },
                                           }}
                                >
                                    <MenuItem value="">Все статусы</MenuItem>
                                    {ORDER_STATUSES.map((status) => (
                                            <MenuItem key={status} value={status}>{status}</MenuItem>))}
                                </TextField>

                                <TextField fullWidth type="datetime-local" label="Дата от" value={createdAtFrom}
                                           onChange={(event) => {
                                               setCreatedAtFrom(event.target.value);
                                               setOrderOffset(0);
                                           }}
                                           InputLabelProps={{shrink: true,}}
                                           sx={{mb: 2, input: {color: "white",}, label: {color: "#8f94a3",},
                                               "& .MuiInputLabel-root": {color: "#8f94a3", bgcolor: "#151922", px: 0.5,},
                                               "& .MuiInputLabel-root.Mui-focused": {color: "#8f94a3",},
                                               "& .MuiInputLabel-root.MuiInputLabel-shrink": {color: "#8f94a3", bgcolor: "#151922", px: 0.5,},
                                               "& .MuiOutlinedInput-root": {borderRadius: "16px", bgcolor: "#1d2230",
                                                   "& fieldset": {borderColor: "rgba(255,255,255,0.12)",},
                                                   "&:hover fieldset": {borderColor: "rgba(255,255,255,0.22)",},
                                                   "&.Mui-focused fieldset": {borderColor: "#2E4578",},
                                               },
                                           }}
                                />

                                <TextField fullWidth type="datetime-local" label="Дата до" value={createdAtTo}
                                           onChange={(event) => {
                                               setCreatedAtTo(event.target.value);
                                               setOrderOffset(0);
                                           }}
                                           InputLabelProps={{shrink: true,}}
                                           sx={{mb: 2, input: {color: "white",}, label: {color: "#8f94a3",},
                                               "& .MuiInputLabel-root": {color: "#8f94a3", bgcolor: "#151922", px: 0.5,},
                                               "& .MuiInputLabel-root.Mui-focused": {color: "#8f94a3",},
                                               "& .MuiInputLabel-root.MuiInputLabel-shrink": {color: "#8f94a3", bgcolor: "#151922", px: 0.5,},
                                               "& .MuiOutlinedInput-root": {borderRadius: "16px", bgcolor: "#1d2230",
                                                   "& fieldset": {borderColor: "rgba(255,255,255,0.12)",},
                                                   "&:hover fieldset": {borderColor: "rgba(255,255,255,0.22)",},
                                                   "&.Mui-focused fieldset": {borderColor: "#2E4578",},
                                               },
                                           }}
                                />

                                <TextField fullWidth type="number" label="Лимит" value={orderLimit}
                                           onChange={(event) => {
                                               setOrderLimit(Number(event.target.value));
                                               setOrderOffset(0);
                                           }}
                                           sx={{mb: 2, input: {color: "white",}, label: {color: "#8f94a3",},
                                               "& .MuiInputLabel-root": {color: "#8f94a3", bgcolor: "#151922", px: 0.5,},
                                               "& .MuiInputLabel-root.Mui-focused": {color: "#8f94a3",},
                                               "& .MuiInputLabel-root.MuiInputLabel-shrink": {color: "#8f94a3", bgcolor: "#151922", px: 0.5,},
                                               "& .MuiOutlinedInput-root": {borderRadius: "16px", bgcolor: "#1d2230",
                                                   "& fieldset": {borderColor: "rgba(255,255,255,0.12)",},
                                                   "&:hover fieldset": {borderColor: "rgba(255,255,255,0.22)",},
                                                   "&.Mui-focused fieldset": {borderColor: "#2E4578",},
                                               },
                                           }}
                                />

                                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                    <Button disabled={orderOffset === 0}
                                            onClick={() => setOrderOffset((value) => Math.max(value - orderLimit, 0))}
                                            sx={{borderRadius: "14px", bgcolor: "#2E4578", color: "white",
                                                fontWeight: 800, textTransform: "none",
                                                "&:hover": { bgcolor: "#3c589f" },
                                                "&.Mui-disabled": { bgcolor: "#1d2230", color: "#8f94a3" },}}>
                                        Назад
                                    </Button>

                                    <Button onClick={() => setOrderOffset((value) => value + orderLimit)}
                                            sx={{borderRadius: "14px", bgcolor: "#2E4578", color: "white",
                                                fontWeight: 800, textTransform: "none",
                                                "&:hover": { bgcolor: "#3c589f" },}}>
                                        Далее
                                    </Button>
                                </Stack>

                                <OrderList limit={orderLimit}
                                           offset={orderOffset}
                                           status={orderStatus}
                                           sortBy={orderSortBy}
                                           sortOrder={orderSortOrder}
                                           createdAtFrom={createdAtFrom}
                                           createdAtTo={createdAtTo} />
                            </CardContent>
                            </Card>
                        </div>
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
