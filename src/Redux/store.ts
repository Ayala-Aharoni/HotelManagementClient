import { configureStore } from '@reduxjs/toolkit';
import { employeeApi } from './features/Employee/employeeApi';
import { requestApi } from './features/Requests/requestAPI';   
import authReducer from './features/Employee/authSlice.tsx'; 
import { categoryApi } from './features/Category/CategoryAPI.tsx';
import { roomApi } from './features/Room/RoomApi.tsx';

export const store = configureStore({
  reducer: {
    auth: authReducer, // הוספת ה-Auth לרידקס
    [employeeApi.reducerPath]: employeeApi.reducer,
    [requestApi.reducerPath]: requestApi.reducer,
    [categoryApi.reducerPath]:categoryApi.reducer,
    [roomApi  .reducerPath]: roomApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(employeeApi.middleware, requestApi.middleware,categoryApi.middleware,roomApi.middleware), 
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;