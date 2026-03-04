import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material';

// Reuse voice list or move to a shared constant file
const AVAILABLE_VOICES = [
  { value: 'Joanna', label: 'Joanna (Female, US)' },
  { value: 'Matthew', label: 'Matthew (Male, US)' },
  { value: 'Ivy', label: 'Ivy (Female, Child, US)' },
  { value: 'Kendra', label: 'Kendra (Female, US)' },
  { value: 'Joey', label: 'Joey (Male, US)' },
  { value: 'Ruth', label: 'Ruth (Female, US)' },
  { value: 'Stephen', label: 'Stephen (Male, US)' },
  { value: 'Amy', label: 'Amy (Female, UK)' },
  { value: 'Emma', label: 'Emma (Female, UK)' },
  { value: 'Brian', label: 'Brian (Male, UK)' },
];

interface AddBlockDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (text: string, voiceId: string) => void;
  isProcessing: boolean;
}

const AddBlockDialog: React.FC<AddBlockDialogProps> = ({
  open,
  onClose,
  onSave,
  isProcessing
}) => {
  const [text, setText] = useState('');
  const [voiceId, setVoiceId] = useState('Ruth');

  const handleSave = () => {
    if (text.trim()) {
      onSave(text, voiceId);
    }
  };

  return (
    <Dialog open={open} onClose={isProcessing ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Block</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Block Text"
            multiline
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isProcessing}
            fullWidth
            autoFocus
          />
          
          <FormControl fullWidth disabled={isProcessing}>
            <InputLabel>Voice</InputLabel>
            <Select
              value={voiceId}
              label="Voice"
              onChange={(e) => setVoiceId(e.target.value)}
            >
              {AVAILABLE_VOICES.map((voice) => (
                <MenuItem key={voice.value} value={voice.value}>
                  {voice.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isProcessing}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={!text.trim() || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Add Block'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBlockDialog;
