// src/components/layot/mainlayout.tsx
import React from 'react';
import { Box, Paper } from '@mui/material';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Box 
      sx={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: '#f3f4f6' 
      }}
    >
      {/* הריבוע הלבן המרכזי - ה"טאבלט" */}
      <Paper 
        elevation={10} 
        sx={{ 
          width: '450px', // רוחב קבוע למראה אפליקטיבי
          height: '100vh', // כמעט כל הגובה
          borderRadius: '40px', // קימור יוקרתי
          overflow: 'hidden', // חשוב! כדי שהתמונות בפנים לא יצאו מהקימור
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
          position: 'relative'
        }}
      >
        {/* התוכן של כל דף ייכנס כאן */}
        <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
           {children}
        </Box>
      </Paper>
    </Box>
  );
};