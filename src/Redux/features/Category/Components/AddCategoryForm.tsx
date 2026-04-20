import React, { useState } from 'react';
import { useAddCategoryMutation } from '../CategoryAPI';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ isOpen, onClose }) => {
  const [categoryName, setCategoryName] = useState('');
  const [addCategory, { isLoading }] = useAddCategoryMutation();

  if (!isOpen) return null; // אם המודל סגור, אל תרנדר כלום

  const handleSave = async () => {
    if (!categoryName.trim()) return;
    try {
      await addCategory({ categoryName }).unwrap();
      setCategoryName('');
      onClose(); // סגירת המודל לאחר הצלחה
    } catch (err) {
      alert("שגיאה בהוספת המחלקה");
    }
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h3>הוספת מחלקה חדשה</h3>
        <input 
          type="text" 
          placeholder="שם המחלקה (למשל: קבלה, ספא...)" 
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          style={inputStyle}
          autoFocus
        />
        <div style={buttonGroupStyle}>
          <button onClick={handleSave} disabled={isLoading} style={saveButtonStyle}>
            {isLoading ? 'שומר...' : 'שמור'}
          </button>
          <button onClick={onClose} style={cancelButtonStyle}>ביטול</button>
        </div>
      </div>
    </div>
  );
};

// עיצובים קטנים (אפשר להעביר ל-CSS)
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '350px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box'
};

const buttonGroupStyle: React.CSSProperties = { display: 'flex', gap: '10px', justifyContent: 'center' };
const saveButtonStyle: React.CSSProperties = { padding: '10px 25px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const cancelButtonStyle: React.CSSProperties = { padding: '10px 25px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' };

export default AddCategoryModal;