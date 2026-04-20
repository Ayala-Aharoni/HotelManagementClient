import React from 'react';
import  {  type Category , useDeleteCategoryMutation } from '../CategoryAPI';

interface CategoryItemProps {
  category: Category;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category }) => {
  // שליפת פונקציית המחיקה מה-API
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const handleDelete = async () => {
    // תמיד כדאי לשאול את המשתמש לפני מחיקה
    if (window.confirm(`האם את בטוחה שברצונך למחוק את קטגוריית "${category.categoryName}"?`)) {
      try {
        // שליחת הבקשה לשרת
        await deleteCategory(category.categoryId).unwrap();        console.log("המחיקה הצליחה");
      } catch (err) {
        console.error("שגיאה במחיקה:", err);
        alert("לא ניתן למחוק קטגוריה זו. ייתכן והיא קשורה לנתונים אחרים במערכת.");
      }
    }
  };
  

  return (
    <tr style={{ borderBottom: '1px solid #ddd' }}>
    <td style={{ padding: '12px' }}>{category.categoryId}</td>   {/* שינינו ל-categoryId */}
    <td style={{ padding: '12px' }}>{category.categoryName}</td> {/* שינינו ל-categoryName */}
    <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
        {/* כפתור עריכה (כרגע רק לוג) */}
        <button 
          onClick={() => console.log("עריכה של קטגוריה:", category.categoryId)}
          style={{ cursor: 'pointer', padding: '5px 10px' }}
        >
          עריכה ✏️
        </button>

        {/* כפתור מחיקה */}
        <button 
          onClick={handleDelete}
          disabled={isDeleting} // מונע לחיצות כפולות בזמן המחיקה
          style={{ 
            backgroundColor: isDeleting ? '#ccc' : '#ff4d4d', 
            color: 'white', 
            border: 'none', 
            padding: '5px 10px', 
            cursor: isDeleting ? 'not-allowed' : 'pointer',
            borderRadius: '4px'
          }}
        >
          {isDeleting ? "מוחק..." : "מחיקה 🗑️"}
        </button>

      </td>
    </tr>
  );
};

export default CategoryItem;