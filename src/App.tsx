import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './Redux/store'; 
import { jwtDecode } from 'jwt-decode';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from './Components/ProtectedRoute'; 
import { RootRedirect } from './Components/RootRedirect';

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
import EditEmployee from './Redux/features/Employee/pages/EditEmployee'; 
import Dashboard from './Redux/features/Employee/Components/dashboard'; 
import SimpleAddRequest from './Redux/features/Requests/Components/CreateRequest';
import AdminDashboard from './Redux/features/Admin/Components/Admindashboared';
import Home from './Pages/HomePage';
import Setuptablet from './Redux/features/Room/Components/Setuptablet'; 
import EmployeeList from './Redux/features/Employee/pages/employeelist' ;
import CategoriesPage from './Redux/features/Category/Components/CategoryManagement.tsx';  

function App() {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const token = useSelector((state: RootState) => state.auth.token);
  
  const isTabletSetup = !!localStorage.getItem("roomToken");

  

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
          <Route path="/" element={<RootRedirect />} />
           <Route path="/staff/login" element={<Login />} />

           
              {/* --- עמודי מנהל מוגנים (Admin) --- */}
              <Route 
  path="/admin/dashboard" 
  element={
    <ProtectedRoute allowedRole="Admin">
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
<Route 
    path="/admin/employees" 
    element={
      <ProtectedRoute allowedRole="Admin">
        <EmployeeList />
      </ProtectedRoute>
    } 
  />
  <Route 
  path="/admin/categories" 
  element={
    <ProtectedRoute allowedRole="Admin">
      <CategoriesPage /> {/* או איך שקראת לקומפננטה */}
    </ProtectedRoute>
  } 
/>


  <Route 
    path="/admin/register-employee" 
    element={
      <ProtectedRoute allowedRole="Admin">
        <RegisterEmployee />
      </ProtectedRoute>
    } 
  />
  <Route 
    path="/admin/staff/edit/:id" 
    element={
      <ProtectedRoute allowedRole="Admin">
        <EditEmployee />
      </ProtectedRoute>
    } 
/>

  {/* --- עמודי עובד מוגנים (Staff) --- */}
  <Route 
    path="/staff/dashboard" 
    element={
      <ProtectedRoute allowedRole="employee">
        <Dashboard />
      </ProtectedRoute>
    } 
  />

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
        ? <Navigate to="/staff/dashboard" replace /> 
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