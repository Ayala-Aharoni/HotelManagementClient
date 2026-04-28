
import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../../store";
import { setLogout } from "../authSlice";
import {
  useCompleteRequestMutation,
  useLazyGetMyTasksQuery,
  useTakeRequestMutation,
  useLazyGetAvailableRequestsQuery,
  useRejectToReceptionMutation,
} from "../../Requests/requestAPI";

import { RequestCard } from "../../Requests/Components/RequestCard";
import staffHeaderImg from "../../../../assets/doors-pict.jpg";
import "./dashborad.css";

// לוגיקה ישנה: חישוב זמן יחסי
const getRelativeTime = (dateString: string, currentTime: number) => {
  if (!dateString) return "";
  const past = new Date(dateString);
  const diffInMs = currentTime - past.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  if (diffInMinutes < 1) return "ממש עכשיו";
  if (diffInMinutes < 60) return `לפני ${diffInMinutes} דקות`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `לפני ${diffInHours} שעות`;
  return past.toLocaleDateString("he-IL");
};

// לוגיקה ישנה: בדיקת תוקף טוקן
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

  // States - לוגיקה ישנה
  const [availableRequests, setAvailableRequests] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [now, setNow] = useState(Date.now());
  const [activeTab, setActiveTab] = useState<"available" | "mine">("available");

  // API Triggers - שמות מקוריים מהלוגיקה הישנה
  const [takeRequestTrigger] = useTakeRequestMutation();
  const [completeRequestTrigger] = useCompleteRequestMutation();
  const [rejectToReceptionTrigger] = useRejectToReceptionMutation();
  const [triggerGetMyTasks] = useLazyGetMyTasksQuery();
  const [triggerGetAvailable] = useLazyGetAvailableRequestsQuery();

  const userName = user?.name || user?.full_name || "משתמש";
  const departmentName = user?.CategoryId || user?.categoryId || "כללי";

  const handleLogout = () => {
    dispatch(setLogout());
    navigate("/login");
  };

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!token || !user || isTokenExpired(token)) {
      handleLogout();
      return;
    }
    const categoryId = user.CategoryId || user.categoryId;

    const fetchData = async () => {
      try {
        const tasks = await triggerGetMyTasks().unwrap();
        // פילטור לפי הלוגיקה הישנה
        setMyTasks(tasks.filter((t: any) => t.status === "InProgress"));
        const available = await triggerGetAvailable().unwrap();
        setAvailableRequests(available);
      } catch (err: any) {
        if (err.status === 401) handleLogout();
      }
    };
    fetchData();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7237/requestHub", { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        connection.invoke("JoinCategoryGroup", parseInt(categoryId));
        // החזרת הלוגיקה של הוספה לסוף המערך כפי שהיה במקור
        connection.on("ReceiveNotification", (n: any) =>
          setAvailableRequests((prev) => [...prev, n])
        );
        connection.on("RemoveRequestFromUI", (id: number) =>
          setAvailableRequests((prev) =>
            prev.filter((req) => (req.requestId || req.id) !== id)
          )
        );
      }).catch(console.error);

    return () => { connection.stop(); };
  }, [token, user]);

  const handleTakeRequest = async (request: any) => {
    const rId = request.requestId || request.id;
    
    try {
      // 1. קריאה לשרת
      await takeRequestTrigger({ requestId: rId }).unwrap();
      
      // 2. עדכון הממשק (רק אם השרת החזיר תשובת הצלחה)
      setMyTasks((prev) => [
        ...prev, 
        { ...request, status: "InProgress", updatedAt: new Date().toISOString() }
      ]);
      
      setAvailableRequests((prev) => 
        prev.filter((req) => (req.requestId || req.id) !== rId)
      );

    } catch (err: any) {
      // 3. כאן הקסם קורה! 
      // אנחנו בודקים אם יש הודעה מה-AppException שבנינו ב-C#
      const serverMessage = err.data?.message;
      
      if (serverMessage) {
        alert(serverMessage); // יציג למשל: "עובד אחר כבר לקח את המשימה הזו"
      } else {
        alert("אופס... נראה שיש בעיית תקשורת עם השרת.");
      }
    }
  };

  const handleCompleteRequest = async (task: any) => {
    const rId = task.requestId || task.id;
    try {
      await completeRequestTrigger({ requestId: rId }).unwrap();
      setMyTasks((prev) => prev.filter((req) => (req.requestId || req.id) !== rId));
    } catch { alert("שגיאה בסיום המשימה"); }
  };

  const handleRejectRequest = async (req: any) => {
    const rId = req.requestId || req.id;
    try {
      await rejectToReceptionTrigger({ requestId: rId }).unwrap();
      setAvailableRequests((prev) => prev.filter((r) => (r.requestId || r.id) !== rId));
    } catch { alert("שגיאה בהעברה לקבלה"); }
  };

  return (
    <div className="page-center-wrapper">
      <div className="mobile-frame">
        
        {/* העיצוב שביקשת (Hero) */}
        <div className="dashboard-hero">
          <img src={staffHeaderImg} alt="Header" className="header-bg-img" />
          <div className="header-top-bar">
            <div className="dept-tag-pill">מחלקה: {departmentName}</div>
            <div className="notif-icon-wrapper">
              <span className="bell-emoji">🔔</span>
              {availableRequests.length > 0 && (
                <span className="bell-count-badge">{availableRequests.length}</span>
              )}
            </div>
          </div>
          <div className="header-overlay-text">
            <h1>היי {userName},</h1>
            <p>שתהיה משמרת מוצלחת!</p>
          </div>
        </div>

        {/* טאבים - 2 בלבד עם שמות מהלוגיקה הישנה */}
        <div className="tab-switcher" dir="rtl">
          <button 
            className={`tab-item ${activeTab === "available" ? "active" : ""}`} 
            onClick={() => setActiveTab("available")}
          >
            בקשות חדשות
            {availableRequests.length > 0 && <span className="tab-badge red">{availableRequests.length}</span>}
          </button>
          <button 
            className={`tab-item ${activeTab === "mine" ? "active" : ""}`} 
            onClick={() => setActiveTab("mine")}
          >
            בטיפולי
            {myTasks.length > 0 && <span className="tab-badge gray">{myTasks.length}</span>}
          </button>
        </div>

        {/* תוכן - שימוש ב-RequestCard כפי שמופיע בעיצוב */}
        <main className="content-scroll-area">
          {activeTab === "available" ? (
            availableRequests.map((req) => (
              <RequestCard 
                key={req.requestId || req.id} 
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
                key={task.requestId || task.id} 
                task={task} 
                now={now} 
                variant="inProgress"
                onComplete={() => handleCompleteRequest(task)}
              />
            ))
          )}
        </main>

        {/* כפתור יציאה קטן בתחתית (אופציונלי, כדי שלא יהיה תקוע ב-Hero) */}
        <button onClick={handleLogout} style={{margin: '10px', background: 'none', border: 'none', color: '#8e8e93', fontSize: '12px', cursor: 'pointer'}}>
          התנתקות מהמערכת
        </button>
      </div>
    </div>
  );
}