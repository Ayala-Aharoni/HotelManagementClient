import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, IconButton, Avatar, Button, 
  CircularProgress, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Badge
} from '@mui/material';
import { 
  ArrowBack, NotificationsNone, Add, 
  CalendarToday, AccessTime, Apartment 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// לוגיקה ו-API
import { useGetAllCategoriesQuery, type Category } from "../CategoryAPI";
import CategoryItem from './CategoryItem';
import AddCategoryModal from './AddCategoryForm';

// תמונת הרקע (אותה תמונה מעמוד העובדים וה-Login)
import staffHeaderImg from "../../../../assets/doors-pict.jpg";

const CategoryManagement: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // הבאת נתונים מהשרת
  const { data: categories, isLoading, isError } = useGetAllCategoriesQuery();

  // עדכון שעון
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress sx={{ color: '#1A2238' }} />
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#F8F9FA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header עם תמונת הרקע - בדיוק כמו בעמוד העובדים */}
      <Box sx={{ 
        position: 'relative', height: '220px', color: 'white',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        overflow: 'hidden', borderRadius: '0 0 40px 40px',
      }}>
        <Box 
          component="img" src={staffHeaderImg} 
          sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} 
        />
        <Box sx={{ 
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))', zIndex: 2 
        }} />

        <Box sx={{ position: 'relative', zIndex: 3, p: 3, pb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => navigate(-1)} sx={{ color: 'white', p: 0 }}>
                <ArrowBack />
              </IconButton>
              <Avatar sx={{ width: 50, height: 50, border: '2px solid #D4AF37', bgcolor: '#D4AF37' }}>H</Avatar>
              <Box>
                <Typography variant="h6" fontWeight="700" sx={{ lineHeight: 1.1 }}>Hotel Departments</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Management Portal</Typography>
              </Box>
            </Box>
            <IconButton sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)' }}>
              <Badge color="error" variant="dot"><NotificationsNone /></Badge>
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, px: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarToday sx={{ fontSize: 14, color: '#D4AF37' }} />
              <Typography variant="caption" fontWeight="600">
                {currentTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTime sx={{ fontSize: 14, color: '#D4AF37' }} />
              <Typography variant="caption" fontWeight="600">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* גוף העמוד - רשימת הקטגוריות */}
      <Box sx={{ p: 3, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Apartment sx={{ color: '#1A2238' }} />
          <Typography variant="h6" fontWeight="800" sx={{ color: '#1A2238' }}>
            DEPARTMENTS ({categories?.length || 0})
          </Typography>
        </Box>

        {isError ? (
          <Typography color="error" textAlign="center">שגיאה בטעינת הנתונים</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <Table sx={{ direction: 'rtl' }}>
              <TableHead sx={{ bgcolor: '#fdfdfd' }}>
                <TableRow>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: '#666' }}>ID</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: '#666' }}>שם המחלקה</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#666' }}>פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories?.map((cat: Category) => (
                  <CategoryItem key={cat.id} category={cat} />
                ))}
              </TableBody>
            </Table>
            
            {categories?.length === 0 && (
              <Box sx={{ p: 5, textAlign: 'center', color: '#999' }}>
                לא נמצאו מחלקות במערכת
              </Box>
            )}
          </TableContainer>
        )}
      </Box>

      {/* כפתור הוספה בתחתית - שחור כמו ב-Login */}
      <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #eee' }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsModalOpen(true)}
          sx={{ 
            bgcolor: '#1c1c1e', py: 1.8, borderRadius: '18px', fontWeight: 'bold',
            textTransform: 'none', '&:hover': { bgcolor: '#333' }
          }}
        >
          Add New Department
        </Button>
      </Box>

      {/* המודל להוספה */}
      <AddCategoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </Box>
  );
};

export default CategoryManagement;