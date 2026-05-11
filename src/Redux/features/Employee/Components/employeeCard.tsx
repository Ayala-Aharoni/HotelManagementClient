import React, { useState } from 'react';
import { 
  Paper, Avatar, Box, Typography, Chip, IconButton, 
  Menu, MenuItem 
} from '@mui/material';
import { 
  MoreVert, Edit, Delete, BusinessCenter, FiberManualRecord 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface EmployeeCardProps {
  employee: any;
  onClick: (id: number) => void;
  onDelete: (id: number) => void;
}

const EmployeeCard = ({ employee, onClick, onDelete }: EmployeeCardProps) => {
  const navigate = useNavigate();
  const isAvailable = employee.isAviable;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // פתיחת תפריט 3 נקודות
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation(); // מונע פתיחת כרטיס
    setAnchorEl(event.currentTarget);
  };

  // סגירת תפריט 3 נקודות
  const handleCloseMenu = (event?: any) => {
    if (event?.stopPropagation) event.stopPropagation();
    setAnchorEl(null);
  };

  // מעבר לעמוד עריכה במקום פתיחת דיאלוג
  const handleOpenEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleCloseMenu();
    // ניווט לעמוד העריכה החדש עם ה-ID של העובד
    navigate(`/admin/staff/edit/${employee.employeeId}`);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete(employee.employeeId);
    handleCloseMenu();
  };

  return (
    <Paper 
      elevation={0}
      onClick={() => employee.employeeId && onClick(employee.employeeId)}
      sx={{ 
        p: 2, mb: 1.5, borderRadius: '20px', display: 'flex', alignItems: 'center',
        cursor: 'pointer', border: '1px solid #f0f0f0', transition: '0.2s',
        position: 'relative',
        '&:hover': { boxShadow: '0 5px 15px rgba(0,0,0,0.08)', borderColor: '#D4AF37' }
      }}
    >
      {/* כפתור 3 נקודות */}
      <IconButton 
        onClick={handleOpenMenu}
        sx={{ position: 'absolute', top: 8, right: 8, color: '#ccc', zIndex: 2 }}
      >
        <MoreVert fontSize="small" />
      </IconButton>

      <Box sx={{ position: 'relative', mr: 2 }}>
        <Avatar sx={{ 
          width: 50, height: 50, 
          bgcolor: isAvailable ? '#e8f5e9' : '#ffebee', 
          color: isAvailable ? '#2e7d32' : '#c62828' 
        }}>
          {employee.fullname ? employee.fullname[0].toUpperCase() : '?'}
        </Avatar>
        <FiberManualRecord sx={{ 
          position: 'absolute', bottom: 0, right: 0, fontSize: 12, 
          color: isAvailable ? '#4caf50' : '#f44336',
          border: '2px solid white', borderRadius: '50%'
        }} />
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

      <Box sx={{ textAlign: 'right', pr: 4 }}>
        <Chip 
          label={isAvailable ? "Available" : "Busy"} 
          size="small"
          sx={{ bgcolor: isAvailable ? '#4caf50' : '#f44336', color: 'white', fontWeight: 'bold' }}
        />
      </Box>

      {/* תפריט אפשרויות */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={handleOpenEdit}>
          <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default EmployeeCard;