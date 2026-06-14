import "./MainMenuCSS.css";
import { NavLink } from "react-router-dom";
import { getItemsRequest } from "../../Controll/APIStuff/getItemsForMain.js";
import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography
} from "@mui/material";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

function MainMenu() {
    const [itemsList, setItemList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sortType, setSortType] = useState("date");
    const [order, setOrder] = useState("desc");
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(0);

    useEffect(() => {
        async function loadItems() {
            try {
                setLoading(true);
                setError("");

                const offset = page * limit;
                const items = await getItemsRequest(limit, offset, order, sortType);

                setItemList(items);
            } catch (err) {
                console.log(err);
                setError("Не удалось загрузить товары");
            } finally {
                setLoading(false);
            }
        }

        loadItems();
    }, [page, limit, order, sortType]);

    function handleLimitChange(event) {
        setLimit(Number(event.target.value));
        setPage(0);
    }

    function handleOrderChange(event) {
        setOrder(event.target.value);
        setPage(0);
    }

    function handleSortChange(event) {
        setSortType(event.target.value);
        setPage(0);
    }

    function nextPage() {
        setPage((prevPage) => prevPage + 1);
    }

    function prevPage() {
        setPage((prevPage) => Math.max(prevPage - 1, 0));
    }

    return (
            <main className="MainMenu">
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                    <Box sx={{width: 64, height: 64, borderRadius: "50%", bgcolor: "#12141b", color: "#2E4578",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,}}>
                        <StorefrontOutlinedIcon sx={{ fontSize: 34 }} />
                    </Box>

                    <Box>
                        <Typography variant="h4" sx={{color: "white", fontWeight: 800, lineHeight: 1.1,}}>
                            Каталог
                        </Typography>
                        <Typography sx={{color: "#8f94a3", mt: 0.7, fontSize: "1.05rem",}}>
                            Выберите нужные комплектующие
                        </Typography>
                    </Box>
                </Stack>

                <Card className="sortCard" sx={{bgcolor: "#151922", color: "white", borderRadius: "28px",
                    border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none", mb: 3,}}>
                    <CardContent sx={{p: 2.5, "&:last-child": {pb: 2.5,},}}>
                        <div className="sortCombos">
                            <FormControl className="ComboBoxSort" size="small">
                                <InputLabel id="sort-type-label">Сортировка</InputLabel>
                                <Select variant="outlined" labelId="sort-type-label" id="sort-type-select" value={sortType}
                                        label="Сортировка" onChange={handleSortChange}>
                                    <MenuItem value="date">По дате</MenuItem>
                                    <MenuItem value="price">По цене</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl className="ComboBoxOrder" size="small">
                                <InputLabel id="order-label">Порядок</InputLabel>
                                <Select variant="outlined" labelId="order-label" id="order-select" value={order}
                                        label="Порядок" onChange={handleOrderChange}>
                                    <MenuItem value="desc">По убыванию</MenuItem>
                                    <MenuItem value="asc">По возрастанию</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl className="ComboBoxItemLimit" size="small">
                                <InputLabel id="limit-label">Количество</InputLabel>
                                <Select variant="outlined" labelId="limit-label" id="limit-select"
                                        value={limit} label="Количество" onChange={handleLimitChange}>
                                    <MenuItem value={10}>10 Предметов</MenuItem>
                                    <MenuItem value={20}>20 Предметов</MenuItem>
                                    <MenuItem value={30}>30 Предметов</MenuItem>
                                    <MenuItem value={40}>40 Предметов</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    </CardContent>
                </Card>

                {loading && (
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <CircularProgress size={26} sx={{ color: "#2E4578" }} />
                            <Typography sx={{ color: "white", fontSize: "1.1rem" }}>
                                Загрузка товаров...
                            </Typography>
                        </Stack>
                )}

                {error && (
                        <Alert severity="error" sx={{mb: 3, bgcolor: "#2a1115", color: "#ffb4b4",
                            borderRadius: "16px", border: "1px solid rgba(255, 107, 107, 0.25)",
                            "& .MuiAlert-icon": {color: "#ff6b6b",},}}>
                            {error}
                        </Alert>
                )}

                {!loading && !error && (
                        <>
                            <div className="itemsMenu" id="itemsMenu">
                                <div className="itemsMenuList">
                                    {itemsList.map((item) => (
                                            <Card key={item.id} className="itemsMenuListItem"
                                                  sx={{bgcolor: "#151922", color: "white", borderRadius: "28px",
                                                      border: "1px solid rgba(255, 255, 255, 0.06)",
                                                      boxShadow: "none", overflow: "hidden",}}>
                                                <CardActionArea component={NavLink}
                                                                to={`/home/item/${item.id}`} state={{ item }}
                                                                sx={{height: "100%", textDecoration: "none", color: "inherit",
                                                                    display: "flex", flexDirection: "column", alignItems: "stretch",}}>
                                                    <Box className="itemImageWrap">
                                                        {item.picture_url ? (
                                                                <CardMedia component="img"
                                                                           image={item.picture_url}
                                                                           alt={item.title}
                                                                           title={item.title}
                                                                           className="mainItemImage"/>
                                                        ) : (
                                                                <Box className="mainItemImagePlaceholder">
                                                                    Нет изображения
                                                                </Box>
                                                        )}
                                                    </Box>

                                                    <CardContent sx={{p: 2, "&:last-child": {pb: 2,},}}>
                                                        <Typography variant="h6" component="p" noWrap
                                                                    sx={{color: "white", mb: 1, textAlign: "left",
                                                                        fontWeight: 800,}}>
                                                            {item.title}
                                                        </Typography>

                                                        <Typography variant="body1" sx={{color: "#b276ff", fontWeight: 800,
                                                            fontSize: "1.2rem", textAlign: "left",}}>
                                                            {item.price} ₽
                                                        </Typography>
                                                    </CardContent>
                                                </CardActionArea>
                                            </Card>
                                    ))}
                                </div>
                            </div>

                            <div className="pages">
                                <Button variant="outlined" onClick={prevPage} disabled={page === 0}
                                        sx={{borderRadius: "15px", borderColor: "#2E4578", color: "white",
                                            minWidth: "46px", "&:hover": {borderColor: "#3c589f", bgcolor: "#151922",},
                                            "&.Mui-disabled": {borderColor: "#2b2f3a", color: "#777",},}}>
                                    &lt;
                                </Button>

                                <Typography sx={{fontWeight: 800, color: "white"}}>
                                    Страница {page + 1}
                                </Typography>

                                <Button variant="outlined" onClick={nextPage} disabled={itemsList.length < limit}
                                        sx={{borderRadius: "15px", borderColor: "#2E4578", color: "white",
                                            minWidth: "46px", "&:hover": {borderColor: "#3c589f", bgcolor: "#151922",},
                                            "&.Mui-disabled": {borderColor: "#2b2f3a", color: "#777",},}}>
                                    &gt;
                                </Button>
                            </div>
                        </>
                )}
            </main>
    );
}

export default MainMenu;