import React, { useState } from 'react';
import CategoryList from './CategoryList';
import AddCategoryModal from './AddCategoryForm';

const CategoryManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>ניהול מחלקות מלון</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          ➕ הוספת מחלקה חדשה
        </button>
      </div>

      <hr />

      {/* הטבלה שמציגה את הנתונים */}
      <CategoryList />

      {/* המודל שקופץ להוספה */}
      <AddCategoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default CategoryManagement;