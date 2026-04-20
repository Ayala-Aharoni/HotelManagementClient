import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../store";

// 1. הנה ה-Category שחיפשנו!
export interface Category {
    categoryId: number;    
    categoryName: string;  
  }
export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: "https://localhost:7237/api/",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
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
    addCategory: builder.mutation<Category, Category>({
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
          const patchResult = dispatch(
            categoryApi.util.updateQueryData('getAllCategories', undefined, (draft) => {
              // תיקון כאן: cat.categoryId במקום cat.id
              return draft.filter((cat) => cat.categoryId !== id);
            })
          );
          try {
            await queryFulfilled;
          } catch {
            patchResult.undo();
          }
        },
      }),
    }),
});

// ייצוא ה-Hooks לשימוש בקומפוננטות
export const {
  useGetAllCategoriesQuery,
  useAddCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;