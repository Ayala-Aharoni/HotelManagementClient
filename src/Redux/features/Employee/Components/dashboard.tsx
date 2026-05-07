import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../../store";
import { setLogout } from "../authSlice";
import {
  Badge, IconButton, Box, Typography, Tabs, Tab, Chip, Alert, Snackbar
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CircleIcon from '@mui/icons-material/Circle';

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

// --- פונקציות עזר מהקוד השני ---

const isTokenExpired = (token: string | null) => {
  if (!token) return true;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window.atob(base64).split("").map((c) =>
        "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
      ).join("")
    );
    const { exp } = JSON.parse(jsonPayload);
    return exp < Date.now() / 1000;
  } catch { return true; }
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);

  // States
  const [availableRequests, setAvailableRequests] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [now, setNow] = useState(Date.now());
  const [activeTab, setActiveTab] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);

  // API Mutations & Queries
  const [takeRequestTrigger] = useTakeRequestMutation();
  const [completeRequestTrigger] = useCompleteRequestMutation();
  const [rejectToReceptionTrigger] = useRejectToReceptionMutation();
  const [updateEmployeeStatus] = useUpdateEmployeeStatusMutation();
  const [triggerGetMyTasks] = useLazyGetMyTasksQuery();
  const [triggerGetAvailable] = useLazyGetAvailableRequestsQuery();

  const userName = user?.name || user?.full_name || "משתמש";
  const categoryId = user?.CategoryId || user?.categoryId || "0";

  const handleLogout = () => {
    dispatch(setLogout());
    navigate("/login");
  };

  // --- לוגיקת זמינות עובד (מהקוד הראשון) ---
  const toggleAvailability = async () => {
    const newStatus = !isAvailable;
    setIsAvailable(newStatus); // UI אופטימי
  
    try {
      // שליפת ה-ID לפי הנתיב המדויק ששלחת
      const userId = user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      
      if (!userId) {
        console.error("User Object is:", user); // עוזר לבדוק ב-Console אם ה-ID חסר
        throw new Error("לא נמצא מזהה משתמש");
      }
  
      // שליחה לשרת עם האובייקט המדויק
      await updateEmployeeStatus({ id: userId, isAvailable: newStatus }).unwrap();
      console.log("הסטטוס עודכן בשרת!");
    } catch (err) {
      console.error("העדכון נכשל:", err);
      setIsAvailable(!newStatus); // החזרה למצב קודם במקרה של שגיאה
      alert("עדכון הזמינות נכשל, נסו שוב");
    }
  };

  // --- טיפול בבקשות עם זריקת שגיאות ברורה (מהקוד השני) ---
  
  const handleTakeRequest = async (request: any) => {
    const rId = request.requestId || request.id;
    try {
      // שליחת הבקשה ושימוש ב-unwrap כדי "לפתוח" את התשובה או השגיאה
      await takeRequestTrigger({ requestId: rId }).unwrap();
      // לוגיקת הצלחה (עדכון ה-State המקומי שלך)
      setMyTasks((prev) => [...prev, { ...request, status: "InProgress" }]);
      setAvailableRequests((prev) => prev.filter((req) => (req.requestId || req.id) !== rId));
    } catch (err: any) {
      /* --- כאן הקסם של זריקת השגיאה הברורה --- */
      // שליפת ההודעה מה-Data שהשרת החזיר (בדרך כלל בשדה message)
      const serverMessage = err.data?.message;
      
      if (serverMessage) {
        // אם יש הודעה ספציפית מהשרת (כמו "המשימה כבר נתפסה")
        alert(serverMessage); 
      } else {
        // הודעת גיבוי למקרה של תקלת תקשורת כללית או שגיאת 500 לא צפויה
        alert("אופס... נראה שיש בעיית תקשורת עם השרת או שגיאה לא ידועה.");
      }
    }
  }

  const handleCompleteRequest = async (task: any) => {
    const rId = task.requestId || task.id;
    try {
      await completeRequestTrigger({ requestId: rId }).unwrap();
      setMyTasks((prev) => prev.filter((req) => (req.requestId || req.id) !== rId));
    } catch (err: any) {
      alert(err.data?.message || "שגיאה בסיום המשימה");
    }
  };

  const handleRejectRequest = async (req: any) => {
    const rId = req.requestId || req.id;
    try {
      await rejectToReceptionTrigger({ requestId: rId }).unwrap();
      setAvailableRequests((prev) => prev.filter((r) => (r.requestId || r.id) !== rId));
    } catch (err: any) {
      alert(err.data?.message || "שגיאה בדחיית המשימה");
    }
  };

  // --- Effects & SignalR ---

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // בדיקת תוקף טוקן לפני הכל
    if (!token || !user || isTokenExpired(token)) {
      handleLogout();
      return;
    }

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

    // SignalR Connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7237/requestHub", { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    connection.start().then(() => {
      connection.invoke("JoinCategoryGroup", parseInt(categoryId));
      connection.on("ReceiveNotification", (n: any) => setAvailableRequests(prev => [...prev, n]));
      connection.on("RemoveRequestFromUI", (id: number) =>
        setAvailableRequests(prev => prev.filter(req => (req.requestId || req.id) !== id))
      );
    }).catch(console.error);

    return () => { connection.stop(); };
  }, [token, user]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f8f9fb', overflow: 'hidden' }}>
      
      {/* Hero Section */}
      <Box sx={{ position: 'relative', height: '200px', width: '100%', flexShrink: 0 }}>
        <Box component="img" src={staffHeaderImg} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6))', zIndex: 1 }} />

        {/* כפתור זמינות (MUI) */}
        <Chip
          label={isAvailable ? "זמין" : "לא זמין"}
          onClick={toggleAvailability}
          icon={<CircleIcon sx={{ fontSize: '10px !important' }} />}
          sx={{
            position: 'absolute', top: 25, right: 25, zIndex: 10, fontWeight: 800,
            bgcolor: isAvailable ? '#4caf50' : '#ff3b30', color: 'white', border: '2px solid white'
          }}
        />

        <Box sx={{ position: 'absolute', bottom: 25, right: 30, color: 'white', textAlign: 'right', zIndex: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, fontSize: '28px' }}>היי {userName},</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>שתהיה משמרת מוצלחת!</Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label={`בקשות חדשות (${availableRequests.length})`} />
          <Tab label={`בטיפולי (${myTasks.length})`} />
        </Tabs>
      </Box>

      {/* Content Area */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {activeTab === 0 ? (
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
          myTasks.map((task) => (
            <RequestCard 
              key={task.id || task.requestId} 
              task={task} 
              now={now} 
              variant="inProgress" 
              onComplete={() => handleCompleteRequest(task)}
            />
          ))
        )}
      </Box>

      {/* Footer Logout */}
      <IconButton onClick={handleLogout} sx={{ py: 2, color: 'text.secondary', borderTop: 1, borderColor: 'divider', bgcolor: 'white', borderRadius: 0 }}>
        <LogoutIcon sx={{ mr: 1, fontSize: 18 }} /> התנתקות מהמערכת
      </IconButton>
    </Box>
  );
}