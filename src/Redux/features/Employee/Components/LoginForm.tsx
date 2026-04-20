import { useState } from "react";
import { useLoginEmployeeMutation } from "../employeeApi"; 
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { setLogin } from '../authSlice';  
import { jwtDecode } from 'jwt-decode'; 

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState(""); 
  
  const [login, { isLoading }] = useLoginEmployeeMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(""); 
    console.log("--- תחילת תהליך התחברות ---");
    console.log("מנסה להתחבר עם אימייל:", email);
    
    try {
      // 1. קריאה לשרת
      const response = await login({ 
        Email: email, 
        Password: password 
      }).unwrap();
      
      console.log("תגובה גולמית מהשרת:", response);

      // 2. חילוץ הטוקן
      const token = response?.token || response;

      if (token && typeof token === 'string' && token.startsWith('eyJ')) {
        console.log("טוקן חולץ בהצלחה ומזוהה כ-JWT תקין.");

        // 3. עדכון ה-Redux
        dispatch(setLogin({ token }));

        // 4. פענוח והדפסת תוכן הטוקן (כדי לראות מה ה-Backend שלח באמת)
        const decoded: any = jwtDecode(token);
        console.log("תוכן הטוקן המפוענח (Decoded Payload):", decoded);
        
        // חילוץ תפקיד בצורה חכמה - בודק את כל השמות האפשריים לשדה ה-Role
        const role = 
          decoded.role || 
          decoded.Role || 
          decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

        console.log("התפקיד שזוהה בתוך הטוקן:", role);

        // 5. ניתוב חכם עם בדיקה מחמירה
        if (role === 'Admin' || role === 'admin') {
          console.log("זיהוי: מנהל. מנווט לכתובת: /admin/dashboard");
          navigate("/admin/dashboard"); 
        } else if (role === 'Employee' || role === 'employee') {
          console.log("זיהוי: עובד. מנווט לכתובת: /dashboard");
          navigate("/dashboard");
        } else {
          console.warn("אזהרה: התפקיד שחזר אינו מוכר (לא Admin ולא Employee):", role);
          navigate("/dashboard"); // ברירת מחדל
        }

      } else {
        console.error("שגיאה: השרת לא החזיר טוקן בפורמט צפוי. קיבלנו:", response);
        setErrorMsg("השרת לא החזיר מפתח גישה תקין.");
      }

    } catch (err: any) {
      console.error("--- שגיאה קריטית בהתחברות ---");
      console.error("פרטי השגיאה (Error Object):", err);
      
      if (err.status === 401 || err.status === 403) {
        setErrorMsg("המייל או הסיסמה אינם נכונים.");
      } else if (err.status === 'FETCH_ERROR') {
        setErrorMsg("לא ניתן להתחבר לשרת. ודאי שה-API של ה-C# רץ.");
      } else {
        setErrorMsg("קרתה שגיאה בתהליך ההתחברות. בדקי את ה-Console.");
      }
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>כניסת משתמש</h2>
        
        <form onSubmit={handleLogin} style={formStyle}>
          <div>
            <label style={labelStyle}>אימייל</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="your@email.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>סיסמה</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="הזן סיסמה"
              style={inputStyle}
            />
          </div>

          {errorMsg && <div style={errorBannerStyle}>{errorMsg}</div>}

          <button type="submit" disabled={isLoading} style={isLoading ? disabledBtnStyle : btnStyle}>
            {isLoading ? "מתחבר..." : "כניסה למערכת"}
          </button>
        </form>

        <p style={footerTextStyle}>
          עוד לא רשום? 
          <span onClick={() => navigate("/register")} style={linkStyle}> לחץ כאן להרשמה</span>
        </p>
      </div>
    </div>
  );
}

// --- העיצובים נשארים אותו דבר כדי לשמור על המראה שבנית ---
const containerStyle: React.CSSProperties = { direction: 'rtl', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f6', fontFamily: 'Arial, sans-serif' };
const cardStyle: React.CSSProperties = { backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' };
const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '20px' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box' };
const btnStyle: React.CSSProperties = { padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' };
const disabledBtnStyle: React.CSSProperties = { ...btnStyle, backgroundColor: '#ccc', cursor: 'not-allowed' };
const errorBannerStyle: React.CSSProperties = { color: 'white', backgroundColor: '#e74c3c', padding: '10px', borderRadius: '6px', textAlign: 'center', fontSize: '14px' };
const footerTextStyle: React.CSSProperties = { marginTop: '25px', textAlign: 'center', color: '#777' };
const linkStyle: React.CSSProperties = { color: '#007bff', cursor: 'pointer', textDecoration: 'underline', marginRight: '5px' };