import React, { useState, useEffect } from 'react';
import { 
  Grid, Typography, Box, Paper, Avatar, 
  IconButton, Badge, Card, CardActionArea 
} from '@mui/material';
import { 
  People, Category, Assessment, Settings, 
  NotificationsNone, Assignment, CalendarToday, AccessTime 
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  // עדכון השעה בזמן אמת
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // רשימת האופציות המתורגמת כולל "Requests"
  const adminOptions = [
    { title: 'Employees', icon: <People />, path: '/admin/employees', desc: '8 Active' },
    { title: 'Categories', icon: <Category />, path: '/admin/categories', desc: '14 Services' },
    { title: 'Requests', icon: <Assignment />, path: '/admin/requests', desc: 'Manage Status' },
    { title: 'Reports', icon: <Assessment />, path: '/admin/reports', desc: 'Daily & Weekly' },
    { title: 'Settings', icon: <Settings />, path: '/admin/settings', desc: 'System Config' },
  ];

  // פורמט לתאריך
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <Box sx={{ bgcolor: '#F8F9FA', minHeight: '100%', pb: 4 }}>
      
      {/* Header Section */}
      <Box sx={{ 
        p: 3, pt: 6, pb: 9, 
        background: 'linear-gradient(135deg, #1A2238 0%, #2c3e50 100%)',
        color: 'white',
        borderRadius: '0 0 40px 40px',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* מקום לתמונה של המנהל */}
            <Avatar 
              src="/path-to-your-image.jpg" // כאן תשים את הנתיב לתמונה שלך
              sx={{ 
                width: 60, 
                height: 60, 
                border: '2px solid #D4AF37',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
              }} 
            />
            <Box>
              <Typography variant="h5" fontWeight="700">Good Morning,</Typography>
              <Typography variant="body1" sx={{ opacity: 0.8 }}>Admin Manager</Typography>
            </Box>
          </Box>
          <IconButton sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}>
            <Badge color="error" variant="dot">
              <NotificationsNone />
            </Badge>
          </IconButton>
        </Box>

        {/* תצוגת זמן ותאריך חכמה */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.9 }}>
                <CalendarToday sx={{ fontSize: 16, color: '#D4AF37' }} />
                <Typography variant="caption" fontWeight="600">
                    {formatDate(currentTime)}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.9 }}>
                <AccessTime sx={{ fontSize: 16, color: '#D4AF37' }} />
                <Typography variant="caption" fontWeight="600">
                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </Typography>
            </Box>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ px: 3, mt: -4 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Paper elevation={8} sx={{ p: 2, borderRadius: '20px', textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="800" color="primary">12</Typography>
              <Typography variant="caption" color="textSecondary" fontWeight="600">OPEN REQUESTS</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper elevation={8} sx={{ p: 2, borderRadius: '20px', textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="800" color="secondary">98%</Typography>
              <Typography variant="caption" color="textSecondary" fontWeight="600">SATISFACTION</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Navigation Tiles */}
      <Box sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 2, color: '#1A2238', letterSpacing: 1 }}>
            QUICK ACTIONS
        </Typography>
        <Grid container spacing={2}>
          {adminOptions.map((option, index) => (
            <Grid item xs={6} key={index}>
              <Card elevation={0} sx={{ 
                borderRadius: '24px', 
                border: '1px solid #E0E0E0',
                transition: '0.3s',
                '&:hover': { boxShadow: '0 8px 20px rgba(0,0,0,0.08)', transform: 'translateY(-4px)' }
              }}>
                <CardActionArea onClick={() => navigate(option.path)} sx={{ p: 2 }}>
                  <Box sx={{ 
                    width: 44, height: 44, borderRadius: '14px', 
                    bgcolor: '#1A2238', color: '#D4AF37',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5
                  }}>
                    {option.icon}
                  </Box>
                  <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#1A2238' }}>
                    {option.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#888' }}>
                    {option.desc}
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}