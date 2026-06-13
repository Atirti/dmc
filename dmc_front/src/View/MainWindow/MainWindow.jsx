import "./MainWindowCSS.css";
import MainMenu from "../MainMenu/MainMenu.jsx";
import LeftPanel from "../NavigationBar/LeftPanel.jsx";


function MainWindow() {
    return (
            <div className="MainWindow">
                <LeftPanel/>
                <div className="mainMenu"><MainMenu /></div>
            </div>
    );
}

export default MainWindow;