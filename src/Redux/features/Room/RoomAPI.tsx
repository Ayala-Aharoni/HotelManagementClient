import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// הגדרת הממשק עבור הבקשה (ה-DTO שלנו ב-C#)
export interface RoomSetupRequest {
  roomNumber: string;
}

// התגובה שאנחנו מקבלים מהשרת
export interface RoomSetupResponse {
  token: string;
}

export const roomApi = createApi({
  reducerPath: "roomApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://localhost:7237/api/" }),
  endpoints: (builder) => ({
    
    // מוטציה לחיבור החדר (Setup)
    setupRoom: builder.mutation<RoomSetupResponse, RoomSetupRequest>({
      query: (roomData) => ({
        url: "Room/setup", // מוודאת שזה ה-Route ב-Controller
        method: "POST",
        body: roomData,
      }),
      // כאן אנחנו יכולים לשמור את הטוקן ב-LocalStorage ברגע שהקריאה מצליחה
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          localStorage.setItem("roomToken", data.token);
          localStorage.setItem("roomNumber", arg.roomNumber);
        } catch (err) {
          console.error("Setup failed:", err);
        }
      },
    }),
  }),
});

export const { useSetupRoomMutation } = roomApi;