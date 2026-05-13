import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Employee {
  employeeId?: number;
  fullname?: string;
  email: string;
  role?: string;
  categoryId?: number;
  isAviable: boolean; // שימי לב שזה תואם ל-DTO שלך (ISAviavle)
}

export const employeeApi = createApi({
  reducerPath: "employeeApi",
  // כאן הוספנו את ה-prepareHeaders - זה הלב של העניין
  baseQuery: fetchBaseQuery({
    baseUrl: "https://localhost:7237/api/",
    prepareHeaders: (headers) => {
      // שליפת הטוקן מה-LocalStorage
      const token = localStorage.getItem("token");

      // אם יש טוקן, נצרף אותו לכל בקשה שיוצאת
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ["Employee"],

  endpoints: (builder) => ({
    // קבלת כל העובדים
    getAllEmployees: builder.query<Employee[], void>({
      query: () => "Employee",
      providesTags: ["Employee"],
    }),

    // קבלת עובד לפי ID
    getEmployeeById: builder.query<Employee, number>({
      query: (id) => `Employee/${id}`,
      providesTags: (result, error, id) => [{ type: "Employee", id }],
    }),

    // רישום עובד חדש
    addEmployee: builder.mutation<void, any>({
      query: (newEmp) => ({
        url: "Employee/Register",
        method: "POST",
        body: newEmp,
      }),
      invalidatesTags: ["Employee"],
    }),

    // התחברות עובד
    loginEmployee: builder.mutation<any, any>({
      query: (credentials) => ({
        url: "Employee/Login",
        method: "POST",
        body: credentials,
      }),
    }),

    // עדכון פרטי עובד
    updateEmployee: builder.mutation<void, { id: number; data: Employee }>({
      query: ({ id, data }) => ({
        url: `Employee/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Employee", id }, "Employee"],
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          employeeApi.util.updateQueryData('getAllEmployees', undefined, (draft) => {
            const employee = draft.find((e) => e.employeeId === id);
            if (employee) {
              Object.assign(employee, data);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // מחיקת עובד
    deleteEmployee: builder.mutation<void, number>({
      query: (id) => ({
        url: `Employee/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Employee"],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          employeeApi.util.updateQueryData('getAllEmployees', undefined, (draft) => {
            // תיקון: שימוש ב-employeeId במקום Id כדי להתאים לאינטרפייס
            return draft.filter((emp) => emp.employeeId !== id);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // עדכון סטטוס זמינות
    updateEmployeeStatus: builder.mutation<void, { id: number; isAvailable: boolean }>({
      query: ({ id, isAvailable }) => ({
        url: `Employee/${id}/status`,
        method: "PATCH",
        // שליחה בדיוק לפי ה-DTO ב-C#
        body: { ISAviavle: isAvailable },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Employee", id }, "Employee"],
    }),
  }),
});

export const {
  useGetAllEmployeesQuery,
  useGetEmployeeByIdQuery,
  useAddEmployeeMutation,
  useLoginEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useUpdateEmployeeStatusMutation
} = employeeApi;