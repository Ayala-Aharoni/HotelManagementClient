import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const requestApi = createApi({
  reducerPath: "requestApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: "https://localhost:7237/api/",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({


    // בתוך requestApi (בקובץ requestAPI.ts)
addRequest: builder.mutation<void, { Description: string }>({
    query: (newRequest) => ({
      url: 'Request',
      method: 'POST',
      body: newRequest, // כאן עובר האובייקט עם ה-description
    }),
  }),
 
// בתוך ה-endpoints של requestAPI.ts
takeRequest: builder.mutation({
    query: ({ requestId }) => ({
      // שינוי מ-Requests ל-Request (בדיוק כמו בסווגאר!)
      url: `Request/take/${requestId}`, 
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }),
  }),
    // סיום בקשה
    completeRequest: builder.mutation<void, { requestId: number }>({
      query: ({ requestId }) => ({
        // כאן מחקנו את ה-employeeId מהסוף!
        url: `Request/complete/${requestId}`, 
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }),
    }),
    getMyTasks: builder.query<any[], void>({ // void כי אנחנו לא שולחים פרמטר!
      query: () => ({
        url: `Request/my-tasks`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
       
      }),
    }),
  }),

  // בתוך requestAPI.ts

});

export const {
  useTakeRequestMutation,
  useCompleteRequestMutation,
  useAddRequestMutation,
  useLazyGetMyTasksQuery
} = requestApi;