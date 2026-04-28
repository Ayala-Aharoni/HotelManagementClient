import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  TextField, Button, MenuItem, Select, InputLabel, 
  FormControl, Box, Typography, Grid, Alert, 
  InputAdornment, IconButton, CircularProgress 
} from '@mui/material';
import { Visibility, VisibilityOff, Save, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAddEmployeeMutation } from '../employeeApi';
import { useGetAllCategoriesQuery } from '../../Category/CategoryAPI';
import staffHeaderImg from "../../../../assets/doors-pict.jpg"; // ודאי שהנתיב נכון

export default function RegisterEmployee() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    fullname: '',
    role: 1,
    email: '',
    password: '',
    categoryId: ''
  });

  const [register, { isLoading, isError, error, isSuccess }] = useAddEmployeeMutation();
  const { data: categories, isLoading: loadingCats } = useGetAllCategoriesQuery();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const dataToSend = {
        FullName: formData.fullname,
        Email: formData.email,
        PassWord: formData.password,
        Role: formData.role,
        CategoryId: formData.categoryId
      };
  
      // שליחה לשרת
      await register(dataToSend).unwrap();
  
      toast.success("העובד נוסף בהצלחה!");
      setTimeout(() => navigate('/admin/staff'), 2000);
  
    } catch (err: any) {
      console.error("Registration Error:", err);
  
      const errorMessage = 
        (typeof err.data === 'string' ? err.data : err.data?.message) || // בודק אם זה מחרוזת או אובייקט
        (err.data?.errors ? Object.values(err.data.errors).flat()[0] : null) || 
        "אירעה שגיאה בתהליך הרישום";
  
      toast.error(errorMessage as string);
    }
  };
  return (
    <Box className="mobile-view" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Hero Section - בדיוק כמו בתמונה ששלחת */}
      <Box className="hero-section" sx={{ position: 'relative', height: '35%' }}>
        <Box className="overlay-content" sx={{ position: 'absolute', zIndex: 2, p: 4, color: 'white' }}>
           <IconButton onClick={() => navigate(-1)} sx={{ color: 'white', mb: 1, p: 0 }}>
              <ArrowBack />
           </IconButton>
           <Typography variant="h4" fontWeight="800" sx={{ lineHeight: 1.1 }}>
              Register<br/>New Staff
           </Typography>
        </Box>
        <img 
          src={staffHeaderImg} 
          alt="Staff Header" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderBottomLeftRadius: '90px' }} 
        />
      </Box>

      {/* Form Content */}
      <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
        {isSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: '15px' }}>נרשם בהצלחה!</Alert>}
        {isError && <Alert severity="error" sx={{ mb: 2, borderRadius: '15px' }}>שגיאה ברישום</Alert>}

        <form onSubmit={handleRegister}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                variant="filled"
                required
                InputProps={{ disableUnderline: true, sx: { borderRadius: '15px' } }}
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="filled"
                required
                InputProps={{ disableUnderline: true, sx: { borderRadius: '15px' } }}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                variant="filled"
                required
                InputProps={{
                  disableUnderline: true,
                  sx: { borderRadius: '15px' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth variant="filled">
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  disableUnderline
                  sx={{ borderRadius: '15px' }}
                  onChange={(e) => setFormData({ ...formData, role: Number(e.target.value) })}
                >
                  <MenuItem value={0}>Admin</MenuItem>
                  <MenuItem value={1}>Employee</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth variant="filled">
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.categoryId}
                  disableUnderline
                  sx={{ borderRadius: '15px' }}
                  required
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  {loadingCats ? <MenuItem disabled><CircularProgress size={20} /></MenuItem> : 
                    categories?.map((cat: any) => (
                      <MenuItem key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={isLoading}
                sx={{ 
                  bgcolor: '#1a1a1a', 
                  color: 'white', 
                  py: 2, 
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  '&:hover': { bgcolor: '#333' }
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Complete Registration"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Box>
  );
}