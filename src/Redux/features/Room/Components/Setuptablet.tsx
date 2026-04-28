import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useSetupRoomMutation } from '../RoomApi';  
const RoomSetup = ({ onComplete }: { onComplete: () => void }) => {
  const [roomNumber, setRoomNumber] = useState('');
  const [setupRoom, { isLoading }] = useSetupRoomMutation();

  const handleSetup = async () => {
    // בדיקה בסיסית לפני שבכלל פונים לשרת
    if (!roomNumber.trim()) {
      toast.error("נא להזין מספר חדר");
      return;
    }

    try {
      const result = await setupRoom({ roomNumber }).unwrap(); 
      const tokenString = result.token;
      localStorage.setItem("roomToken", tokenString);
      
      toast.success(`הטאבלט הוגדר בהצלחה!`);
      onComplete();

    } catch (err: any) {
      // 1. בדיקה אם השרת בכלל לא זמין (נפל/כיבוי/בעיית רשת)
      if (err.status === 'FETCH_ERROR') {
        toast.error("השרת לא זמין. וודאי שה-Backend פועל ושאת מחוברת לרשת.");
        return; // עוצרים כאן
      }

      // 2. בדיקה אם השרת החזיר שגיאה לוגית (כמו AppException מה-C#)
      const errMsg = err.data?.message || "קרתה שגיאה בלתי צפויה";
      toast.error(errMsg);

      console.error("פרטי השגיאה לדיבאג:", err);
    }
  };

  return (
    <div className="setup-container">
      <h2>הגדרת טאבלט ראשונית</h2>
      <input 
        type="text" 
        placeholder="מספר חדר (למשל 101)" 
        value={roomNumber}
        onChange={(e) => setRoomNumber(e.target.value)}
      />
      <button onClick={handleSetup} disabled={isLoading}>
        {isLoading ? 'מתחבר...' : 'חבר טאבלט'}
      </button>
    </div>
  );
};

export default RoomSetup;