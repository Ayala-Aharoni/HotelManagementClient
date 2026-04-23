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
  const [showPassword, setShowPassword] = useState(false); // לוגיקה פשוטה להצגת סיסמה
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
        navigate(role === 'Admin' || role === 'admin' ? "/admin/dashboard" : "/dashboard");
      }
    } catch (err: any) {
      setErrorMsg("Invalid credentials.");
    }
  };

  return (
    <div className="desktop-wrapper">
      <div className="mobile-frame login-page">
        
        <div className="login-image-header">
          <button className="back-btn-overlay" onClick={() => navigate("/")}>←</button>
          <img src={staffHeaderImg} alt="Hotel Staff" className="header-bg-img" />
          <div className="header-overlay-text">
            <h1>Staff Portal</h1>
            <p>SmartStay Management</p>
          </div>
        </div>

        <div className="login-content-area">
          <div className="login-intro">
            <h2>Welcome Back</h2>
            <p>Please sign in to your workspace</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-field">
              <label>EMAIL</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="name@hotel.com"
              />
            </div>

            <div className="input-field password-field">
              <label>PASSWORD</label>
              <div className="input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  className="eye-icon" 
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