import { jwtDecode } from 'jwt-decode';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit'; // שימי לב למילה type
// טיפוס של המשתמש מתוך הטוקן
interface UserPayload {
  nameid: string;
  unique_name: string;
  role: 'Admin' | 'Employee';
  exp: number;
}

interface AuthState {
  token: string | null;
  user: UserPayload | null;
  isLoggedIn: boolean;
}

// בדיקה אם הטוקן עדיין בתוקף
const isTokenValid = (token: string) => {
  try {
    const decoded = jwtDecode<UserPayload>(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

// שליפה מה-LocalStorage
const savedToken = localStorage.getItem("token");

// רק אם הטוקן תקין נשמור אותו
const validToken = savedToken && isTokenValid(savedToken) ? savedToken : null;

const initialState: AuthState = {
  token: validToken,
  user: validToken ? jwtDecode<UserPayload>(validToken) : null,
  isLoggedIn: !!validToken,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLogin: (state, action: PayloadAction<{ token: string }>) => {
      const { token } = action.payload;

      state.token = token;
      state.user = jwtDecode<UserPayload>(token);
      state.isLoggedIn = true;

      localStorage.setItem("token", token);
    },

    setLogout: (state) => {
      state.token = null;
      state.user = null;
      state.isLoggedIn = false;

      localStorage.removeItem("token");
    },
  },
});

export const { setLogin, setLogout } = authSlice.actions;

export default authSlice.reducer;


// =====================
// Selectors (בלי RootState)
// =====================

// האם מחובר
export const selectIsLoggedIn = (state: any) => state.auth.isLoggedIn;

// האם מנהל
export const selectIsAdmin = (state: any) =>
  state.auth.user?.role === 'Admin';

// שם משתמש
export const selectCurrentUserName = (state: any) =>
  state.auth.user?.unique_name;

// המשתמש עצמו (אם תרצי)
export const selectCurrentUser = (state: any) =>
  state.auth.user;