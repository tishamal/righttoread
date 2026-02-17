import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Alert,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { pictureDictionaryAPI } from '../services/api';

interface AddWordModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const AddWordModal: React.FC<AddWordModalProps> = ({ open, onClose, onSuccess }) => {
  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // Prevent default form submission or event propagation
    
    if (!word.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await pictureDictionaryAPI.addWord(word.trim());
      onSuccess(`Successfully added "${word}" to the dictionary.`);
      setWord('');
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to add word to dictionary.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setError(null);
    onClose();
  }

  return (
    <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        // Ensure clicks inside the dialog don't propagate to elements underneath
        onClick={(e) => e.stopPropagation()}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Add New Word
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Enter a word to generate an illustration and add it to the global picture dictionary.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            autoFocus
            margin="dense"
            id="word-input" // Changed ID to avoid potential conflicts
            label="Word"
            type="text"
            fullWidth
            variant="outlined"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => { // Changed from onKeyPress (deprecated)
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
            // Prevent event propagation on click
            onClick={(e) => e.stopPropagation()}
          />
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={() => handleAdd()} 
          variant="contained" 
          color="primary"
          disabled={!word.trim() || loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Generating...' : 'Add Word'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddWordModal;
