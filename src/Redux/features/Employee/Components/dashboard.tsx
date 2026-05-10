import { useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../../store";
import { setLogout } from "../authSlice";
import {
  Badge, IconButton, Box, Typography, Tabs, Tab, Chip
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import notificationSound from "../../../../assets/Notification.mp3";

import {
  useCompleteRequestMutation,
  useLazyGetMyTasksQuery,
  useTakeRequestMutation,
  useLazyGetAvailableRequestsQuery,
  useRejectToReceptionMutation,
} from "../../Requests/requestAPI";

import { useUpdateEmployeeStatusMutation } from "../employeeApi";
import { RequestCard } from "../../Requests/Components/RequestCard";
import staffHeaderImg from "../../../../assets/doors-pict.jpg";
import "./dashborad.css";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [availableRequests, setAvailableRequests] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [now, setNow] = useState(Date.now());
  const [activeTab, setActiveTab] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const isAvailableRef = useRef(isAvailable);

  useEffect(() => {
    isAvailableRef.current = isAvailable;
  }, [isAvailable]);

  const [takeRequestTrigger] = useTakeRequestMutation();
  const [completeRequestTrigger] = useCompleteRequestMutation();
  const [rejectToReceptionTrigger] = useRejectToReceptionMutation();
  const [updateEmployeeStatus] = useUpdateEmployeeStatusMutation();
  const [triggerGetMyTasks] = useLazyGetMyTasksQuery();
  const [triggerGetAvailable] = useLazyGetAvailableRequestsQuery();

  const userName = user?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "Staff Member";
  const categoryId = user?.CategoryId || user?.categoryId || "0";

  const handleLogout = () => {
    dispatch(setLogout());
    navigate("/login");
  };

  const playNotificationSound = () => {
    const audio = new Audio(notificationSound); 
    audio.play().catch(() => {
        // שקט תעשייתי - אם הדפדפן חוסם, פשוט לא יקרה כלום בלי להספיק שגיאות למסוף
    });
  };

  const toggleAvailability = async () => {
    const newStatus = !isAvailable;
    setIsAvailable(newStatus);
    try {
      const userId = user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      if (!userId) throw new Error("User ID not found");
      await updateEmployeeStatus({ id: userId, isAvailable: newStatus }).unwrap();
    } catch (err) {
      setIsAvailable(!newStatus);
    }
  };

  const handleTakeRequest = async (request: any) => {
    const rId = request.requestId || request.id;
    try {
      await takeRequestTrigger({ requestId: rId }).unwrap();
      setMyTasks((prev) => [...prev, { ...request, status: "InProgress" }]);
      setAvailableRequests((prev) => prev.filter((req) => (req.requestId || req.id) !== rId));
    } catch (err: any) {
      alert(err.data?.message || "Communication error");
    }
  }

  const handleCompleteRequest = async (task: any) => {
    const rId = task.requestId || task.id;
    try {
      await completeRequestTrigger({ requestId: rId }).unwrap();
      setMyTasks((prev) => prev.filter((req) => (req.requestId || req.id) !== rId));
    } catch (err: any) {
      alert(err.data?.message || "Error completing task");
    }
  };

  const handleRejectRequest = async (req: any) => {
    const rId = req.requestId || req.id;
    try {
      await rejectToReceptionTrigger({ requestId: rId }).unwrap();
      setAvailableRequests((prev) => prev.filter((r) => (r.requestId || r.id) !== rId));
    } catch (err: any) {
      alert(err.data?.message || "Error rejecting task");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
        setNow(Date.now());
        setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const tasks = await triggerGetMyTasks().unwrap();
        setMyTasks(tasks.filter((t: any) => t.status === "InProgress"));
        const available = await triggerGetAvailable().unwrap();
        setAvailableRequests(available);
      } catch (err: any) { 
        if (err.status === 401) handleLogout(); 
      }
    };

    fetchData();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7237/requestHub", { 
        accessTokenFactory: () => token || "" 
      })
      .withAutomaticReconnect()
      .build();

    const startSignalR = async () => {
        try {
            await connection.start();
            if (isMounted) {
                connection.invoke("JoinCategoryGroup", parseInt(categoryId));
                
                connection.on("ReceiveNotification", (n: any) => {
                    setAvailableRequests(prev => [...prev, n]);
                    if (isAvailableRef.current) {
                        playNotificationSound();
                    }
                });

                connection.on("RemoveRequestFromUI", (id: number) => {
                    setAvailableRequests(prev => prev.filter(req => (req.requestId || req.id) !== id));
                });
            }
        } catch (err) {
            // שגיאות חיבור נשמרות רק בתוך ה-catch בלי הדפסה רועשת
        }
    };

    startSignalR();

    return () => { 
      isMounted = false;
      if (connection.state === signalR.HubConnectionState.Connected) {
          connection.stop();
      }
    };
  }, [token, categoryId]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#F8F9FA', overflow: 'hidden', direction: 'ltr' }}>
      
      <Box sx={{ position: 'relative', height: '240px', width: '100%', flexShrink: 0 }}>
        <Box component="img" src={staffHeaderImg} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)', zIndex: 1 }} />

        <Box sx={{ position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
            <Badge 
                badgeContent={availableRequests.length} 
                sx={{ "& .MuiBadge-badge": { backgroundColor: '#FF3B30', color: 'white', fontWeight: 'bold' } }}
            >
                <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
                    <NotificationsIcon />
                </IconButton>
            </Badge>

            <Chip
                label={isAvailable ? "AVAILABLE" : "UNAVAILABLE"}
                onClick={toggleAvailability}
                sx={{
                    bgcolor: isAvailable ? '#4CAF50' : '#FF3B30', 
                    color: 'white', 
                    fontWeight: 900, 
                    px: 1,
                    borderRadius: '8px', 
                    border: '2px solid white',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                    '&:hover': { opacity: 0.9 }
                }}
            />
        </Box>

        <Box sx={{ position: 'absolute', bottom: 25, left: 25, color: 'white', zIndex: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, fontSize: '28px', mb: 0.5 }}>
            Hello {userName},
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
      </Box>

      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #E0E4E8', flexShrink: 0 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': { fontWeight: 800, fontSize: '14px', py: 2, color: '#A0A0A0' },
            '& .Mui-selected': { color: '#1A73E8' },
            '& .MuiTabs-indicator': { height: 3 }
          }}
        >
          <Tab label="NEW REQUESTS" />
          <Tab label="MY TASKS" />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {activeTab === 0 ? (
          availableRequests.length > 0 ? (
            availableRequests.map((req) => (
                <RequestCard 
                  key={req.id || req.requestId} 
                  task={req} 
                  now={now} 
                  variant="available" 
                  onTake={() => handleTakeRequest(req)}
                  onReject={() => handleRejectRequest(req)}
                />
              ))
          ) : (
            <Typography sx={{ textAlign: 'center', mt: 4, color: 'text.secondary', fontWeight: 600 }}>No new requests at the moment</Typography>
          )
        ) : (
          myTasks.length > 0 ? (
            myTasks.map((task) => (
                <RequestCard 
                  key={task.id || task.requestId} 
                  task={task} 
                  now={now} 
                  variant="inProgress" 
                  onComplete={() => handleCompleteRequest(task)}
                />
              ))
          ) : (
            <Typography sx={{ textAlign: 'center', mt: 4, color: 'text.secondary', fontWeight: 600 }}>You have no active tasks</Typography>
          )
        )}
      </Box>

      <Box sx={{ p: 1.5, bgcolor: 'white', borderTop: '1px solid #E0E4E8' }}>
          <IconButton 
            onClick={handleLogout} 
            sx={{ 
                borderRadius: '8px', width: '100%', gap: 1, 
                color: '#636E72', fontSize: '13px', fontWeight: 700,
                '&:hover': { bgcolor: '#FEE2E2', color: '#DC2626' } 
            }}
          >
            <LogoutIcon sx={{ fontSize: 18 }} /> LOGOUT FROM SYSTEM
          </IconButton>
      </Box>
    </Box>
  );
}