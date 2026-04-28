import React, { useState } from 'react';
import { useGetAllCategoriesQuery } from "../CategoryAPI";
import CategoryItem from './CategoryItem';
import AddCategoryModal from './AddCategoryForm'; 
import type { Category } from '../CategoryAPI';

const CategoryList: React.FC = () => {
    // 1. לוגיקה של הבאת הנתונים מהשרת
    const { data: categories, isLoading, isError } = useGetAllCategoriesQuery();

    // 2. לוגיקה של פתיחת/סגירת המודל (במקור היה ב-Management)
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (isLoading) return <div style={{ textAlign: 'center', padding: '20px' }}>טוען קטגוריות...</div>;
    if (isError) return <div style={{ color: 'red', textAlign: 'center' }}>שגיאה בטעינת נתונים</div>;

    return (
        <div style={{ padding: '20px', direction: 'rtl', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Header: כותרת + כפתור הוספה (מאוחד!) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0 }}>ניהול מחלקות מלון</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    style={{ 
                        padding: '10px 20px', 
                        backgroundColor: '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px', 
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '16px'
                    }}
                >
                    ➕ הוספת מחלקה חדשה
                </button>
            </div>

            <hr style={{ border: '0.5px solid #eee' }} />

            {/* טבלת הנתונים */}
            <div style={{ marginTop: '20px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <th style={{ padding: '12px' }}>ID</th>
                            <th style={{ padding: '12px' }}>שם קטגוריה</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories?.map((cat: Category) => (
                            /* כל שורה היא CategoryItem שמכילה את ה-<td> */
                            <CategoryItem key={cat.id} category={cat} />
                        ))}
                    </tbody>
                </table>
                
                {/* הודעה אם אין קטגוריות */}
                {categories?.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        לא נמצאו קטגוריות במערכת
                    </div>
                )}
            </div>

            {/* המודל שקופץ להוספה - נמצא בתוך הרשימה ומופעל על ידי הסטייט המקומי */}
            <AddCategoryModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
};

export default CategoryList;