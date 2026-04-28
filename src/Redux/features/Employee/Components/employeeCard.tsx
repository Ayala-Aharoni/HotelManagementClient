import React from 'react';

// השתמשתי ב-any כדי למנוע שגיאות Type, אבל השמות תואמים ל-DTO שלך
const EmployeeCard = ({ employee, onClick }: { employee: any, onClick: (id: number) => void }) => {
  
  // השדה מגיע מהשרת כ-isAviable (אות קטנה בהתחלה)
  const isAvailable = employee.isAviable; 

  return (
    <div className="staff-card" onClick={() => employee.employeeId && onClick(employee.employeeId)}>
      <div className="avatar av-blue">
        {/* הגנה: לוקח אות ראשונה רק אם fullname קיים */}
        {employee.fullname ? employee.fullname[0] : '?'}
        
        {/* הנקודה משנה צבע לפי השדה האמיתי מה-DB */}
        <div className={`status-dot ${isAvailable ? 'dot-available' : 'dot-busy'}`}></div>
      </div>
      
      <div className="staff-info">
        <div className="staff-name">{employee.fullname || 'ללא שם'}</div>
        <div className="staff-role">{employee.role || 'עובד'}</div>
        <span className="dept-badge">{employee.categoryName || 'כללי'}</span>
      </div>

      <div className="staff-meta">
        {/*Badge הסטטוס משתנה לפי ה-bool מהשרת */}
        <span className={`avail-badge ${isAvailable ? 'avail-available' : 'avail-busy'}`}>
        {isAvailable ? 'זמין ✓' : 'לא זמין ✖'}
        </span>
        <span className="arrow">›</span>
      </div>
    </div>
  );
};

export default EmployeeCard;