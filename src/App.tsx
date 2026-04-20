import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './Redux/store'; 
import { jwtDecode } from 'jwt-decode'; // ודאי שייבאת את זה!

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

  let isAdmin = false;
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      const role = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      isAdmin = (role === "Admin");
      console.log("בדיקת אדמין ב-App:", isAdmin);
    } catch (e) {
      isAdmin = false;
    }
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* --- התחברות --- */}
        <Route 
          path="/login" 
          /* תיקון: אם מחוברת, תבדקי אם לשלוח לאדמין או לעובד */
          element={!isLoggedIn ? <Login /> : <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} />} 
        />
        
        <Route 
          path="/register" 
          element={!isLoggedIn ? <RegisterEmployee /> : <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} />} 
        />

        {/* --- עובד --- */}
        <Route 
          path="/dashboard" 
          /* תיקון: מונע מאדמין להיכנס בטעות לדף עובד (ולהפך) */
          element={isLoggedIn && !isAdmin ? <Dashboard /> : <Navigate to={isAdmin ? "/admin/dashboard" : "/login"} />} 
        />

        {/* --- מנהל --- */}
        <Route 
          path="/admin/dashboard" 
          /* תיקון: מוודא שרק אדמין נכנס */
          element={isLoggedIn && isAdmin ? <AdminDashboard /> : <Navigate to="/login" />} 
        />


        
        
        <Route path="/add-request" element={<SimpleAddRequest />} /> 

        {/* --- Fallback --- */}
        <Route 
          path="*" 
          element={<Navigate to={isLoggedIn ? (isAdmin ? "/admin/dashboard" : "/dashboard") : "/login"} />} 
        />


        <Route>
        <Route path="/room-setup" element={<Setuptablet onComplete={() => console.log("החדר הוגדר בהצלחה!")} />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;