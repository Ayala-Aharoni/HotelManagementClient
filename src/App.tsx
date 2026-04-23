import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './Redux/store'; 
import { jwtDecode } from 'jwt-decode';

import Login from './Redux/features/Employee/Components/LoginForm'; 
import RegisterEmployee from './Redux/features/Employee/Components/RegisterForm';
import Dashboard from './Redux/features/Employee/Components/dashboard'; 
import SimpleAddRequest from './Redux/features/Requests/Components/CreateRequest';
import AdminDashboard from './Redux/features/Admin/Components/Admindashboared';
import Home from './Pages/HomePage';
import Setuptablet from './Redux/features/Room/Components/Setuptablet'; 

function App() {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const token = useSelector((state: RootState) => state.auth.token);
  
  // בדיקה בזמן אמת אם המכשיר מוגדר כטאבלט
  const isTabletSetup = !!localStorage.getItem("roomToken");

  // חילוץ תפקיד מהטוקן
  let isAdmin = false;
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      const role = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      isAdmin = (role === "Admin" || role === "admin");
    } catch (e) {
      isAdmin = false;
    }
  }

  return (
    <Router>
      <Routes>
        
        {/* 1. דף הבית - הנתב הראשי */}
        <Route 
          path="/" 
          element={
            isTabletSetup 
              ? <Navigate to="/tablet/requests" replace /> 
              : isLoggedIn 
                ? <Navigate to={isAdmin ? "/admin/dashboard" : "/staff/dashboard"} replace /> 
                : <Home />
          } 
        />

        {/* 2. עולם העובדים והניהול */}
        <Route 
          path="/staff/login" 
          element={!isLoggedIn ? <Login /> : <Navigate to={isAdmin ? "/admin/dashboard" : "/staff/dashboard"} replace />} 
        />
        
        <Route 
          path="/staff/register" 
          element={!isLoggedIn ? <RegisterEmployee /> : <Navigate to={isAdmin ? "/admin/dashboard" : "/staff/dashboard"} replace />} 
        />

        <Route 
          path="/staff/dashboard" 
          element={isLoggedIn && !isAdmin ? <Dashboard /> : <Navigate to="/staff/login" replace />} 
        />

        <Route 
          path="/admin/dashboard" 
          element={isLoggedIn && isAdmin ? <AdminDashboard /> : <Navigate to="/staff/login" replace />} 
        />

        {/* 3. עולם הטאבלט (Guest Experience) */}
        <Route 
          path="/tablet/setup" 
          element={<Setuptablet onComplete={() => window.location.href = "/tablet/requests"} />} 
        />
        
        <Route 
          path="/tablet/requests" 
          element={isTabletSetup ? <SimpleAddRequest /> : <Navigate to="/tablet/setup" replace />} 
        />

        {/* 4. הגנה על כל נתיב אחר (Fallback) */}
        <Route 
          path="*" 
          element={
            isTabletSetup 
              ? <Navigate to="/tablet/requests" replace /> 
              : isLoggedIn 
                ? <Navigate to={isAdmin ? "/admin/dashboard" : "/staff/dashboard"} replace /> 
                : <Navigate to="/" replace />
          } 
        />

      </Routes>
    </Router>
  );
}

export default App;