import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const requestApi = createApi({
  reducerPath: "requestApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: "https://localhost:7237/api/",
    prepareHeaders: (headers) => {
      const roomToken = localStorage.getItem("roomToken");
      const userToken = localStorage.getItem("token");
      const finalToken = roomToken || userToken;
    
      if (finalToken) {
        headers.set("authorization", `Bearer ${finalToken}`);
      }
      return headers;
    },
  }),
  // הגדרת תגית "Request" כדי לנהל את רענון הנתונים האוטומטי
  tagTypes: ["Request"],

  endpoints: (builder) => ({

    // --- פונקציות ניהול ואדמין ---
    
    getAllRequests: builder.query({
      query: () => "Request",
      providesTags: ["Request"],
    }),

    getRequestById: builder.query({
      query: (id) => `Request/${id}`,
      providesTags: (result, error, id) => [{ type: "Request", id }],
    }),

    // פונקציית סיווג ידני על ידי הקבלה
    transferToCategory: builder.mutation({
      query: ({ requestId, correctCategoryId }) => ({
        url: `Request/transfer/${requestId}/${correctCategoryId}`,
        method: 'PUT',
      }),
      invalidatesTags: ["Request"], 
    }),

    // --- פונקציות חדר / עובד ---

    addRequest: builder.mutation({
      query: (newRequest) => ({
        url: 'Request',
        method: 'POST',
        body: newRequest,
      }),
      invalidatesTags: ["Request"],
    }),

    takeRequest: builder.mutation({
      query: ({ requestId }) => ({
        url: `Request/take/${requestId}`,
        method: 'POST',
      }),
      invalidatesTags: ["Request"],
    }),

    completeRequest: builder.mutation({
      query: ({ requestId }) => ({
        url: `Request/complete/${requestId}`,
        method: 'POST',
      }),
      invalidatesTags: ["Request"],
    }),

    rejectToReception: builder.mutation({
      query: ({ requestId }) => ({
        url: `Request/${requestId}/reassign-to-reception`,
        method: 'PUT',
      }),
      invalidatesTags: ["Request"],
    }),

    // --- שאילתות שליפת נתונים ---

    getMyTasks: builder.query({
      query: () => `Request/my-tasks`,
      providesTags: ["Request"],
    }),

    getAvailableRequests: builder.query({
      query: () => `Request/available`,
      providesTags: ["Request"],
    }),
  }),
});

// ייצוא ההוקים לשימוש בקומפוננטות
export const {
  useGetAllRequestsQuery,
  useGetRequestByIdQuery,
  useTransferToCategoryMutation, // ההוק החדש לסיווג ידני
  useTakeRequestMutation,
  useCompleteRequestMutation,
  useAddRequestMutation,
  useRejectToReceptionMutation,
  useGetMyTasksQuery,
  useGetAvailableRequestsQuery,
  useLazyGetMyTasksQuery,
  useLazyGetAvailableRequestsQuery,
} = requestApi;