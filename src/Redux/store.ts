import { configureStore } from '@reduxjs/toolkit';
import { employeeApi } from './features/Employee/employeeApi';
import { requestApi } from './features/Requests/requestAPI';    

export const store = configureStore({
  reducer: {
    [employeeApi.reducerPath]: employeeApi.reducer,
    [requestApi.reducerPath]: requestApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(employeeApi.middleware, requestApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;