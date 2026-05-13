import { useState } from 'react';
import { Box, Typography, Button, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';

export function ReceptionRequestCard({ task, onAssign }: any) {
  const [selectedCat, setSelectedCat] = useState('');

  const room = task.roomNumber || task.RoomNumber || "---";
  const desc = task.description || task.Description || "No description";

  return (
    <div className="hotel-card-v3 available" style={{ borderLeft: '4px solid #ff9800' }}>
      <div className="card-top-row">
        <div className="room-plate">
          <span className="plate-label">ROOM</span>
          <span className="plate-number">{room}</span>
        </div>
        <div className="status-time-group">
          <span className="task-label" style={{ color: '#ff9800' }}>MANUAL ACTION</span>
        </div>
      </div>

      <div className="request-content-box">
        <div className="content-scroll-area">
          <RecordVoiceOverIcon sx={{ fontSize: 18, mr: 1, color: '#d4af37' }} />
          {desc}
        </div>
      </div>

      <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
        <FormControl fullWidth size="small">
          <InputLabel>Redirect To...</InputLabel>
          <Select
            value={selectedCat}
            label="Redirect To..."
            onChange={(e) => setSelectedCat(e.target.value)}
          >
            <MenuItem value={1}>Housekeeping</MenuItem>
            <MenuItem value={2}>Maintenance</MenuItem>
            <MenuItem value={3}>Dining Room</MenuItem>
          </Select>
        </FormControl>
        
        <Button 
          variant="contained" 
          disabled={!selectedCat}
          onClick={() => onAssign(task.requestId || task.id, selectedCat)}
          sx={{ bgcolor: '#1A73E8', fontWeight: 700, px: 3 }}
        >
          Send
        </Button>
      </Box>
    </div>
  );
}