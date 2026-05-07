import React from 'react';
import { 
  TableRow, TableCell, IconButton, Tooltip, CircularProgress, Box, Typography 
} from '@mui/material';
import { EditTwoTone, DeleteSweepTwoTone } from '@mui/icons-material';
import { type Category, useDeleteCategoryMutation } from '../CategoryAPI';

interface CategoryItemProps {
  category: Category;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category }) => {
  // לוגיקה נשארת זהה לחלוטין
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const handleDelete = async () => {
    if (window.confirm(`האם את בטוחה שברצונך למחוק את קטגוריית "${category.categoryName}"?`)) {
      try {
        await deleteCategory(category.categoryId).unwrap();
        console.log("המחיקה הצליחה");
      } catch (err) {
        console.error("שגיאה במחיקה:", err);
        alert("לא ניתן למחוק קטגוריה זו. ייתכן והיא קשורה לנתונים אחרים במערכת.");
      }
    }
  };

  return (
    <TableRow 
      sx={{ 
        '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }, 
        transition: 'background-color 0.2s' 
      }}
    >
      {/* ID - עם עיצוב קצת יותר מעודן */}
      <TableCell align="right" sx={{ py: 2 }}>
        <Typography variant="body2" fontWeight="600" color="text.secondary">
          #{category.categoryId}
        </Typography>
      </TableCell>

      {/* שם המחלקה - בולט וברור */}
      <TableCell align="right">
        <Typography variant="body1" fontWeight="700" sx={{ color: '#1A2238' }}>
          {category.categoryName}
        </Typography>
      </TableCell>

      {/* פעולות - כפתורים מעוצבים */}
      <TableCell align="center">
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          
          <Tooltip title="ערוך מחלקה">
            <IconButton 
              size="small"
              onClick={() => console.log("עריכה של קטגוריה:", category.categoryId)}
              sx={{ color: '#1c1c1e', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}
            >
              <EditTwoTone fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="מחק מחלקה">
            <IconButton 
              size="small"
              onClick={handleDelete}
              disabled={isDeleting}
              sx={{ 
                color: isDeleting ? '#ccc' : '#d32f2f',
                '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.1)' }
              }}
            >
              {isDeleting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <DeleteSweepTwoTone fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

        </Box>
      </TableCell>
    </TableRow>
  );
};

export default CategoryItem;