import "./App.css"
import {Navigate, Route, Routes} from "react-router-dom";
import LoginWindow from "./JSX Windows/Autin/LoginWindow/LoginWIndow.jsx";
import MainWindow from "./JSX Windows/MainWindow/MainWindow.jsx";
import Cart from "./JSX Windows/CartWindow/Cart.jsx";
import Profile from "./JSX Windows/ProfileWindow/Profile.jsx";
import ItemWindow from "./JSX Windows/ItemWindow/ItemWindow.jsx";
import RegisterWindow from "./JSX Windows/Autin/RegisterWindow/RegisterWindow.jsx";
import {PublicRoute, ProtectedRoute} from "./APIStuff/Autentification/Routes.jsx";

function App() {
    return (
            <div className="App">
                <main className="pageContent">
                    <Routes>
                        <Route element={<PublicRoute/>}>
                            <Route path="/" element={<LoginWindow/>}/>
                            <Route path="/registration" element={<RegisterWindow/>}/>
                            <Route path="/home" element={<MainWindow/>} />
                            <Route path="/home/item/:id" element={<ItemWindow/>}/>
                        </Route>
                        <Route element={<ProtectedRoute/>}>
                            <Route path="/cart" element={<Cart/>}/>
                            <Route path="/profile" element={<Profile/>}/>
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
    );
}

export default App;