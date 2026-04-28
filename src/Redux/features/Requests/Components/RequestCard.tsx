import React from 'react';
import './RequestCard.css';

interface RequestCardProps {
  task: any;
  now: number;
  variant: "available" | "inProgress";
  onTake?: () => void;
  onComplete?: () => void;
  onReject?: () => void;
}

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

export function RequestCard({ task, now, variant, onTake, onComplete, onReject }: RequestCardProps) {
  const isAvailable = variant === "available";
  const room = task.roomNumber || task.RoomNumber || "---";
  const desc = task.description || task.Description || "בקשת שירות";
  const timeStr = task.updatedAt || task.createdAt || task.CreatedAt || new Date().toISOString();

  return (
    <div className={`req-card-wrapper ${variant}`}>
      <div className="card-main-layout">
        <div className="card-img-aside">
           <span className="room-num-display">{room}</span>
        </div>
        <div className="card-info-area">
          <div className="card-top-line">
            <span className="request-type-label">משימה לביצוע</span>
            <span className="request-time-ago">{getRelativeTime(timeStr, now)}</span>
          </div>
          <p className="request-desc-text">{desc}</p>
        </div>
      </div>
      <div className="card-footer-actions">
        {isAvailable ? (
          <>
            <button className="action-btn primary-black" onClick={onTake}>קח טיפול</button>
            <button className="action-btn outline-gray" onClick={onReject}>לא קשור אלי</button>
          </>
        ) : (
          <button className="action-btn success-green" onClick={onComplete}>סיימתי ✓</button>
        )}
      </div>
    </div>
  );
}