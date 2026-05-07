import { createTheme } from '@mui/material/styles';

// הגדרת ערכת הנושא הגלובלית של האפליקציה
export const GlobalTheme = createTheme({
  palette: {
    primary: {
      main: '#1A2238', // כחול כהה - נותן תחושה של יוקרה ואמינות
    },
    secondary: {
      main: '#D4AF37', // זהב - מתאים לעולם המלונאות
    },
    background: {
      default: '#F5F5F5', // אפור בהיר מאוד לרקע הכללי
    }
  },
  shape: {
    borderRadius: 16, // עיגול פינות חכם לכל הכפתורים והתיבות באפליקציה
  },
  typography: {
    fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    button: {
      fontWeight: 600,
      textTransform: 'none', // מונע מהטקסט בכפתורים להיות רק באותיות גדולות
    },
  },
});