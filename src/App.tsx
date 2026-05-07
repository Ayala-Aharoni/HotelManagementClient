import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './Redux/store'; 
import { jwtDecode } from 'jwt-decode';
import { Toaster } from 'react-hot-toast';

// ייבוא של ה-Theme וה-Layout (תוודאי שהנתיבים נכונים לפי התיקיות שלך)
import { ThemeProvider } from '@mui/material/styles';
// שימי לב: התיקייה היא Styles (S גדולה) והקובץ הוא Globalthem (t קטנה)
import { GlobalTheme } from "./Styles/Globalthem"; 

// שימי לב: התיקייה היא layot (בלי u) והקובץ הוא mainlayout (m קטנה)
import { MainLayout } from "./Components/layot/mainlayout";

import CssBaseline from "@mui/material/CssBaseline";

// שאר הייבואים שלך...
import Login from './Redux/features/Employee/Components/LoginForm'; 
import RegisterEmployee from './Redux/features/Employee/pages/RegisterForm';
import Dashboard from './Redux/features/Employee/Components/dashboard'; 
import SimpleAddRequest from './Redux/features/Requests/Components/CreateRequest';
import AdminDashboard from './Redux/features/Admin/Components/Admindashboared';
import Home from './Pages/HomePage';
import Setuptablet from './Redux/features/Room/Components/Setuptablet'; 
import EmployeeList from './Redux/features/Employee/pages/employeelist' ;

function App() {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const token = useSelector((state: RootState) => state.auth.token);
  
  const isTabletSetup = !!localStorage.getItem("roomToken");

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
    // 1. עטיפה ב-ThemeProvider כדי שכל ה-MUI יעבוד
    <ThemeProvider theme={GlobalTheme}>
      {/* 2. CssBaseline מאפס את העיצוב של הדפדפן ומחיל את צבע הרקע האפור שרצינו */}
      <CssBaseline /> 
      
      <Toaster 
        position="bottom-center" 
        toastOptions={{
          duration: 3000,
          style: { fontFamily: 'inherit' },
        }}
      />
      
      <Router>
        {/* 3. כאן נכנס ה-MainLayout! הוא עוטף רק את ה-Routes */}
        <MainLayout>
          <Routes>
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

            <Route path="/admin/employees" element={<EmployeeList/>} />
            <Route path="/admin/register-employee" element={<RegisterEmployee />} />
    
            <Route 
              path="/tablet/setup" 
              element={<Setuptablet onComplete={() => window.location.href = "/tablet/requests"} />} 
            />
            
            <Route 
              path="/tablet/requests" 
              element={isTabletSetup ? <SimpleAddRequest /> : <Navigate to="/tablet/setup" replace />} 
            />
    
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
        </MainLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;