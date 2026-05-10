// 1. ייבוא של Hooks מתוך react-redux
import { useSelector } from "react-redux"; 

// 2. שאר הייבואים שכבר יש לך
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import type { RootState } from '../Redux/store';
import Home from '../Pages/HomePage';
export const RootRedirect = () => {
    const { token, isLoggedIn } = useSelector((state: RootState) => state.auth);
    const isTabletSetup = !!localStorage.getItem("roomToken");
  
    if (isTabletSetup) {
      return <Navigate to="/tablet/requests" replace />;
    }
  
    if (isLoggedIn && token) {
      try {
        const decoded: any = jwtDecode(token);
        
        // --- התוספת כאן ---
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
           return <Home />; // הטוקן פג? תישאר בדף הבית
        }
        // ------------------
  
        const userRole = (decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role)?.toLowerCase();
  
        if (userRole === "admin") {
          return <Navigate to="/admin/dashboard" replace />;
        } 
        if (userRole === "employee") {
          return <Navigate to="/staff/dashboard" replace />;
        }
      } catch (e) {
        console.error("Error decoding token in RootRedirect", e);
      }
    }
  
    return <Home />;
  };