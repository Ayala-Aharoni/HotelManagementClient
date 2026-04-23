import { useState } from "react";
import { useLoginEmployeeMutation } from "../employeeApi"; 
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { setLogin } from '../authSlice';  
import { jwtDecode } from 'jwt-decode'; 
import "./Loginform.css";
import staffHeaderImg from "../../../../assets/doors-pict.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // סטייט לעין
  const [errorMsg, setErrorMsg] = useState(""); 
  
  const [login, { isLoading }] = useLoginEmployeeMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(""); 
    try {
      const response = await login({ Email: email, Password: password }).unwrap();
      const token = response?.token || response;

      if (token && typeof token === 'string' && token.startsWith('eyJ')) {
        dispatch(setLogin({ token }));
        const decoded: any = jwtDecode(token);
        const role = decoded.role || decoded.Role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

        // ניתוב מדויק לפי App.tsx
        if (role === 'Admin' || role === 'admin') {
          navigate("/admin/dashboard"); 
        } else {
          navigate("/staff/dashboard"); // התיקון הקריטי כאן
        }
      }
    } catch (err: any) {
      setErrorMsg("אימייל או סיסמה שגויים.");
    }
  };

  return (
    <div className="desktop-wrapper">
      <div className="mobile-frame login-page">
        
        <div className="login-image-header">
          <button className="back-btn-overlay" onClick={() => navigate("/")}>←</button>
          <img src={staffHeaderImg} alt="Staff" className="header-bg-img" />
          <div className="header-overlay-text">
            <h1>Staff Portal</h1>
            <p>SmartStay Management</p>
          </div>
        </div>

        <div className="login-content-area">
          <div className="login-intro">
            <h2>Welcome Back</h2>
            <p>Please sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label>EMAIL</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="Enter your work email"
              />
            </div>

            <div className="input-group">
              <label>PASSWORD</label>
              <div className="password-wrapper" style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••"
                  style={{ width: '100%' }}
                />
                <button 
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>
            </div>

            {errorMsg && <div className="error-msg">{errorMsg}</div>}

            <button type="submit" disabled={isLoading} className="login-submit-btn">
              {isLoading ? "Signing in..." : "SIGN IN"}
            </button>
          </form>

          <div className="login-footer">
            <p>© 2026 SmartStay Staff System</p>
          </div>
        </div>
      </div>
    </div>
  );
}