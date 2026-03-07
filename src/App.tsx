import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Redux/features/Employee/Components/LoginForm'; 
import RegisterEmployee from './Redux/features/Employee/Components/RegisterForm';
import Dashboard from './Redux/features/Employee/Components/dashboard'; 
// 1. ייבוא הדף החדש (תוודאי שהנתיב נכון לפי המקום שבו שמרת את הקובץ)
import SimpleAddRequest from './Redux/features/Requests/Components/CreateRequest';
import Home from './Pages/HomePage';
function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterEmployee />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* 2. הנתיב החדש לשליחת בקשה */}
        <Route path="/add-request" element={<SimpleAddRequest />} /> 

        <Route path="/" element={<Navigate to="/login" />} /> 
      </Routes>
    </Router>
  );
}

export default App;