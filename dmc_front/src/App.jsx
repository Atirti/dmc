import "./App.css"
import { Route, Routes, useLocation } from "react-router-dom";
import LoginWindow from "./JSX Windows/Autin/LoginWindow/LoginWIndow.jsx";
import MainWindow from "./JSX Windows/MainWindow/MainWindow.jsx";
import Cart from "./JSX Windows/CartWindow/Cart.jsx";
import Profile from "./JSX Windows/ProfileWindow/Profile.jsx";
import ItemWindow from "./JSX Windows/ItemWindow/ItemWindow.jsx";
import RegisterWindow from "./JSX Windows/Autin/RegisterWindow/RegisterWindow.jsx";

function App() {
    const location = useLocation();
    if (location.pathname === "/") {
        return (<LoginWindow/>)
    }
    return (
            <div className="App">
                <main className="pageContent">
                <Routes>
                    <Route path="/registration" element={<RegisterWindow/>}/>
                    <Route path="/home" element={<MainWindow/>} />
                    <Route path="/cart" element={<Cart/>} />
                    <Route path="/profile" element={<Profile />}/>
                    <Route path="/home/item/:id" element={<ItemWindow/>}/>
                </Routes>
                </main>
            </div>
    );
}

export default App;