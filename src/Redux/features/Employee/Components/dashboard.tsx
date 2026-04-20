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
  useRejectToReceptionMutation // <--- תוספת 1
} from "../../Requests/requestAPI";

// --- פונקציה לחישוב זמן יחסי ---
const getRelativeTime = (dateString: string, currentTime: number) => {
  if (!dateString) return "";
  const past = new Date(dateString);
  const diffInMs = currentTime - past.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  if (diffInMinutes < 1) return "ממש עכשיו";
  if (diffInMinutes < 60) return `לפני ${diffInMinutes} דקות`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `לפני ${diffInHours} שעות`;
  
  return past.toLocaleDateString('he-IL'); 
};

const isTokenExpired = (token: string | null) => {
  if (!token) return true;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const { exp } = JSON.parse(jsonPayload);
    return exp < Date.now() / 1000;
  } catch (e) {
    return true;
  }
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);

  // --- States ---
  const [availableRequests, setAvailableRequests] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const [now, setNow] = useState(Date.now()); 

  const [takeRequestTrigger] = useTakeRequestMutation();
  const [completeRequestTrigger] = useCompleteRequestMutation();
  const [rejectToReceptionTrigger] = useRejectToReceptionMutation(); // <--- תוספת 2
  const [triggerGetMyTasks] = useLazyGetMyTasksQuery();
  const [triggerGetAvailable] = useLazyGetAvailableRequestsQuery();

  const handleLogout = () => {
    dispatch(setLogout());
    navigate("/login");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000); 
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
        setMyTasks(tasks.filter((t: any) => t.status === "InProgress"));
        setCompletedTasks(tasks.filter((t: any) => t.status === "Completed"));

        const available = await triggerGetAvailable().unwrap();
        setAvailableRequests(available);
      } catch (err: any) {
        if (err.status === 401) handleLogout();
      }
    };

    fetchData();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7237/requestHub", {
          accessTokenFactory: () => token 
      })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        connection.invoke("JoinCategoryGroup", parseInt(categoryId));
        connection.on("ReceiveNotification", (n: any) => setAvailableRequests((prev) => [...prev, n]));
        connection.on("RemoveRequestFromUI", (id: number) => {
          setAvailableRequests((prev) => prev.filter(req => (req.requestId || req.id) !== id));
        });
      })
      .catch(console.error);

    return () => { connection.stop(); };
  }, [token, user]);

  const handleTakeRequest = async (request: any) => {
    const rId = request.requestId || request.id;
    try {
      await takeRequestTrigger({ requestId: rId }).unwrap();
      setMyTasks((prev) => [...prev, { ...request, status: "InProgress", updatedAt: new Date().toISOString() }]);
      setAvailableRequests((prev) => prev.filter(req => (req.requestId || req.id) !== rId));
    } catch (err: any) {
      alert("נכשל בלקיחת בקשה");
    }
  };

  const handleCompleteRequest = async (task: any) => {
    const rId = task.requestId || task.id;
    try {
      await completeRequestTrigger({ requestId: rId }).unwrap();
      setMyTasks((prev) => prev.filter(req => (req.requestId || req.id) !== rId));
      setCompletedTasks((prev) => [{ ...task, status: "Completed" }, ...prev]);
    } catch (err: any) {
      alert("שגיאה בסיום המשימה");
    }
  };

  // --- תוספת 3: פונקציית הניתוב מחדש ---
  const handleRejectRequest = async (req: any) => {
    const rId = req.requestId || req.id;
    try {
      await rejectToReceptionTrigger({ requestId: rId }).unwrap();
      setAvailableRequests((prev) => prev.filter(r => (r.requestId || r.id) !== rId));
    } catch (err) {
      alert("שגיאה בהעברה לקבלה");
    }
  };

  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', marginBottom: '20px', paddingBottom: '10px' }}>
        <div>
          <h1>לוח בקרה אופרטיבי</h1>
          <p>מחלקה: <strong>{user?.CategoryId || "לא ידוע"}</strong> | מעודכן ל: {new Date(now).toLocaleTimeString('he-IL')}</p>
        </div>
        <button onClick={handleLogout} style={logoutBtnStyle}>יציאה 🚪</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <section>
          <h2 style={{ color: '#007bff' }}>📢 בקשות חדשות</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {availableRequests.map((req, i) => (
              <div key={req.requestId || req.id || i} style={cardStyle}>

               <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#007bff' }}>
                  🏠 חדר: {req.roomNumber || "---"}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{req.description}</div>
                  <div style={{ fontSize: '11px', color: '#999' }}>נשלח: {getRelativeTime(req.createdAt, now)}</div>
                </div>
                {/* --- תוספת 4: הכפתור החדש פה --- */}
                <div style={{ display: 'flex', gap: '8px' }}>
                   <button onClick={() => handleTakeRequest(req)} style={takeBtnStyle}>טפל!</button>
                   <button onClick={() => handleRejectRequest(req)} style={{...takeBtnStyle, backgroundColor: '#ffc107', color: 'black'}}>לא קשור אליי ❌</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ borderRight: '2px solid #eee', paddingRight: '20px' }}>
          <h2 style={{ color: '#28a745' }}>🛠️ בטיפול שלי</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myTasks.map((task, i) => (
              <div key={task.requestId || task.id || i} style={{ ...cardStyle, borderRightColor: '#28a745' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{task.description}</div>
                  <div style={{ fontSize: '11px', color: '#999' }}>זמן טיפול: {getRelativeTime(task.updatedAt || task.createdAt, now)}</div>
                </div>
                <button onClick={() => handleCompleteRequest(task)} style={doneBtnStyle}>סיימתי ✅</button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <hr style={{ margin: '40px 0', border: '0', borderTop: '2px dashed #eee' }} />
      <section>
        <h2 style={{ color: '#6c757d' }}>✅ משימות שסיימתי</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
          {completedTasks.map((task, i) => (
              <div key={i} style={{ ...cardStyle, borderRightColor: '#6c757d', backgroundColor: '#fdfdfd', opacity: 0.8 }}>
                <span>{task.description}</span>
                <span style={{ fontSize: '11px', color: '#28a745', fontWeight: 'bold' }}>הושלם!</span>
              </div>
            ))
          }
        </div>
      </section>
    </div>
  );
}

const logoutBtnStyle = { backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' as const };
const cardStyle: any = { backgroundColor: '#fff', padding: '16px', borderRadius: '8px', borderRight: '5px solid #007bff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' };
const takeBtnStyle = { backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const doneBtnStyle = { backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };