import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  TextField, Button, MenuItem, Select, InputLabel, 
  FormControl, Box, Typography, Grid, Alert, 
  InputAdornment, IconButton, CircularProgress 
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBackIosNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAddEmployeeMutation } from '../employeeApi';
import { useGetAllCategoriesQuery } from '../../Category/CategoryAPI';
import staffHeaderImg from "../../../../assets/doors-pict.jpg";

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

  const [register, { isLoading, isError, isSuccess }] = useAddEmployeeMutation();
  const { data: categories, isLoading: loadingCats } = useGetAllCategoriesQuery();

  // --- הפונקציה המקורית שלך ללא שינוי פסיק! ---
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
        (typeof err.data === 'string' ? err.data : err.data?.message) || 
        (err.data?.errors ? Object.values(err.data.errors).flat()[0] : null) || 
        "אירעה שגיאה בתהליך הרישום";
  
      toast.error(errorMessage as string);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'white' }}>
      
      {/* Header Section - Design from Login */}
      <Box sx={{ position: 'relative', height: '35%', width: '100%' }}>
        <IconButton 
          onClick={() => navigate(-1)}
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
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8))',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          p: 3, color: 'white'
        }}>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
            Register<br/>New Staff
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>SmartStay Administration</Typography>
        </Box>
      </Box>

      {/* Form Section */}
      <Box sx={{ p: 4, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Account Details</Typography>
          <Typography variant="body2" color="text.secondary">Fill in the information below</Typography>
        </Box>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {isSuccess && <Alert severity="success">נרשם בהצלחה!</Alert>}
          {isError && <Alert severity="error">שגיאה ברישום</Alert>}

          <TextField
            fullWidth
            label="Full Name"
            variant="outlined"
            required
            value={formData.fullname}
            onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            variant="outlined"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
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
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Role</InputLabel>
                <Select
                  label="Role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: Number(e.target.value) })}
                >
                  <MenuItem value={0}>Admin</MenuItem>
                  <MenuItem value={1}>Employee</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Department</InputLabel>
                <Select
                  label="Department"
                  value={formData.categoryId}
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
          </Grid>

          <Button 
            type="submit" 
            variant="contained" 
            size="large"
            disabled={isLoading}
            sx={{ 
              mt: 2, py: 2, borderRadius: '12px', fontWeight: 700, bgcolor: '#1c1c1e',
              '&:hover': { bgcolor: '#333' }
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "COMPLETE REGISTRATION"}
          </Button>
        </form>
      </Box>
    </Box>
  );
}