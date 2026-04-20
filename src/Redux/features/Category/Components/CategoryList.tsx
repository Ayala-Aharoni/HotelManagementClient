import React from 'react';
import { useGetAllCategoriesQuery } from "../CategoryAPI";
import CategoryItem from './CategoryItem';
import type { Category } from '../CategoryAPI';

const CategoryList: React.FC = () => {
    // השורה היחידה של לוגיקה כאן - הבאת הרשימה מהשרת
    const { data: categories, isLoading, isError } = useGetAllCategoriesQuery();

    if (isLoading) return <div>טוען קטגוריות...</div>;
    if (isError) return <div>שגיאה בטעינת נתונים</div>;

    return (
        <div style={{ padding: '20px', direction: 'rtl' }}>
            <h2>ניהול קטגוריות</h2>
            
            {/* קומפוננטה נפרדת להוספה */}
         
            <table style={{ width: '100%', marginTop: '20px', border: '1px solid black' }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>שם קטגוריה</th>
                        <th>פעולות</th>
                    </tr>
                </thead>
                <tbody>
                    {categories?.map((cat:Category) => (
                        /* כל שורה היא עולם ומלואו בתוך CategoryItem */
                        <CategoryItem key={cat.id} category={cat} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CategoryList;