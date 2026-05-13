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
  console.log("RootRedirect is running! isLoggedIn:", isLoggedIn, "token exists:", !!token);
  if (isTabletSetup) {
    return <Navigate to="/tablet/requests" replace />;
  }

  if (isLoggedIn && token) {
    try {
      const decoded: any = jwtDecode(token);
      console.log("This is my decoded token:", decoded);
      
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        return <Home />; 
      }

      const userRole = (decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role)?.toLowerCase();
      
      // שליפת ה-CategoryId מהטוקן
      // שים לב: תוודא שזה השם המדויק של ה-Key בתוך ה-JWT שלך
      const categoryId = decoded.CategoryId || decoded.categoryId;

      if (userRole === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
      }

      if (userRole === "employee") {
        // כאן הקסם: אם הוא עובד והוא שייך לקטגוריה 4 (קבלה)
        // תחליף את ה-'4' במזהה האמיתי של הקבלה אצלך ב-DB
        if (Number(categoryId) === 4) {
          return <Navigate to="/staff/reception-dashboard" replace />;
        }
        
        // עובד רגיל (ניקיון, תחזוקה וכו')
        return <Navigate to="/staff/dashboard" replace />;
      }
    } catch (e) {
      console.error("Error decoding token in RootRedirect", e);
    }
  }

  return <Home />;
};