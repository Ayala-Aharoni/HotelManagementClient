import { useState } from "react";
import { useAddEmployeeMutation } from "../employeeApi";

export default function RegisterEmployee() {
  const [formData, setFormData] = useState({
    Fullname: "",
    Email: "",
    PassWord: "",
    Role: "Employee", // ערך ברירת מחדל שתואם ל-Enum ב-C#
    CategoryId: 1
  });

  const [addEmployee, { isLoading }] = useAddEmployeeMutation();

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      // המרה למספר עבור ה-ID, השאר נשאר מחרוזת
      [name]: name === "CategoryId" ? parseInt(value) || 0 : value 
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      console.log("שולח לשרת:", formData);
      await addEmployee(formData).unwrap();
      
      alert("העובד נרשם בהצלחה!");
      // איפוס טופס
      setFormData({ Fullname: "", Email: "", PassWord: "", Role: "Employee", CategoryId: 1 });
    } catch (err: any) {
      console.error("פרטי השגיאה מהקונסול:", err);
      // אם יש שגיאות ולידציה ספציפיות מהשרת, ננסה להציג אותן
      const serverErrors = err.data?.errors;
      if (serverErrors) {
        const messages = Object.values(serverErrors).flat().join("\n");
        alert("שגיאת ולידציה:\n" + messages);
      } else {
        alert("שגיאה כללית בהרשמה. בדקי את הקונסול.");
      }
    }
  };

  return (
    <div style={{ direction: 'rtl', padding: '20px', maxWidth: '450px', margin: '0 auto', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center' }}>הרשמת עובד חדש</h2>
      <form onSubmit={handleSubmit}>
        
        <div style={{ marginBottom: '10px' }}>
          <label>שם מלא: </label>
          <input name="Fullname" type="text" value={formData.Fullname} onChange={handleChange} required style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>אימייל: </label>
          <input name="Email" type="email" value={formData.Email} onChange={handleChange} required style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>סיסמה: </label>
          <input name="PassWord" type="password" value={formData.PassWord} onChange={handleChange} required style={{ width: '100%' }} placeholder="לפחות 6 תווים, אות ומספר" />
        </div>

        {/* שדה ה-Role החדש */}
        <div style={{ marginBottom: '10px' }}>
          <label>תפקיד: </label>
          <select name="Role" value={formData.Role} onChange={handleChange} style={{ width: '100%', padding: '5px' }}>
            <option value="Employee">עובד (Employee)</option>
            <option value="Admin">מנהל (Admin)</option>
            <option value="Requester">מבקש (Requester)</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>מזהה קטגוריה (ID מה-SQL): </label>
          <input name="CategoryId" type="number" value={formData.CategoryId} onChange={handleChange} required style={{ width: '100%' }} />
        </div>

        <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {isLoading ? "שולח נתונים..." : "בצע הרשמה"}
        </button>
      </form>
    </div>
  );
}