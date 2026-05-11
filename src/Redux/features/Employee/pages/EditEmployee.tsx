import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  TextField, Button, MenuItem, Select, InputLabel, 
  FormControl, Box, Typography, Grid, Alert, 
  InputAdornment, IconButton, CircularProgress 
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBackIosNew } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetAllEmployeesQuery, useUpdateEmployeeMutation } from '../employeeApi'; // ודאי ייבוא נכון
import { useGetAllCategoriesQuery } from '../../Category/CategoryAPI';
import staffHeaderImg from "../../../../assets/doors-pict.jpg";

export default function EditEmployee() {
  const { id } = useParams(); // שליפת ה-ID מה-URL
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  
  // שליפת נתוני העובדים כדי למצוא את העובד הספציפי
  const { data: employees } = useGetAllEmployeesQuery();
  const { data: categories, isLoading: loadingCats } = useGetAllCategoriesQuery();
  const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();

  const [formData, setFormData] = useState({
    fullname: '',
    role: 1,
    email: '',
    password: '',
    categoryId: ''
  });

  // מילוי השדות בנתונים הקיימים ברגע שהם נטענים
  useEffect(() => {
    if (employees && id) {
      const employee = employees.find((e: any) => e.employeeId === Number(id));
      if (employee) {
        setFormData({
          fullname: employee.fullname || '',
          email: employee.email || '',
          role: employee.role ?? 1,
          categoryId: employee.categoryId || '',
          password: '' // בדרך כלל לא מושכים סיסמה מהשרת מטעמי אבטחה
        });
      }
    }
  }, [employees, id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. הכנת האובייקט בדיוק לפי ה-DTO שיצרנו ב-C#
    const dataToSend = {
      FullName: formData.fullname,
      Email: formData.email,
      PassWord: formData.password || null, // אם ריק, נשלח null
      Role: formData.role,
      CategoryId: formData.categoryId
    };
  
    try {
      // 2. שימי לב למפתח 'data' - הוא חייב להתאים למה שכתוב ב-API
      await updateEmployee({ 
        id: Number(id), 
        data: dataToSend 
      }).unwrap();
  
      toast.success("פרטי העובד עודכנו בהצלחה!");
      navigate('/admin/staff');
    } catch (err) {
      console.error(err);
      toast.error("אופס... משהו השתבש בעדכון");
    }
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'white' }}>
      
      {/* Header - זהה לרגיסטר */}
      <Box sx={{ position: 'relative', height: '30%', width: '100%' }}>
        <IconButton 
          onClick={() => navigate(-1)}
          sx={{ position: 'absolute', top: 20, left: 20, zIndex: 10, bgcolor: 'rgba(255,255,255,0.3)' }}
        >
          <ArrowBackIosNew sx={{ color: 'white', fontSize: 18 }} />
        </IconButton>
        <Box component="img" src={staffHeaderImg} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <Box sx={{ 
          position: 'absolute', inset: 0, 
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8))',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: 3, color: 'white'
        }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Edit Profile</Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>Update staff information</Typography>
        </Box>
      </Box>

      {/* Form Section */}
      <Box sx={{ p: 4, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <TextField
            fullWidth label="Full Name" required
            value={formData.fullname}
            onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
          />

          <TextField
            fullWidth label="Email" type="email" required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <TextField
            fullWidth label="New Password (Leave blank to keep current)"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth>
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
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  label="Department"
                  value={formData.categoryId}
                  required
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  {categories?.map((cat: any) => (
                    <MenuItem key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Button 
            type="submit" variant="contained" size="large"
            disabled={isUpdating}
            sx={{ mt: 2, py: 2, borderRadius: '12px', fontWeight: 700, bgcolor: '#1c1c1e' }}
          >
            {isUpdating ? <CircularProgress size={24} color="inherit" /> : "UPDATE DETAILS"}
          </Button>
        </form>
      </Box>
    </Box>
  );
}