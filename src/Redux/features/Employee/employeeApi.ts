import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// 1. מעדכנים את ה-Interface שיתאים ל-DTO מהשרת
export interface Employee {
  Id?: number;
  Fullname?: string; // שינינו מ-firstName/lastName
  Email: string;
  PassWord?: string; // שימי לב ל-W הגדולה כמו ב-C#
  Role?: string;
  CategoryId?: number;
}

export const employeeApi = createApi({
  reducerPath: "employeeApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://localhost:7237/api/" }), // הוספת / בסוף לביטחון
  endpoints: (builder) => ({
    
    // קבלת כל העובדים
    getAllEmployees: builder.query<Employee[], void>({
      query: () => "Employee",
    }),
    
    // קבלת עובד לפי ID
    getEmployeeById: builder.query<Employee, number>({
      query: (id) => `Employee/${id}`,
    }),
    
    // הוספת עובד (הרשמה)
    addEmployee: builder.mutation<void, any>({ // השתמשתי ב-any כדי לאפשר גמישות בשליחה מהטופס
      query: (newEmp) => ({
        url: "Employee/Register",
        method: "POST",
        body: newEmp,
      }),
    }),
    
    // התחברות (Login)
    loginEmployee: builder.mutation<any, any>({ 
      query: (credentials) => ({
        url: "Employee/Login",
        method: "POST",
        body: credentials,
      }),
    }),
    
    // עדכון עובד
    updateEmployee: builder.mutation<void, { id: number; data: Employee }>({
      query: ({ id, data }) => ({
        url: `Employee/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    
    // מחיקת עובד
    deleteEmployee: builder.mutation<void, number>({
      query: (id) => ({
        url: `Employee/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetAllEmployeesQuery,
  useGetEmployeeByIdQuery,
  useAddEmployeeMutation,
  useLoginEmployeeMutation, // זה ה-Hook שתשתמשי בו בעמוד ה-Login
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeeApi;