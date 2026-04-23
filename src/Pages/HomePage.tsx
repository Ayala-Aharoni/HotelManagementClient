import { useNavigate } from "react-router-dom";
import "./Home.css";
import klalipict from "../assets/klali-pict.jpg"; 
import roompict from "../assets/room-pict.jpg"; 


export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="desktop-wrapper">
      <div className="mobile-frame">
        
        {/* כפתור הגדרת טאבלט - נסתר ואלגנטי */}
        <button className="setup-gear" onClick={() => navigate("/tablet/setup")} title="Device Setup">
          ⚙️
        </button>

        <div className="text-header">
          <span>We Bring</span>
          <h1>The Best Hotels<br />For You</h1>
        </div>

        <div className="images-container">
  {/* תמונה עליונה */}
  <div className="img-arch-up">
    {/* כאן את משתמשת בשם שייבאת למעלה */}
    <img src={roompict} alt="Hotel View" />
  </div>
  
  {/* תמונה תחתונה */}
  <div className="img-arch-down">
    {/* וכאן את משתמשת ב-roomPict */}
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
    </div>
  );
}