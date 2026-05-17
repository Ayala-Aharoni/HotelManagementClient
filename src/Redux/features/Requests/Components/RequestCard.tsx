import React from 'react';
import './RequestCard.css';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver'; // אייקון של דמות מדברת



export function RequestCard({ task, now, variant, onTake, onComplete, onReject,readOnly = false }: any) {
  // console.log("Task data in card:", task);
  const isAvailable = variant === "available";

  const room = task.roomNumber || task.RoomNumber || "---";
  const desc = task.description || task.Description || "No description provided";
   

  const formatTimeDisplay = () => {
    // וודא שיש שדה של זמן מהשרת (תוודא שזה השם הנכון: createdAt או requestDate)
    const startTime = new Date(task.createdAt || task.requestTime || task.createdDate).getTime();
    if (!startTime) return "---";

    const diffInMs = now - startTime;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;

    // אם עברו יותר מ-24 שעות, נציג תאריך
    return new Date(startTime).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const timeDisplay = formatTimeDisplay();



  return (
    <div className={`hotel-card-v3 ${variant}`}>
      <div className="card-top-row">
        <div className="room-plate">
          <span className="plate-label">ROOM</span>
          <span className="plate-number">{room}</span>
        </div>
        <div className="status-time-group">
          <span className="task-label">NEW REQUEST</span>
          <span className="time-label">{timeDisplay}</span>
        </div>
      </div>

      {/* תיבת תוכן עם אייקון "קול קורא" */}
      <div className="request-content-box">
        <div className="content-scroll-area">
          <RecordVoiceOverIcon sx={{ 
            fontSize: 18, 
            verticalAlign: 'middle', 
            marginRight: '8px', 
            color: '#d4af37', // צבע זהב עדין שתואם לעיצוב
            opacity: 0.8 
          }} />
          {desc}
        </div>
      </div>

      {!readOnly && (
        <div className="card-actions-row">
          {isAvailable ? (
            <>
              <button className="btn-main accept" onClick={onTake}>Accept Task</button>
              <button className="btn-side reject" onClick={onReject}>Decline</button>
            </>
          ) : (
            <button className="btn-main complete" onClick={onComplete}>Mark as Done</button>
          )}
        </div>
      )}
    </div>
  );
}