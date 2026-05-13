import { useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../../store";
import { setLogout } from "../authSlice";
import {
  Badge, IconButton, Box, Typography, Chip, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import notificationSound from "../../../../assets/Notification.mp3";
// במקום מה שהיה קודם, תייבאי ותגדירי ככה:
import { 
    useLazyGetAvailableRequestsQuery, 
    useTransferToCategoryMutation // המוטציה הנכונה
  } from "../../Requests/requestAPI";

import { ReceptionRequestCard } from "../../Requests/Components/ReceptionRequestCard";
import staffHeaderImg from "../../../../assets/doors-pict.jpg";

export default function ReceptionDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [now, setNow] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(new Date());

  const [triggerGetAvailable] = useLazyGetAvailableRequestsQuery();
  const [transferToCategory] = useTransferToCategoryMutation();

  const userName = user?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "Receptionist";
  const categoryId = user?.CategoryId || user?.categoryId || "0";

  const handleLogout = () => {
    dispatch(setLogout());
    navigate("/login");
  };

  const playNotificationSound = () => {
    new Audio(notificationSound).play().catch(() => {});
  };

  const handleAssign = async (requestId: number, newCatId: number) => {
    console.log("🚀 Sending transfer request:", { requestId, newCatId }); // הדפסה לדיבאג
    
    try {
      // שימי לב: השמות כאן חייבים להיות זהים למה שכתבת ב-API Slice (correctCategoryId)
      await transferToCategory({ 
        requestId: requestId, 
        correctCategoryId: newCatId 
      }).unwrap();
  
      setPendingRequests(prev => prev.filter(req => (req.requestId || req.id) !== requestId));
      console.log("✅ Transfer successful");
    } catch (err: any) {
      console.error("❌ Transfer failed:", err); // כאן תראי את השגיאה המפורטת בקונסול
      alert("Error reassigning: " + (err.data?.message || "Server error"));
    }
  };
  // פונקציית הניתוב המרכזית
//   const handleAssign = async (requestId: number, newCatId: number) => {
//     try {
//       await reassignRequest({ requestId, categoryId: newCatId }).unwrap();
//       // הסרה מהרשימה המקומית - שאר הפקידים יקבלו עדכון דרך SignalR
//       setPendingRequests(prev => prev.filter(req => (req.requestId || req.id) !== requestId));
//     } catch (err: any) {
//       alert("Error reassigning: " + (err.data?.message || "Server error"));
//     }
//   };

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
        const available = await triggerGetAvailable().unwrap();
        setPendingRequests(available);
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
                // הצטרפות לקבוצת הקבלה
                connection.invoke("JoinCategoryGroup", parseInt(categoryId));
                
                connection.on("ReceiveNotification", (n: any) => {
                    setPendingRequests(prev => [...prev, n]);
                    playNotificationSound();
                });

                connection.on("RemoveRequestFromUI", (id: number) => {
                    setPendingRequests(prev => prev.filter(req => (req.requestId || req.id) !== id));
                });
            }
        } catch (err) {}
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
      
      {/* Header - זהה לעיצוב המקורי */}
      <Box sx={{ position: 'relative', height: '200px', width: '100%', flexShrink: 0 }}>
        <Box component="img" src={staffHeaderImg} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)', zIndex: 1 }} />

        <Box sx={{ position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
            <Badge badgeContent={pendingRequests.length} color="error">
                <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                    <NotificationsIcon />
                </IconButton>
            </Badge>
            <Chip label="RECEPTION DESK" sx={{ bgcolor: 'white', fontWeight: 900, color: '#1A73E8' }} />
        </Box>

        <Box sx={{ position: 'absolute', bottom: 25, left: 25, color: 'white', zIndex: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, fontSize: '26px' }}>
            Control Panel
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Hello {userName}, managing {pendingRequests.length} pending redirections.
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="overline" sx={{ fontWeight: 700, color: '#636E72' }}>
            Manual Assignment Queue
        </Typography>

        {pendingRequests.length > 0 ? (
          pendingRequests.map((req) => (
              <ReceptionRequestCard 
                key={req.id || req.requestId} 
                task={req} 
                onAssign={handleAssign}
              />
            ))
        ) : (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
             <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>All clear! No manual actions needed.</Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ p: 1.5, bgcolor: 'white', borderTop: '1px solid #E0E4E8' }}>
          <IconButton onClick={handleLogout} sx={{ borderRadius: '8px', width: '100%', gap: 1, fontSize: '13px', fontWeight: 700 }}>
            <LogoutIcon sx={{ fontSize: 18 }} /> LOGOUT
          </IconButton>
      </Box>
    </Box>
  );
}