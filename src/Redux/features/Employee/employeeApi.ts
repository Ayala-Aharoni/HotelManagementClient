import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Employee {
  Id?: number;
  Fullname?: string;
  Email: string;
  PassWord?: string;
  Role?: string;
  CategoryId?: number;
}

export const employeeApi = createApi({
  reducerPath: "employeeApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://localhost:7237/api/" }),
  // הגדרת "תגיות" - זה עוזר ל-Redux לדעת מתי הנתונים לא רלוונטיים יותר
  tagTypes: ["Employee"], 
  
  endpoints: (builder) => ({
    
    // קבלת כל העובדים
    getAllEmployees: builder.query<Employee[], void>({
      query: () => "Employee",
      // מסמנים שקריאה זו מספקת נתונים מסוג Employee
      providesTags: ["Employee"],
    }),
    
    
    getEmployeeById: builder.query<Employee, number>({
      query: (id) => `Employee/${id}`,
      providesTags: (result, error, id) => [{ type: "Employee", id }],
    }),
    
    addEmployee: builder.mutation<void, any>({
      query: (newEmp) => ({
        url: "Employee/Register",
        method: "POST",
        body: newEmp,
      }),
      // ברגע שנוסף עובד, ה-Tag "מתבטל" וזה גורם ל-getAllEmployees לרוץ מחדש אוטומטית
      invalidatesTags: ["Employee"],
    }),
    
    loginEmployee: builder.mutation<any, any>({ 
      query: (credentials) => ({
        url: "Employee/Login",
        method: "POST",
        body: credentials,
      }),
    }),
    
    // --- עדכון עובד עם עדכון אופטימי ---
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
            const employee = draft.find((e) => e.Id === id);
            if (employee) {
              Object.assign(employee, data); // מעדכן את התצוגה מיד
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo(); // מבטל אם נכשל בשרת
        }
      },
    }),
    
    // --- מחיקת עובד עם עדכון אופטימי ---
    deleteEmployee: builder.mutation<void, number>({
      query: (id) => ({
        url: `Employee/${id}`,
        method: "DELETE",
      }),
      // אומר ל-Redux שהרשימה הכללית כבר לא תקפה
      invalidatesTags: ["Employee"],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        // עדכון אופטימי: מוחקים מהקאש מיד
        const patchResult = dispatch(
          employeeApi.util.updateQueryData('getAllEmployees', undefined, (draft) => {
            return draft.filter((emp) => emp.Id !== id);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo(); // מחזיר את העובד למסך אם המחיקה בשרת נכשלה
        }
      },
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
} = employeeApi;