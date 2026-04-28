import React from 'react';
import { Grid, Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';
import { People, Category, Assessment, Settings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();

  // רשימת האופציות של המנהל
  const adminOptions = [
    { title: 'ניהול עובדים', icon: <People fontSize="large" />, path: '/admin/employees', color: '#1a3c5a' },
    { title: 'ניהול קטגוריות', icon: <Category fontSize="large" />, path: '/admin/categories', color: '#bf9b30' },
    { title: 'דוחות שירות', icon: <Assessment fontSize="large" />, path: '/admin/reports', color: '#27ae60' },
    { title: 'הגדרות מלון', icon: <Settings fontSize="large" />, path: '/admin/settings', color: '#7f8c8d' },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', color: '#1a3c5a' }}>
        לוח בקרה למנהל
      </Typography>

      <Grid container spacing={3}>
        {adminOptions.map((option, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardActionArea onClick={() => navigate(option.path)} sx={{ p: 2, textAlign: 'center' }}>
                <Box sx={{ color: option.color, mb: 1 }}>
                  {option.icon}
                </Box>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">
                    {option.title}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}