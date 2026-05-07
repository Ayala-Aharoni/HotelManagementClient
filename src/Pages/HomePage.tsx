import { useNavigate } from "react-router-dom";
import "./Home.css";
import klalipict from "../assets/klali-pict.jpg"; 
import roompict from "../assets/room-pict.jpg"; 


export default function Home() {
  const navigate = useNavigate();

  return (
    // משתמשים ב-div אחד פשוט שמרכז את התוכן הפנימי עם ה-padding המקורי שלך
    <div className="home-content"> 
      
    

      <div className="text-header">
        <span>We Bring</span>
        <h1>The Best Hotels<br />For You</h1>
      </div>

      <div className="images-container">
        <div className="img-arch-up">
          <img src={roompict} alt="Hotel View" />
        </div>
        <div className="img-arch-down">
          <img src={klalipict} alt="Hotel Room" />
        </div>
      </div>

      <div className="pagination-dots">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot active"></div>
      </div>

      <div className="auth-buttons-group">
        <button className="btn-black" onClick={() => navigate("/staff/login")}>
          STAFF LOGIN
        </button>
        <button className="btn-black" onClick={() => navigate("/tablet/requests")}>
          TABLET SIGN IN
        </button>
      </div>

      <div className="footer-copyright">
        © 2026 SmartStay System
      </div>
    </div>
  );
}