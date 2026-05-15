import { useState } from "react";
import { useSetupRoomMutation } from "../RoomAPI"; 
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';

import { setLogin } from '../../Employee/authSlice';
import { 
  Box, TextField, Button, Typography, IconButton, InputAdornment, Alert 
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBackIosNew, MeetingRoom, Badge } from '@mui/icons-material';
import staffHeaderImg from "../../../../assets/doors-pict.jpg";

export default function TabletSetup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roomNumber, setRoomNumber] = useState(""); 
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); 
  
  const [setupRoom, { isLoading }] = useSetupRoomMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(""); 
    try {
      const response = await setupRoom({ 
        AdminEmail: email, 
        AdminPassword: password, 
        RoomNumber: roomNumber 
      }).unwrap();

      // RTK Query מחזיר לפעמים את הטוקן ישירות או בתוך אובייקט, תלוי בקונטרולר שלך
      const token = response?.token || response;
      
      if (token) {
        localStorage.setItem("roomNumber", roomNumber);
        // וודאי שהפונקציה setLogin מיובאת נכון מה-Slice שלך
        dispatch(setLogin({ token }));
        navigate("/room/dashboard"); 
      }
    } catch (err: any) {
      // כאן קורה הקסם: מחלצים את ההודעה מהשרת
      // 1. בודקים אם יש הודעה ב-data.message (camelCase)
      // 2. בודקים אם יש הודעה ב-data.Message (PascalCase - נפוץ ב-C#)
      // 3. בודקים אם ה-data הוא בעצמו מחרוזת של שגיאה
      
      const extractedMessage = 
        err.data?.message || 
        err.data?.Message || 
        (typeof err.data === 'string' ? err.data : null);

      setErrorMsg(extractedMessage || "אירעה שגיאה בחיבור לשרת. בדקו את הנתונים ונסו שנית.");
      
      console.error("Setup Error:", err); // כדאי להשאיר בלוג בשביל הפיתוח
    }
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'white' }}>
      
      {/* Header Section */}
      <Box sx={{ position: 'relative', height: '30%', width: '100%' }}>
        <IconButton 
          onClick={() => navigate("/")}
          sx={{ 
            position: 'absolute', top: 20, left: 20, zIndex: 10,
            bgcolor: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' }
          }}
        >
          <ArrowBackIosNew sx={{ color: 'white', fontSize: 18 }} />
        </IconButton>
        <Box 
          component="img" 
          src={staffHeaderImg} 
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <Box sx={{ 
          position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8))',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          p: 3, color: 'white'
        }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Device Setup</Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>Connect tablet to a room</Typography>
        </Box>
      </Box>

      {/* Form Section */}
      <Box sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Registration</Typography>
          <Typography variant="body2" color="text.secondary">Enter your staff credentials and room number</Typography>
        </Box>

        <Box component="form" onSubmit={handleSetup} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
          
          <TextField
            label="Email Address"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TextField
            label="Password"
            variant="outlined"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Room Number"
            placeholder="e.g., 101"
            variant="outlined"
            fullWidth
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MeetingRoom sx={{ color: 'text.secondary', mr: 1 }} />
                </InputAdornment>
              ),
            }}
          />

          <Button 
            type="submit" 
            variant="contained" 
            size="large"
            disabled={isLoading}
            sx={{ 
              py: 2, mt: 1, borderRadius: '12px', fontWeight: 700, bgcolor: '#1c1c1e',
              '&:hover': { bgcolor: '#333' }
            }}
          >
            {isLoading ? "Connecting..." : "ACTIVATE TABLET"}
          </Button>
        </Box>

        <Typography variant="caption" sx={{ mt: 'auto', textAlign: 'center', color: 'text.disabled' }}>
          SmartStay Secure System © 2026
        </Typography>
      </Box>
    </Box>
  );
}