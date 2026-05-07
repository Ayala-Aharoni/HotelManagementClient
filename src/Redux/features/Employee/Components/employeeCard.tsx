import React from 'react';
import { Paper, Avatar, Box, Typography, Chip } from '@mui/material';
// ייבוא בטוח למניעת שגיאות Vite
import ChevronRight from '@mui/icons-material/ChevronRight';
import FiberManualRecord from '@mui/icons-material/FiberManualRecord';
import BusinessCenter from '@mui/icons-material/BusinessCenter'; 

const EmployeeCard = ({ employee, onClick }: { employee: any, onClick: (id: number) => void }) => {
  const isAvailable = employee.isAviable; 

  return (
    <Paper 
      elevation={0}
      onClick={() => employee.employeeId && onClick(employee.employeeId)}
      sx={{ 
        p: 2, mb: 1.5, borderRadius: '20px', display: 'flex', alignItems: 'center',
        cursor: 'pointer', border: '1px solid #f0f0f0', transition: '0.2s',
        '&:hover': { boxShadow: '0 5px 15px rgba(0,0,0,0.08)', borderColor: '#D4AF37' }
      }}
    >
      <Box sx={{ position: 'relative', mr: 2 }}>
        <Avatar 
          sx={{ 
            width: 50, height: 50, 
            bgcolor: isAvailable ? '#e8f5e9' : '#ffebee', 
            color: isAvailable ? '#2e7d32' : '#c62828',
            fontWeight: 'bold'
          }}
        >
          {employee.fullname ? employee.fullname[0].toUpperCase() : '?'}
        </Avatar>
        <FiberManualRecord 
          sx={{ 
            position: 'absolute', bottom: 0, right: 0, fontSize: 12, 
            color: isAvailable ? '#4caf50' : '#f44336',
            border: '2px solid white', borderRadius: '50%'
          }} 
        />
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography variant="body1" fontWeight="700" sx={{ color: '#1A2238' }}>
          {employee.fullname}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.6 }}>
          <BusinessCenter sx={{ fontSize: 14 }} />
          <Typography variant="caption">{employee.categoryName || 'General'}</Typography>
        </Box>
      </Box>

      <Box sx={{ textAlign: 'right' }}>
        <Chip 
          label={isAvailable ? "Available" : "Busy"} 
          size="small"
          sx={{ 
            bgcolor: isAvailable ? '#4caf50' : '#f44336', 
            color: 'white', fontWeight: 'bold', fontSize: '0.65rem', mb: 0.5
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <ChevronRight sx={{ color: '#ccc' }} />
        </Box>
      </Box>
    </Paper>
  );
};

export default EmployeeCard;