import { useState } from "react";
import { useLoginEmployeeMutation } from "../employeeApi";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState(""); 
  
  const [login, { isLoading }] = useLoginEmployeeMutation();
  const navigate = useNavigate();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setErrorMsg(""); 
    
    try {
      // שליחת הבקשה לשרת
      const response = await login({ 
        Email: email, 
        Password: password 
      }).unwrap();
      
      console.log("התגובה מהשרת:", response);

      // --- שמירת הטוקן ב-LocalStorage ---
      // בודק אם הטוקן נמצא בתוך שדה token או שהוא ה-response עצמו
      const token = response?.token || response;

      if (token && typeof token === 'string' && token.startsWith('eyJ')) {
        localStorage.setItem("token", token);
        console.log("הטוקן נשמר בהצלחה! ✅");
        
        // מעבר לעמוד ה-Dashboard רק אחרי שהטוקן נשמר
        navigate("/dashboard"); 
      } else {
        console.error("השרת לא החזיר טוקן תקין:", response);
        setErrorMsg("שגיאה בקבלת מפתח גישה מהשרת.");
      }

    } catch (err: any) {
      console.error("פרטי השגיאה המלאים:", err);
      
      if (err.status === 401 || err.status === 403) {
        setErrorMsg("המייל או הסיסמה אינם נכונים.");
      } else if (err.status === 400) {
        setErrorMsg("נתונים לא תקינים. ודאי שהזנת מייל וסיסמה.");
      } else if (err.status === 'FETCH_ERROR') {
        setErrorMsg("לא ניתן להתחבר לשרת. ודאי ש-Visual Studio פועל.");
      } else {
        setErrorMsg("קרתה שגיאה בתהליך ההתחברות.");
      }
    }
  };

  return (
    <div style={{ direction: 'rtl', padding: '20px', maxWidth: '400px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2 style={{ textAlign: 'center' }}>התחברות למערכת</h2>
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>מייל:</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="example@mail.com"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', marginTop: '5px' }}
          />
        </div>

        <div>
          <label>סיסמה:</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="הזן סיסמה"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', marginTop: '5px' }}
          />
        </div>

        {errorMsg && (
          <div style={{ color: 'white', backgroundColor: '#ff4d4d', padding: '10px', borderRadius: '4px', textAlign: 'center', fontSize: '14px' }}>
            {errorMsg}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            padding: '12px', 
            backgroundColor: isLoading ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            marginTop: '10px'
          }}
        >
          {isLoading ? "מתחבר..." : "כניסה"}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        עוד לא רשום? 
        <span 
          onClick={() => navigate("/register")} 
          style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline', marginRight: '5px' }}
        >
          לחץ כאן להרשמה
        </span>
      </p>
    </div>
  );
}