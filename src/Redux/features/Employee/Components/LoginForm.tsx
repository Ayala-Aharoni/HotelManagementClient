import { useState } from "react";
import { useLoginEmployeeMutation } from "../employeeApi"; 
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { setLogin } from '../authSlice';  
import { jwtDecode } from 'jwt-decode'; 
import { 
  Box, TextField, Button, Typography, IconButton, InputAdornment, Alert 
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBackIosNew } from '@mui/icons-material';
import staffHeaderImg from "../../../../assets/doors-pict.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      if (token) {
        dispatch(setLogin({ token }));
        const decoded: any = jwtDecode(token);
        const role = decoded.role || "staff";

        // navigate(role.toLowerCase() === 'admin' ? "/admin/dashboard" : "/staff/dashboard");
        navigate("/");
      }
    } catch (err: any) {
      setErrorMsg(err.data?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'white' }}>
      
      {/* Header Section */}
      <Box sx={{ position: 'relative', height: '35%', width: '100%' }}>
        <IconButton 
          onClick={() => navigate("/")}
          sx={{ 
            position: 'absolute', top: 20, left: 20, zIndex: 10,
            bgcolor: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' }
          }}
        >
          <ArrowBackIosNew sx={{ color: 'white', fontSize: 18 }} />
        </IconButton>
        <Box 
          component="img" 
          src={staffHeaderImg} 
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <Box sx={{ 
          position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          p: 3, color: 'white'
        }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Staff Portal</Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>SmartStay Management</Typography>
        </Box>
      </Box>

      {/* Form Section */}
      <Box sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Welcome Back</Typography>
          <Typography variant="body2" color="text.secondary">Please sign in to your account</Typography>
        </Box>

        <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
          
          <TextField
            label="Email Address"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TextField
            label="Password"
            variant="outlined"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button 
            type="submit" 
            variant="contained" 
            size="large"
            disabled={isLoading}
            sx={{ 
              py: 2, borderRadius: '12px', fontWeight: 700, bgcolor: '#1c1c1e',
              '&:hover': { bgcolor: '#333' }
            }}
          >
            {isLoading ? "Signing in..." : "SIGN IN"}
          </Button>
        </Box>

        <Typography variant="caption" sx={{ mt: 'auto', textAlign: 'center', color: 'text.disabled' }}>
          © 2026 SmartStay Staff System
        </Typography>
      </Box>
    </Box>
  );
}