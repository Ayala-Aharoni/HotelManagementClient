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
import "./dashborad.css";

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
  } catch {
    return true;
  }
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [availableRequests, setAvailableRequests] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const [now, setNow] = useState(Date.now());
  const [activeTab, setActiveTab] = useState<"available" | "mine" | "done">("available");

  const [takeRequestTrigger] = useTakeRequestMutation();
  const [completeRequestTrigger] = useCompleteRequestMutation();
  const [rejectToReceptionTrigger] = useRejectToReceptionMutation();
  const [triggerGetMyTasks] = useLazyGetMyTasksQuery();
  const [triggerGetAvailable] = useLazyGetAvailableRequestsQuery();

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
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        connection.invoke("JoinCategoryGroup", parseInt(categoryId));
        connection.on("ReceiveNotification", (n: any) =>
          setAvailableRequests((prev) => [...prev, n])
        );
        connection.on("RemoveRequestFromUI", (id: number) =>
          setAvailableRequests((prev) =>
            prev.filter((req) => (req.requestId || req.id) !== id)
          )
        );
      })
      .catch(console.error);

    return () => { connection.stop(); };
  }, [token, user]);

  const handleTakeRequest = async (request: any) => {
    const rId = request.requestId || request.id;
    try {
      await takeRequestTrigger({ requestId: rId }).unwrap();
      setMyTasks((prev) => [...prev, { ...request, status: "InProgress", updatedAt: new Date().toISOString() }]);
      setAvailableRequests((prev) => prev.filter((req) => (req.requestId || req.id) !== rId));
    } catch {
      alert("נכשל בלקיחת בקשה");
    }
  };

  const handleCompleteRequest = async (task: any) => {
    const rId = task.requestId || task.id;
    try {
      await completeRequestTrigger({ requestId: rId }).unwrap();
      setMyTasks((prev) => prev.filter((req) => (req.requestId || req.id) !== rId));
      setCompletedTasks((prev) => [{ ...task, status: "Completed" }, ...prev]);
    } catch {
      alert("שגיאה בסיום המשימה");
    }
  };

  const handleRejectRequest = async (req: any) => {
    const rId = req.requestId || req.id;
    try {
      await rejectToReceptionTrigger({ requestId: rId }).unwrap();
      setAvailableRequests((prev) => prev.filter((r) => (r.requestId || r.id) !== rId));
    } catch {
      alert("שגיאה בהעברה לקבלה");
    }
  };

  const tabs = [
    { key: "available", label: "בקשות חדשות", count: availableRequests.length, icon: "🔔" },
    { key: "mine", label: "בטיפולי", count: myTasks.length, icon: "⚡" },
    { key: "done", label: "הושלמו", count: completedTasks.length, icon: "✅" },
  ];

  return (
    <div className="dashboard" dir="rtl">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-right">
          <div className="hotel-logo">
            <span className="logo-icon">🏨</span>
            <div>
              <div className="hotel-name">Hotel Ops</div>
              <div className="header-sub">
                מחלקה: <strong>{user?.CategoryId || "לא ידוע"}</strong>
              </div>
            </div>
          </div>
        </div>
        <div className="header-center">
          <div className="live-clock">
            <span className="live-dot" />
            {new Date(now).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
        <div className="header-left">
          <div className="user-info">
            <div className="user-avatar">{(user?.name || "U")[0]}</div>
            <span className="user-name">{user?.name || "משתמש"}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>יציאה</button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="stats-bar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`stat-card ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key as any)}
          >
            <span className="stat-icon">{tab.icon}</span>
            <div className="stat-info">
              <span className="stat-count">{tab.count}</span>
              <span className="stat-label">{tab.label}</span>
            </div>
            {tab.count > 0 && tab.key === "available" && (
              <span className="badge">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="dashboard-main">
        {activeTab === "available" && (
          <div className="requests-grid">
            {availableRequests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎉</div>
                <p>אין בקשות חדשות כרגע</p>
              </div>
            ) : (
              availableRequests.map((req, i) => (
                <div key={req.requestId || req.id || i} className="request-card new">
                  <div className="card-header">
                    <div className="room-badge">חדר {req.roomNumber || "---"}</div>
                    <span className="time-tag">{getRelativeTime(req.createdAt, now)}</span>
                  </div>
                  <p className="card-desc">{req.description}</p>
                  <div className="card-actions">
                    <button className="btn-take" onClick={() => handleTakeRequest(req)}>
                      קח טיפול
                    </button>
                    <button className="btn-reject" onClick={() => handleRejectRequest(req)}>
                      לא רלוונטי
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "mine" && (
          <div className="requests-grid">
            {myTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">😊</div>
                <p>אין משימות פעילות</p>
              </div>
            ) : (
              myTasks.map((task, i) => (
                <div key={task.requestId || task.id || i} className="request-card in-progress">
                  <div className="card-header">
                    <div className="room-badge teal">חדר {task.roomNumber || "---"}</div>
                    <span className="time-tag">{getRelativeTime(task.updatedAt || task.createdAt, now)}</span>
                  </div>
                  <p className="card-desc">{task.description}</p>
                  <div className="card-actions">
                    <button className="btn-done" onClick={() => handleCompleteRequest(task)}>
                      סיימתי ✓
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "done" && (
          <div className="requests-grid">
            {completedTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p>אין משימות שהושלמו</p>
              </div>
            ) : (
              completedTasks.map((task, i) => (
                <div key={i} className="request-card done">
                  <div className="card-header">
                    <div className="room-badge gray">חדר {task.roomNumber || "---"}</div>
                    <span className="done-tag">הושלם ✓</span>
                  </div>
                  <p className="card-desc">{task.description}</p>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}