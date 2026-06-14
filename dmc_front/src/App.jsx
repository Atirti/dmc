import "./App.css"
import {Navigate, Route, Routes} from "react-router-dom";
import LoginWindow from "./View/Autin/LoginWindow/LoginWIndow.jsx";
import MainWindow from "./View/MainWindow/MainWindow.jsx";
import Cart from "./View/CartWindow/Cart.jsx";
import Profile from "./View/ProfileWindow/Profile.jsx";
import ItemWindow from "./View/ItemWindow/ItemWindow.jsx";
import RegisterWindow from "./View/Autin/RegisterWindow/RegisterWindow.jsx";
import {PublicRoute, ProtectedRoute} from "./Controll/APIStuff/Routes.jsx";
import OrderplaceWindow from "./View/OrderplaceWindow/OrderplaceWindow.jsx";

function App() {
    return (
            <div className="App">
                <main className="pageContent">
                    <Routes>
                        <Route element={<PublicRoute/>}>
                            <Route path="/" element={<LoginWindow/>}/>
                            <Route path="/registration" element={<RegisterWindow/>}/>
                        </Route>

                        <Route path="/home" element={<MainWindow/>} />
                        <Route path="/home/item/:id" element={<ItemWindow/>}/>

                        <Route element={<ProtectedRoute/>}>
                            <Route path="/cart" element={<Cart/>}/>
                            <Route path="/profile" element={<Profile/>}/>
                            <Route path="/order" element={<OrderplaceWindow/>}/>
                         </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
    );
}

export default App;