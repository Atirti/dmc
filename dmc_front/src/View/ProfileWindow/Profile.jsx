import LeftPanel from "../NavigationBar/LeftPanel.jsx";
import "./ProfileCSS.css"
import {MdAccountCircle, MdLogout} from "react-icons/md";
import {useAuth} from "../../Controll/APIStuff/Autentification/AuthContext.jsx";
import {useNavigate} from "react-router-dom";


function Profile () {
    const navigate = useNavigate();
    const { logout } = useAuth();

    async function handleLogout() {
        try {
            await logout();
            navigate("/");
        } catch (error) {
            alert(error.message);
            navigate("/", {replace: true});
        }
    }
    return (
            <div className="Profile">
                <LeftPanel/>

                <main>
                    <div className="profilePage">
                        <div className="profilePageHeader">
                            <MdAccountCircle  size={100} className="profileImg"  alt="" />
                            <div className="profileUserStuff">
                                <div className="profileUsername" datasrc="Placeholder">Username Placeholder</div>
                                <button onClick={handleLogout} className="Exit">
                                    <MdLogout size={25} />Выход</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
    );
}
export default Profile;