import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// הגדרת המבנה של החדר כפי שהוא חוזר מה-DTO בשרת
export interface Room {
  id: number;
  roomNumber: string;
  isTabletActive: boolean;
}

export const roomApi = createApi({
  reducerPath: "roomApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: "https://localhost:7237/api/",
    prepareHeaders: (headers) => {
      // כאן הקסם קורה: אנחנו מושכים את הטוקן מה-localStorage
      const token = localStorage.getItem("token");
      
      if (token) {
        // מוסיפים את הטוקן להדר של כל בקשה שיוצאת מהסלייס הזה
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Room"], 
  
  endpoints: (builder) => ({
    // קבלת כל החדרים
    getAllRooms: builder.query<Room[], void>({
      query: () => "Room",
      providesTags: ["Room"],
    }),
    
    // הוספת חדר חדש (כאן הקריאה ל-POST שרצית)
    addRoom: builder.mutation<Room, { roomNumber: string }>({
      query: (newRoom) => ({
        url: "Room", // וודאי שזה הנתיב הנכון
        method: "POST",
        body: newRoom, // כאן עובר האובייקט { roomNumber: "..." }
      }),
      invalidatesTags: ["Room"],
    }),

    // פעולת ה-Setup לטאבלט (זו שכבר הייתה לך)
    setupRoom: builder.mutation<any, any>({
      query: (setupData) => ({
        url: "Room/setup",
        method: "POST",
        body: setupData,
      }),
    }),
    
    // מחיקת חדר
    deleteRoom: builder.mutation<void, number>({
      query: (id) => ({
        url: `Room/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Room"],
    }),
  }),
});

// ייצוא ה-Hooks לשימוש בקומפוננטות
export const {
  useGetAllRoomsQuery,
  useAddRoomMutation,
  useSetupRoomMutation,
  useDeleteRoomMutation,
} = roomApi;