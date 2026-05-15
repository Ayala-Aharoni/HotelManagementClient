import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// רכיבי MUI
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';

import { 
    useGetAllRoomsQuery,
    useAddRoomMutation,
    useDeleteRoomMutation,
} from '../roomApi'; 

import roomsHeaderImg from "../../../../assets/doors-pict.jpg"; 

export default function ManageRooms() {
  const navigate = useNavigate();
  const [newRoomNumber, setNewRoomNumber] = useState('');

  // שליפת נתונים
  const { data: rooms, isLoading: loadingRooms, refetch } = useGetAllRoomsQuery();
  const [addRoom, { isLoading: isAdding }] = useAddRoomMutation();
  const [deleteRoom] = useDeleteRoomMutation();

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber.trim()) return;

    try {
        await addRoom({ roomNumber: newRoomNumber }).unwrap();
        toast.success(`חדר ${newRoomNumber} נוסף בהצלחה`);
        setNewRoomNumber('');
    } catch (err: any) {
        const errorMessage = err.data?.Message || err.data?.message || "שגיאה בהוספת החדר";
        toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("למחוק את החדר?")) return;
    try {
      await deleteRoom(id).unwrap();
      toast.success("החדר נמחק");
    } catch (err) {
      toast.error("שגיאה במחיקת החדר");
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', bgcolor: 'white' }}>
      
      {/* Header קומפקטי יותר */}
      <Box sx={{ position: 'relative', height: '25vh', width: '100%', flexShrink: 0 }}>
        <IconButton 
          onClick={() => navigate(-1)}
          sx={{ 
            position: 'absolute', top: 15, left: 15, zIndex: 10,
            bgcolor: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)'
          }}
        >
          <span style={{ color: 'white', fontSize: '18px' }}>⟨</span>
        </IconButton>
        
        <Box 
          component="img" 
          src={roomsHeaderImg} 
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        
        <Box sx={{ 
          position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.7))',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          p: 2, color: 'white'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Manage Rooms</Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>System Dashboard</Typography>
        </Box>
      </Box>

      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* טופס הוספה צר יותר */}
        <Box sx={{ maxWidth: '400px' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Quick Add</Typography>
          <form onSubmit={handleAddRoom} style={{ display: 'flex', gap: '8px' }}>
            <TextField
              fullWidth
              label="Room #"
              variant="outlined"
              size="small"
              value={newRoomNumber}
              onChange={(e) => setNewRoomNumber(e.target.value)}
            />
            <Button 
              type="submit" 
              variant="contained" 
              disabled={isAdding}
              sx={{ borderRadius: '8px', bgcolor: '#1c1c1e', fontWeight: 700 }}
            >
              {isAdding ? <CircularProgress size={18} /> : "ADD"}
            </Button>
          </form>
        </Box>

        <Divider />

        {/* לוח החדרים - ריבועים קטנים */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Live Status</Typography>
            <IconButton onClick={() => refetch()} size="small">🔄</IconButton>
          </Box>

          {loadingRooms ? (
            <Box sx={{ textAlign: 'center', py: 5 }}><CircularProgress /></Box>
          ) : (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
              gap: 1.5 
            }}>
              {rooms?.map((room: any) => (
                <Paper 
                  key={room.id} 
                  elevation={0} 
                  sx={{ 
                    p: 1.5, 
                    borderRadius: '16px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    position: 'relative',
                    border: '1px solid #eee',
                    bgcolor: room.isTabletActive ? '#fff' : '#fcfcfc',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                  }}
                >
                  {/* נורית סטטוס בולטת במיוחד */}
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8, 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    bgcolor: room.isTabletActive ? '#00e676' : '#ff1744',
                    boxShadow: room.isTabletActive 
                      ? '0 0 10px 2px rgba(0, 230, 118, 0.4)' 
                      : '0 0 8px 1px rgba(255, 23, 68, 0.2)',
                  }} />

                  <Box sx={{ 
                    mb: 1, fontSize: '1.2rem',
                    filter: room.isTabletActive ? 'none' : 'grayscale(100%)',
                    opacity: room.isTabletActive ? 1 : 0.4
                  }}>
                    🚪
                  </Box>

                  <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.85rem' }}>
                    {room.roomNumber}
                  </Typography>

                  <Typography variant="caption" sx={{ 
                    fontSize: '0.6rem', 
                    color: room.isTabletActive ? '#2e7d32' : '#d32f2f',
                    fontWeight: 900,
                    letterSpacing: 0.5,
                    mb: 1
                  }}>
                    {room.isTabletActive ? 'ONLINE' : 'OFFLINE'}
                  </Typography>

                  <IconButton 
                    onClick={() => handleDelete(room.id)} 
                    size="small"
                    sx={{ 
                      p: 0.3,
                      color: '#bbb',
                      '&:hover': { color: '#d32f2f', bgcolor: '#ffebee' }
                    }}
                  >
                    🗑️
                  </IconButton>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}