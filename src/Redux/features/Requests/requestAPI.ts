import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const requestApi = createApi({
  reducerPath: "requestApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: "https://localhost:7237/api/",
    prepareHeaders: (headers) => {
      // 1. ננסה להביא את הטוקן של החדר (עבור הטאבלט)
      const roomToken = localStorage.getItem("roomToken");
      // 2. ננסה להביא את הטוקן הרגיל (עבור העובדים)
      const userToken = localStorage.getItem("token");
    
      // נשתמש במה שקיים (אם שניהם קיימים, בטאבלט נעדיף את roomToken)
      const finalToken = roomToken || userToken;
    
      if (finalToken) {
        headers.set("authorization", `Bearer ${finalToken}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({

    addRequest: builder.mutation<void, { Description: string }>({
      query: (newRequest) => ({
        url: 'Request', // <--- חזר ליחיד
        method: 'POST',
        body: newRequest,
      }),
    }),

    takeRequest: builder.mutation<void, { requestId: number }>({
      query: ({ requestId }) => ({
        url: `Request/take/${requestId}`, // <--- חזר ליחיד
        method: 'POST',
      }),
    }),

    completeRequest: builder.mutation<void, { requestId: number }>({
      query: ({ requestId }) => ({
        url: `Request/complete/${requestId}`, // <--- חזר ליחיד
        method: 'POST',
      }),
    }),

    // המוטציה החדשה - נשארת כאן אבל עם Request ביחיד
    rejectToReception: builder.mutation<void, { requestId: number }>({
      query: ({ requestId }) => ({
        url: `Request/${requestId}/reassign-to-reception`, // <--- חזר ליחיד
        method: 'PUT',
      }),
    }),

    getMyTasks: builder.query<any[], void>({
      query: () => `Request/my-tasks`, // <--- חזר ליחיד
    }),

    getAvailableRequests: builder.query<any[], void>({
      query: () => `Request/available`, // <--- חזר ליחיד
    }),
  }),
});

export const {
  useTakeRequestMutation,
  useCompleteRequestMutation,
  useAddRequestMutation,
  useRejectToReceptionMutation,
  useLazyGetMyTasksQuery,
  useLazyGetAvailableRequestsQuery,
} = requestApi;