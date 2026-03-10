import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { jwtDecode } from "jwt-decode";
import { useCompleteRequestMutation, useLazyGetMyTasksQuery, useTakeRequestMutation } from "../../Requests/requestAPI";

export default function Dashboard() {
  const [availableRequests, setAvailableRequests] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [category, setCategory] = useState<string>("טוען...");
  const [myEmployeeId, setMyEmployeeId] = useState<number | null>(null);

  const [takeRequestTrigger] = useTakeRequestMutation();  
  const [completeRequestTrigger] = useCompleteRequestMutation();

  const [triggerGetMyTasks] = useLazyGetMyTasksQuery();//זה לטעינת הבקשות שהוא באמצע !

  useEffect(() => {
    const token = localStorage.getItem("token");
    let categoryIdFromToken: string | null = null;
  
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        
        // שליפת קטגוריה מהטוקן
        const catId = decoded.CategoryId || decoded.categoryId || decoded.Category || decoded.category;
        if (catId) {
          categoryIdFromToken = catId.toString();
          setCategory(categoryIdFromToken);
        }
  
        // שליפת מזהה עובד
        const rawEmpId = decoded.nameid || decoded.sub || decoded.id || decoded.unique_name;
        if (rawEmpId) setMyEmployeeId(Number(rawEmpId));
        
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
  
    // טעינת משימות קיימות מהשרת
    const loadMyTasks = async () => {
      try {
        const tasks = await triggerGetMyTasks().unwrap();
        setMyTasks(tasks); 
      } catch (err) {
        console.error("Failed to load existing tasks:", err);
      }
    };
  
    if (token) {
      loadMyTasks();
    }
  
    // חיבור SignalR רק אם יש קטגוריה
    if (!categoryIdFromToken) return;
  
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7237/requestHub")
      .withAutomaticReconnect()
      .build();
  
    connection.start()
      .then(() => {
        connection.invoke("JoinCategoryGroup", parseInt(categoryIdFromToken!));
  
        connection.on("ReceiveNotification", (notification: any) => {
          setAvailableRequests((prev) => [...prev, notification]);
        });
  
        connection.on("RemoveRequestFromUI", (requestId: number) => {
          setAvailableRequests((prev) => prev.filter(req => (req.requestId || req.id) !== requestId));
        });
      })
      .catch(err => console.error("SignalR Connection Error:", err));
  
    return () => { 
      connection.stop(); 
    };
  }, [triggerGetMyTasks]);
  // --- לקיחת בקשה ---
  const handleTakeRequest = async (request: any) => {
    const rId = request.requestId || request.id || request.RequestId || request.Id;
    if (!rId) {
      alert("שגיאה: לא נמצא מזהה לבקשה.");
      return;
    }

    try {
      // שולחים רק requestId כפי שמוגדר ב-Controller החדש שלך
      await takeRequestTrigger({ requestId: rId }).unwrap(); 
      
      setMyTasks((prev) => [...prev, request]);
      // מסירים מהרשימה הכללית כי זה כבר אצלי
      setAvailableRequests((prev) => prev.filter(req => (req.requestId || req.id) !== rId));
      
      alert("הבקשה עברה לטיפולך!");
    } catch (err: any) {
      console.error("שגיאה בשרת:", err);
      if (err.status === 401 || err.status === 403) {
        alert("שגיאת הרשאה: ודאי שאת מחוברת כעובד (Employee)");
      } else {
        alert(`נכשל: ${err.data?.message || "ודאי שהנתיב ב-requestAPI תקין (take/id)"}`);
      }
    }
  };

  // --- סיום בקשה ---
  const handleCompleteRequest = async (task: any) => {
    const rId = task.requestId || task.id || task.RequestId || task.Id;
  
    try {
      // שולחים רק את ה-requestId. ה-API כבר ידאג להדביק את הטוקן ב-Headers
      await completeRequestTrigger({ requestId: rId }).unwrap();
  
      setMyTasks((prev) => prev.filter(req => (req.requestId || req.id) !== rId));
      alert("המשימה הסתיימה בהצלחה!");
    } catch (err: any) {
      console.error("Error completing task:", err);
      alert("שגיאה בסיום המשימה. ודאי שאת מחוברת.");
    }
  };

  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
      <header style={{ borderBottom: '2px solid #eee', marginBottom: '20px', paddingBottom: '10px' }}>
        <h1>לוח בקרה אופרטיבי</h1>
        <p>מחלקה: <strong>{category}</strong> | עובד: <strong>{myEmployeeId || "מזוהה ע״י טוקן"}</strong></p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <section>
          <h2 style={{ color: '#007bff' }}>📢 בקשות חדשות</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {availableRequests.length === 0 ? <p>אין בקשות כרגע.</p> : 
              availableRequests.map((req, index) => (
                <div key={req.requestId || req.id || index} style={cardStyle}>
                  <span>{req.description || "בקשה ללא תיאור"}</span>
                  <button onClick={() => handleTakeRequest(req)} style={takeBtnStyle}>אני מטפל!</button>
                </div>
              ))
            }
          </div>
        </section>

        <section style={{ borderRight: '2px solid #eee', paddingRight: '20px' }}>
          <h2 style={{ color: '#28a745' }}>🛠️ המשימות שלי</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myTasks.length === 0 ? <p>אין משימות פעילות.</p> : 
              myTasks.map((task, index) => (
                <div key={task.requestId || task.id || index} style={{ ...cardStyle, borderRightColor: '#28a745' }}>
                  <span>{task.description}</span>
                  <button onClick={() => handleCompleteRequest(task)} style={doneBtnStyle}>סיימתי ✅</button>
                </div>
              ))
            }
          </div>
        </section>
      </div>
    </div>
  );
}

const cardStyle: any = { backgroundColor: '#fff', padding: '16px', borderRadius: '8px', borderRight: '5px solid #007bff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
const takeBtnStyle = { backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const doneBtnStyle = { backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };