import React, { useState } from 'react';
import { useSetupRoomMutation } from '../RoomApi';  

const RoomSetup = ({ onComplete }: { onComplete: () => void }) => {
  const [roomNumber, setRoomNumber] = useState('');
  const [setupRoom, { isLoading }] = useSetupRoomMutation();

  const handleSetup = async () => {
    console.log("שולח בקשה לחדר:", roomNumber);
    try {
      const result = await setupRoom({ roomNumber }).unwrap();
      console.log("הצלחה!", result);
      onComplete();
    } catch (err: any) {
      // זה ידפיס לנו בדיוק מה הבעיה (URL לא נכון, CORS, או שרת כבוי)
      console.error("טעות ב-RTK Query:", err);
      
      if (err.status === 'FETCH_ERROR') {
        alert("שגיאת תקשורת: השרת ב-C# לא עונה. בדקי שהוא מופעל!");
      } else {
        alert(`שגיאה מהשרת: ${err.status}`);
      }
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