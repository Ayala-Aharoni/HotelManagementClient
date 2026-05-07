import { useState } from "react";
import { useAddRequestMutation } from "../../Requests/requestAPI";
import { Rating, Typography, Box, TextField, Button, Container } from "@mui/material";
import { toast } from 'react-hot-toast';
import staffHeaderImg from "../../../../assets/doors-pict.jpg";

export default function SimpleAddRequest() {
  const [description, setDescription] = useState<string>("");
  const [rating, setRating] = useState<number | null>(5);
  const [addRequest, { isLoading }] = useAddRequestMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const roomId = localStorage.getItem("roomNumber");
    if (!roomId) {
      toast.error("תקלה בזיהוי המכשיר. אנא פנה לקבלה.");
      return;
    }
  
    if (!description.trim()) {
      toast.error("אופס! שכחת לכתוב מה אתה צריך");
      return; 
    }
  
    try {
      await addRequest({ Description: description }).unwrap();
      toast.success("הבקשה נשלחה בהצלחה!");
      setDescription(""); 
    } catch (err: any) {
      toast.error(err.data?.message || "משהו השתבש בשליחה...");
    }
  };

  return (
    /* ה-Box הראשי שבו אנחנו "הורגים" את הגלגלת */
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      bgcolor: 'white',
      overflow: 'hidden', // מונע מהכל לצאת החוצה
      '&::-webkit-scrollbar': { display: 'none' }, // מעלים את הפס בצד לכרום
      msOverflowStyle: 'none',  // מעלים לאקספלורר
      scrollbarWidth: 'none',   // מעלים לפיירפוקס
    }}>
      
      {/* Hero Section */}
      <Box sx={{ position: 'relative', height: '40%', width: '100%', flexShrink: 0 }}>
        <Box 
          component="img" src={staffHeaderImg} 
          sx={{ width: '100%', height: '100%', objectFit: 'cover', borderBottomLeftRadius: '80px' }} 
        />
        <Box sx={{ 
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          bgcolor: 'rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', p: 4, color: 'white'
        }}>
          <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.1, mb: 1 }}>
            We're happy to<br/>have you here
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>Enjoy your stay with us</Typography>
        </Box>
      </Box>

      {/* Content Area */}
      <Box sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#1a1a1a' }}>
          How can we help you?
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            multiline
            rows={5} // הקטנתי ל-5 כדי שלא ילחץ על הלמטה
            placeholder="Describe your request here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="outlined"
            fullWidth
            sx={{ 
              '& .MuiOutlinedInput-root': {
                bgcolor: '#f9f9f9',
                borderRadius: '20px',
                '& fieldset': { borderColor: 'transparent' },
              }
            }}
          />

          <Button 
            type="submit" 
            variant="contained" 
            disabled={isLoading}
            sx={{ 
              py: 2, borderRadius: '15px', bgcolor: '#1a1a1a', fontWeight: 700,
              '&:hover': { bgcolor: '#333' }
            }}
          >
            {isLoading ? "Sending..." : "Send Request"}
          </Button>
        </Box>

        {/* Rating & Footer */}
        <Box sx={{ mt: 'auto', textAlign: 'center', pt: 2 }}>
          <Rating
            value={rating}
            precision={0.5}
            onChange={(_, newValue) => setRating(newValue)}
          />
          <Typography variant="overline" sx={{ color: '#ddd', display: 'block', mt: 1 }}>
            © HOTELAPP 2026
          </Typography>
        </Box>
      </Box>
    </Box>
  );
  
    }