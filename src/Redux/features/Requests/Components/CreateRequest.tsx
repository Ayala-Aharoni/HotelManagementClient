import { useState } from "react";
import { useAddRequestMutation } from "../../Requests/requestAPI";
import { Rating, Typography, Box } from "@mui/material";
import { toast } from 'react-hot-toast';

import "./CreateRequst.css";
import staffHeaderImg from "../../../../assets/doors-pict.jpg";



export default function SimpleAddRequest() {
  const [description, setDescription] = useState<string>("");
  const [rating, setRating] = useState<number | null>(5);
  const [addRequest, { isLoading }] = useAddRequestMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // 1. שליפת המזהה (הטוקן/ID) מהאחסון המקומי
    const roomId = localStorage.getItem("roomNumber"); // או localStorage.getItem("token") בהתאם למה ששמרת
  
    // 2. בדיקה: האם המכשיר בכלל מזוהה? (חייב להיות מזהה כדי לשלוח בקשה)
    if (!roomId) {
      toast.error("תקלה בזיהוי המכשיר. אנא פנה לקבלה להגדרה מחדש.");
      return; // חסימה! לא פונים לשרת אם אנחנו לא יודעים איזה חדר זה
    }
  
    // 3. בדיקת תוכן: האם השדה ריק או מכיל רק רווחים?
    if (!description.trim()) {
      // אם ה-HTML5 required לא קפץ, אנחנו חוסמים כאן
      toast.error("אופס! שכחת לכתוב מה אתה צריך");
      return; 
    }
  
    try {
      // 4. שליחה לשרת - שימי לב שאנחנו משתמשים ב-roomId ששלפנו למעלה
      await addRequest({ 
        Description: description,
      }).unwrap();
      
      // 5. הצלחה וניקוי
      toast.success("הבקשה נשלחה בהצלחה!");
      setDescription(""); 
  
    } catch (err: any) {
      // 6. טיפול בשגיאות שחזרו מהשרת (למשל: חדר לא קיים ב-DB)
      const errorMsg = err.data?.message || "משהו השתבש בשליחה... נסה שוב";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="app-container">
      <div className="mobile-view">
        
        {/* Hero Section */}
        <div className="hero-section">
          <div className="overlay-content">
            <h1 className="welcome-text">We're happy to<br/>have you here</h1>
            <p className="sub-welcome">Enjoy your stay with us</p>
          </div>
          <img 
            src={staffHeaderImg} 
            alt="Hotel Luxury" 
            className="hero-image"
          />
        </div>

        {/* Content Section */}
        <div className="form-content">
          <h2 className="main-title">How can we help you?</h2>
          
          <form onSubmit={handleSubmit} className="request-form">
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your request here..."
              required
              className="styled-textarea"
            />
            <button type="submit" disabled={isLoading} className="styled-submit-btn">
              {isLoading ? "Sending..." : "Send Request"}
            </button>
          </form>

          {/* Footer & Rating */}
          <div className="bottom-wrapper">
            <Box className="rating-section">
              <Typography component="legend" className="rating-label">Enjoying the service?</Typography>
              <Rating
                name="hotel-rating"
                value={rating}
                precision={0.5}
                onChange={(event, newValue) => setRating(newValue)}
              />
            </Box>

            <footer className="app-footer">
              <p>© ALL RIGHTS RESERVED TO HOTELAPP 2026</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}