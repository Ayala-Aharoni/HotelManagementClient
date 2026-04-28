import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './employeelist.css'; 
import { useGetAllEmployeesQuery, type Employee } from '../employeeApi';
import EmployeeCard from '../Components/employeeCard'; // ייבוא הקומפוננטה החדשה

const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const { data: employees = [], isLoading, isError } = useGetAllEmployeesQuery();
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp: Employee) => {
      const matchesSearch = emp.fullname?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDept === 'all' || emp.role === selectedDept; 
      return matchesSearch && matchesDept;
    });
  }, [employees, searchTerm, selectedDept]);

  if (isLoading) return <div className="loading-state">טוען נתונים מהשרת...</div>;
  if (isError) return <div className="error-state">שגיאה בחיבור ל-API</div>;

  return (
    <div className="employee-container">
      <div className="phone-frame">
        
        {/* Header */}
        <div className="header">
          <div className="header-top">
            <button className="icon-btn" onClick={() => navigate(-1)}>←</button>
            <span className="header-title">ניהול צוות</span>
            <span>🔔</span>
          </div>
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-num">{employees.length}</span>
              <span className="stat-label">סה"כ</span>
            </div>
            <div className="stat-card">
              <span className="stat-num green">
                {employees.filter(e => e.Role !== 'עסוק').length}
              </span>
              <span className="stat-label">זמינים</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="search-section">
          <div className="search-bar">
            <input 
              placeholder="חפש עובד..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Staff List - כאן השליחה לקומפוננטה! */}
        <div className="staff-section">
          <div className="section-label">רשימת עובדים</div>
          {filteredEmployees.map((emp) => (
            <EmployeeCard 
              key={emp.Id} 
              employee={emp} 
              onClick={(id) => navigate(`/admin/staff/${id}`)} 
            />
          ))}
          
          {filteredEmployees.length === 0 && (
            <div style={{ textAlign: 'center', color: '#aaa', marginTop: '40px' }}>
              לא נמצאו עובדים
            </div>
          )}
        </div>

        <div className="fab" onClick={() => navigate('/admin/register-employee')}>+</div>
      </div>
    </div>
  );
};

export default EmployeeList;