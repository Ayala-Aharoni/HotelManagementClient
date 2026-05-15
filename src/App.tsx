import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './Redux/store'; 
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from './Components/ProtectedRoute'; 
import { RootRedirect } from './Components/RootRedirect';

// ייבוא של ה-Theme וה-Layout
import { ThemeProvider } from '@mui/material/styles';
import { GlobalTheme } from "./Styles/Globalthem"; 
import { MainLayout } from "./Components/layot/mainlayout";
import CssBaseline from "@mui/material/CssBaseline";


import ReceptionDashboard from './Redux/features/Employee/Pages/ReceptionDashboard.tsx';; 

// שאר הייבואים הקיימים
import Login from './Redux/features/Employee/Components/LoginForm'; 
import RegisterEmployee from './Redux/features/Employee/pages/RegisterForm';
import EditEmployee from './Redux/features/Employee/pages/EditEmployee'; 
import Dashboard from './Redux/features/Employee/Components/dashboard'; 
import SimpleAddRequest from './Redux/features/Requests/Components/CreateRequest';
import AdminDashboard from './Redux/features/Admin/Components/Admindashboared';
import Setuptablet from './Redux/features/Room/Components/Setuptablet'; 
import EmployeeList from './Redux/features/Employee/pages/employeelist' ;
import CategoriesPage from './Redux/features/Category/Components/CategoryManagement.tsx';  
import RoomManagement from './Redux/features/Room/Components/EditRoom';  

function App() {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const isTabletSetup = !!localStorage.getItem("roomToken");

  return (
    <ThemeProvider theme={GlobalTheme}>
      <CssBaseline /> 
      <Toaster 
        position="bottom-center" 
        toastOptions={{
          duration: 3000,
          style: { fontFamily: 'inherit' },
        }}
      />
      <Router>
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
                  <CategoriesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
  path="/admin/rooms" 
  element={
    <ProtectedRoute allowedRole="admin">
      <RoomManagement />
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

            {/* הוספת הראוט של הקבלה */}
            <Route 
              path="/staff/reception-dashboard" 
              element={
                <ProtectedRoute allowedRole="employee">
                  <ReceptionDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/staff/dashboard" 
              element={
                <ProtectedRoute allowedRole="employee">
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* --- טאבלט --- */}
            <Route 
              path="/tablet/setup" 
              element={<Setuptablet onComplete={() => window.location.href = "/tablet/requests"} />} 
            />
            <Route 
              path="/tablet/requests" 
              element={isTabletSetup ? <SimpleAddRequest /> : <Navigate to="/tablet/setup" replace />} 
            />

            {/* --- ניתוב ברירת מחדל (Catch-all) --- */}
            <Route 
              path="*" 
              element={
                isTabletSetup 
                  ? <Navigate to="/tablet/requests" replace /> 
                  : isLoggedIn
                    ? <RootRedirect /> // שינוי חשוב: במקום לנחש דשבורד רגיל, משתמשים בלוגיקה של הניתוב החכם
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