import "./ItemWindowCSS.css";
import LeftPanel from "../../components/NavigationBar/LeftPanel.jsx";
import { itemsList } from "../../Data/ItemList.jsx";
import {useNavigate, useParams} from "react-router-dom";


function ItemWindow() {
    const { id} = useParams();
    const item = itemsList.find((item) => item.id === Number(id))
    const  navigate = useNavigate();
    function handleNavigate(){
        navigate("/cart")
    }
    return (
            <div className="itemWindow">
                <LeftPanel />
                <main className="itemContent">
                    <div className="itemImageBlock">
                        <img className="itemImage" src={item.picture_url} alt={item.title}/>
                    </div>
                    <div className="itemPanel">
                        <h1 className="itemPageTitle">{item.title}</h1>
                        <p className="Description">Описание:</p>
                        <p className="itemDescription">{item.description}</p>
                        <p className="itemPagePrice">{item.price} Рублей</p>
                        <button className="toCartButton" onClick={handleNavigate}>Купить</button>
                    </div>
                </main>
            </div>
    );
}

export default ItemWindow;