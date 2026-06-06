import LeftPanel from "./components/NavigationBar/LeftPanel.jsx";
import { Route, Routes } from "react-router-dom";
import MainWindow from "./JSX Windows/MainWindow/MainWindow.jsx";
import Cart from "./JSX Windows/CartWindow/Cart.jsx";
import "./App.css"

function App() {
    return (
            <div className="App">
                <LeftPanel/>
                <main className="pageContent">
                <Routes>
                    <Route path="/" element={<MainWindow />} />
                    <Route path="/home" element={<MainWindow/>} />
                    <Route path="/cart" element={<Cart/>} />
                </Routes>
                </main>
            </div>
    );
}

export default App;