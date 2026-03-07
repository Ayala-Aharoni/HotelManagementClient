import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px', direction: 'rtl' }}>
      <h1>דף בית - מלון</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '200px' }}>
        
        {/* כפתור לאורח */}
        <button onClick={() => navigate("/add-request")} style={{ padding: '10px' }}>
          כניסת אורח (שליחת בקשה)
        </button>

        {/* כפתור לעובד */}
        <button onClick={() => navigate("/login")} style={{ padding: '10px' }}>
          כניסת עובד (לוגין)
        </button>
        
      </div>
    </div>
  );
}