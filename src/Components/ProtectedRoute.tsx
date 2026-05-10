import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from './Redux/store';
import { jwtDecode } from "jwt-decode";

interface ProtectedRouteProps {
  children: JSX.Element;    // העמוד שאנחנו רוצים להציג
  allowedRole?: string;     // התפקיד המורשה (אופציונלי)
}

export const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  // שליפת הטוקן מה-Redux (כפי שמוגדר ב-authSlice שלך)
  const { token } = useSelector((state: RootState) => state.auth);

  // 1. בדיקה: האם המשתמש בכלל מחובר?
  if (!token) {
    return <Navigate to="/staff/login" replace />;
  }

  try {
    const decoded: any = jwtDecode(token);
    
    // 1. שליפת התפקיד מהשדה הארוך של ה-JWT
    const userRole = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role;

    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      return <Navigate to="/" replace />;
    }

    // 2. בדיקת התאמה חסינה (הופכים את שניהם לאותיות קטנות)
    if (allowedRole) {
      const hasAccess = userRole?.toString().toLowerCase() === allowedRole.toLowerCase();
      
      if (!hasAccess) {
        console.warn(`Access denied. User role: ${userRole}, Required: ${allowedRole}`);
        return <Navigate to="/" replace />;
      }
    }

    return children;

  } catch (error) {
    return <Navigate to="/" replace />;
  }
};