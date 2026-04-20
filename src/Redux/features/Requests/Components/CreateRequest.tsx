import { useState } from "react";
import { useAddRequestMutation } from "../../Requests/requestAPI";

export default function SimpleAddRequest() {
  const [description, setDescription] = useState("");
  const [addRequest, { isLoading }] = useAddRequestMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // תיקון: שינינו ל-Description עם D גדולה כדי להתאים ל-C# DTO
      await addRequest({ Description: description }).unwrap();
      // בתוך CreateRequest.tsx, לפני הקריאה ל-API


      alert("הבקשה נשלחה! עכשיו השרת מסווג אותה...");
      setDescription(""); 
    } catch (err) {
      console.error("פרטי השגיאה:", err);
      alert("אופס, משהו השתבש בשליחה.");
    }
  };

  return (
    <div style={{ padding: '20px', direction: 'rtl' }}>
      <h1>שלום! במה אפשר לעזור?</h1>
      
      <form onSubmit={handleSubmit}>
        <p>תאר את הבעיה שלך כאן:</p>
        
        <textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          placeholder="למשל: נשרף לי המנורה בחדר או שיש הצפה בקומה 3..."
          required
          style={{ width: '300px', height: '100px', display: 'block', marginBottom: '10px', padding: '10px' }}
        />

        <button 
          type="submit" 
          disabled={isLoading}
          style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: isLoading ? '#ccc' : '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {isLoading ? "שולח..." : "שלח בקשה"}
        </button>
      </form>
    </div>
  );
}