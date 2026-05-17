import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../../store";
import { setLogout } from "../../Employee/authSlice";
import {
  Box, Typography, Tabs, Tab, CircularProgress, IconButton, Chip
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import { useGetAllRequestsQuery } from "../../Requests/requestAPI";
import { RequestCard } from "../../Requests/Components/RequestCard";
import adminHeaderImg from "../../../../assets/doors-pict.jpg";

export default function ManagerDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [activeTab, setActiveTab] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data: allRequests = [], isLoading } = useGetAllRequestsQuery(undefined, {
    pollingInterval: 10000, 
  });

  const userName = user?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "Manager";

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    dispatch(setLogout());
    navigate("/login");
  };

  const newRequests = allRequests.filter((req: any) => 
    req.status === "Pending" || req.status === "Available" || !req.employeeId
  );

  const inProgressRequests = allRequests.filter((req: any) => 
    req.status === "InProgress"
  );

  const pastDayRequests = allRequests.filter((req: any) => {
    const requestTime = new Date(req.createdAt || req.requestTime || req.createdDate).getTime();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    return (now - requestTime) <= ONE_DAY_MS;
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#F8F9FA', overflow: 'hidden', direction: 'ltr' }}>
      
      {/* Header באנר עליון */}
      <Box sx={{ position: 'relative', height: '220px', width: '100%', flexShrink: 0 }}>
        <Box component="img" src={adminHeaderImg} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)', zIndex: 1 }} />

        <Box sx={{ position: 'absolute', top: 25, left: 25, color: 'white', zIndex: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, fontSize: '28px', mb: 0.5 }}>
            Manager Control: {userName}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, opacity: 0.9 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarTodayIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
          <Chip label="ADMIN MODE" sx={{ bgcolor: '#1A73E8', color: 'white', fontWeight: 900, border: '2px solid white' }} />
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #E0E4E8', flexShrink: 0 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': { fontWeight: 800, fontSize: '13px', py: 2, color: '#A0A0A0' },
            '& .Mui-selected': { color: '#1A73E8' },
            '& .MuiTabs-indicator': { height: 3 }
          }}
        >
          <Tab label={`NEW (${newRequests.length})`} />
          <Tab label={`IN PROGRESS (${inProgressRequests.length})`} />
          <Tab label={`PAST 24H (${pastDayRequests.length})`} />
        </Tabs>
      </Box>

      {/* אזור התוכן הנגלל */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        
        {/* לשונית 1: בקשות חדשות */}
        {activeTab === 0 && (
          newRequests.length > 0 ? (
            newRequests.map((req: any) => (
              <RequestCard 
                key={req.id || req.requestId} 
                task={req} 
                now={now} 
                variant="available" 
                readOnly={true} // <--- הוספנו כאן
              />
            ))
          ) : (
            <Typography sx={{ textAlign: 'center', mt: 4, color: 'text.secondary', fontWeight: 600 }}>No unassigned requests</Typography>
          )
        )}

        {/* לשונית 2: בקשות בטיפול */}
        {activeTab === 1 && (
          inProgressRequests.length > 0 ? (
            inProgressRequests.map((req: any) => (
              <Box key={req.id || req.requestId} sx={{ position: 'relative' }}>
                <RequestCard 
                  task={req} 
                  now={now} 
                  variant="inProgress" 
                  readOnly={true} // <--- הוספנו כאן
                />
                <Box sx={{
                  bgcolor: '#E8F0FE', color: '#1A73E8', p: 1, mx: 1, mt: -1, borderRadius: '0 0 8px 8px',
                  display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #1A73E8', borderTop: 'none'
                }}>
                  <AccountCircleIcon sx={{ fontSize: 18 }} />
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    Assigned to: {req.employeeName || req.employee?.name || `Employee #${req.employeeId || 'Unknown'}`}
                  </Typography>
                </Box>
              </Box>
            ))
          ) : (
            <Typography sx={{ textAlign: 'center', mt: 4, color: 'text.secondary', fontWeight: 600 }}>No tasks are currently in progress</Typography>
          )
        )}

        {/* לשונית 3: בקשות מהיממה האחרונה */}
        {activeTab === 2 && (
          pastDayRequests.length > 0 ? (
            pastDayRequests.map((req: any) => (
              <Box key={req.id || req.requestId} sx={{ opacity: req.status === "Completed" ? 0.7 : 1 }}>
                <RequestCard 
                  task={req} 
                  now={now} 
                  variant="history" 
                  readOnly={true} // <--- הוספנו כאן
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -0.5, px: 1 }}>
                  <Chip 
                    label={req.status?.toUpperCase()} 
                    size="small"
                    sx={{ 
                      fontSize: '10px', fontWeight: 800,
                      bgcolor: req.status === "Completed" ? '#4CAF50' : '#FF9800', color: 'white'
                    }} 
                  />
                </Box>
              </Box>
            ))
          ) : (
            <Typography sx={{ textAlign: 'center', mt: 4, color: 'text.secondary', fontWeight: 600 }}>No requests in the last 24 hours</Typography>
          )
        )}
      </Box>

      {/* כפתור התנתקות תחתון */}
      <Box sx={{ p: 1.5, bgcolor: 'white', borderTop: '1px solid #E0E4E8' }}>
        <IconButton 
          onClick={handleLogout} 
          sx={{ 
            borderRadius: '8px', width: '100%', gap: 1, 
            color: '#636E72', fontSize: '13px', fontWeight: 700,
            '&:hover': { bgcolor: '#FEE2E2', color: '#DC2626' } 
          }}
        >
          <LogoutIcon sx={{ fontSize: 18 }} /> LOGOUT FROM MANAGEMENT SYSTEM
        </IconButton>
      </Box>
    </Box>
  );
}