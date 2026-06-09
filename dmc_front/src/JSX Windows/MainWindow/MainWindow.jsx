import "./MainWindowCSS.css";
import MainMenu from "../../components/MainMenu/MainMenu.jsx";
import LeftPanel from "../../components/NavigationBar/LeftPanel.jsx";


function MainWindow() {
    return (
            <div className="MainWindow">
                <LeftPanel/>
                <div className="mainMenu"><MainMenu /></div>
            </div>
    );
}

export default MainWindow;