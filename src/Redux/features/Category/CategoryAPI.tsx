import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Category {
  categoryId: number;    
  categoryName: string;  
}

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: "https://localhost:7237/api/",
    prepareHeaders: (headers) => {
      // שינוי כאן: עברנו לשימוש ב-localStorage כדי להיות עקביים עם שאר ה-APIs שלך
      const token = localStorage.getItem("token");
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Category"], 
  
  endpoints: (builder) => ({
    // קבלת כל הקטגוריות
    getAllCategories: builder.query<Category[], void>({
      query: () => "Category",
      providesTags: ["Category"],
    }),
    
    // הוספת קטגוריה
    addCategory: builder.mutation<Category, Partial<Category>>({
      query: (newCat) => ({
        url: "Category/AddCategory",
        method: "POST",
        body: newCat,
      }),
      invalidatesTags: ["Category"],
    }),
    
    // מחיקת קטגוריה
    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `Category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        // עדכון אופטימי - מוחק מהמסך מיד
        const patchResult = dispatch(
          categoryApi.util.updateQueryData('getAllCategories', undefined, (draft) => {
            return draft.filter((cat) => cat.categoryId !== id);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo(); // מחזיר אם נכשל בשרת
        }
      },
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useAddCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;