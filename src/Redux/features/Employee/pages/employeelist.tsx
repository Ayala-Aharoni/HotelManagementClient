import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Grid, Avatar, IconButton, 
  Badge, Button, MenuItem, Select, FormControl, TextField
} from '@mui/material';
import { 
  ArrowBack, NotificationsNone, Add, Search, 
  AccessTime, CalendarToday 
} from '@mui/icons-material';

import { useGetAllEmployeesQuery, useDeleteEmployeeMutation, type Employee } from '../employeeApi';
import { useGetAllCategoriesQuery } from '../../Category/CategoryAPI';
import EmployeeCard from '../Components/employeeCard'; 
import staffHeaderImg from "../../../../assets/doors-pict.jpg";

export default function EmployeeList() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [deleteEmployee] = useDeleteEmployeeMutation();
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: employees = [], isLoading } = useGetAllEmployeesQuery();
  const { data: categories } = useGetAllCategoriesQuery();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp: Employee) => {
      const matchesSearch = emp.fullname?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAvailability = !showOnlyAvailable || emp.isAviable === true;
      const matchesCategory = selectedCategory === 'all' || emp.categoryId === selectedCategory;
      return matchesSearch && matchesAvailability && matchesCategory;
    });
  }, [employees, searchTerm, showOnlyAvailable, selectedCategory]);

  const handleDeleteEmployee = async (id: number) => {
    if (window.confirm("האם את בטוחה שברצונך להסיר את העובד מהמערכת?")) {
      try {
        await deleteEmployee(id).unwrap();
        console.log("העובד נמחק בהצלחה");
      } catch (error) {
        console.error("שגיאה במחיקת עובד:", error);
      }
    }
  };

  if (isLoading) return <Box sx={{ p: 5, textAlign: 'center' }}>Loading Staff...</Box>;

  return (
    <Box sx={{ bgcolor: '#F8F9FA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Section */}
      <Box sx={{ position: 'relative', height: '220px', color: 'white', overflow: 'hidden', borderRadius: '0 0 40px 40px' }}>
        <Box component="img" src={staffHeaderImg} sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} />
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))', zIndex: 2 }} />
        <Box sx={{ position: 'relative', zIndex: 3, p: 3, pb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => navigate(-1)} sx={{ color: 'white', p: 0 }}><ArrowBack /></IconButton>
              <Avatar sx={{ width: 50, height: 50, border: '2px solid #D4AF37', bgcolor: '#D4AF37' }}>M</Avatar>
              <Box>
                <Typography variant="h6" fontWeight="700">Good Morning,</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Admin Manager</Typography>
              </Box>
            </Box>
            <IconButton sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)' }}>
              <Badge color="error" variant="dot"><NotificationsNone /></Badge>
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarToday sx={{ fontSize: 14, color: '#D4AF37' }} /> {currentTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
            </Typography>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTime sx={{ fontSize: 14, color: '#D4AF37' }} /> {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Filters Area */}
      <Box sx={{ p: 2, mt: 1 }}>
        <TextField
          fullWidth
          placeholder="Search for staff..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '15px', bgcolor: 'white' } }}
          InputProps={{ startAdornment: <Search sx={{ color: 'gray', mr: 1 }} /> }}
        />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant={showOnlyAvailable ? "contained" : "outlined"}
              onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
              sx={{ 
                borderRadius: '15px', py: 1.2, fontWeight: 'bold', fontSize: '0.75rem', 
                borderColor: '#1c1c1e', 
                color: showOnlyAvailable ? 'white' : '#1c1c1e', 
                bgcolor: showOnlyAvailable ? '#1c1c1e' : 'transparent'
              }}
            >
              {showOnlyAvailable ? "Online Only" : "Show Available"}
            </Button>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                sx={{ borderRadius: '15px', bgcolor: 'white' }}
              >
                <MenuItem value="all">All Depts</MenuItem>
                {categories?.map((cat: any) => (
                  <MenuItem key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Employee List Section */}
      <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
        <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 2, px: 1, color: '#1A2238' }}>
          STAFF MEMBERS ({filteredEmployees.length})
        </Typography>
        
        {filteredEmployees.map((emp) => (
          <EmployeeCard 
            key={emp.employeeId} 
            employee={emp} 
            onDelete={handleDeleteEmployee}
            // לא מעבירים פונקציית עדכון - הכרטיס מנווט לבד!
          />
        ))}
      </Box>

      {/* Floating Add Button */}
      <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #eee' }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/register-employee')}
          sx={{ bgcolor: '#1c1c1e', py: 1.8, borderRadius: '18px', fontWeight: 'bold' }}
        >
          Add New Staff Member
        </Button>
      </Box>
    </Box>
  );
}