import React, { useState, useEffect } from 'react';
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
  initialWord?: string;
  isRegenerating?: boolean;
}

const AddWordModal: React.FC<AddWordModalProps> = ({ 
  open, 
  onClose, 
  onSuccess, 
  initialWord = '',
  isRegenerating = false
}) => {
  const [word, setWord] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setWord(initialWord);
      setDescription('');
      setError(null);
    }
  }, [open, initialWord]);

  const handleAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); 
    
    if (!word.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await pictureDictionaryAPI.addWord(word.trim(), description.trim() || undefined, isRegenerating);
      onSuccess(isRegenerating 
        ? `Successfully regenerated image for "${word}".` 
        : `Successfully added "${word}" to the dictionary.`);
      handleClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to process request.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setWord('');
    setDescription('');
    setError(null);
    onClose();
  }

  return (
    <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        onClick={(e) => e.stopPropagation()}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {isRegenerating ? 'Regenerate Image' : 'Add New Word'}
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="textSecondary">
            {isRegenerating 
              ? `Regenerate the illustration for "${initialWord}". You can optionally add a description to guide the new image style.`
              : "Enter a word to generate an illustration and add it to the global picture dictionary."}
          </Typography>

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <TextField
            autoFocus={!isRegenerating}
            label="Word"
            type="text"
            fullWidth
            variant="outlined"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            disabled={loading || isRegenerating}
            onClick={(e) => e.stopPropagation()}
          />

          <TextField
            autoFocus={isRegenerating}
            label="Optional Description (e.g., 'A red apple on a wooden table')"
            type="text"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            placeholder="Add details to refine the image..."
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAdd();
              }
            }}
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
          {loading ? 'Processing...' : (isRegenerating ? 'Regenerate' : 'Add Word')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default AddWordModal;
