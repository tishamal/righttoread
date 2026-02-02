import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Alert,
} from '@mui/material';
import { Close as CloseIcon, AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';
import { imagesAPI, PendingBook } from '../services/api';

interface GenerateImagesModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const GenerateImagesModal: React.FC<GenerateImagesModalProps> = ({ open, onClose, onSuccess }) => {
  const [books, setBooks] = useState<PendingBook[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | number>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (open) {
      loadPendingBooks();
      setSelectedBookId('');
      setError(null);
    }
  }, [open]);

  const loadPendingBooks = async () => {
    setLoading(true);
    try {
      const data = await imagesAPI.getPendingBooks();
      setBooks(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load eligible books.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedBookId) return;
    
    setGenerating(true);
    setError(null);
    try {
      await imagesAPI.generateImages(selectedBookId);
      onSuccess('Image generation started in background.');
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to start image generation service.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Generate Picture Dictionary
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Select a book to generate illustrations for its identified words.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
             <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="book-select-label">Select Book</InputLabel>
              <Select
                labelId="book-select-label"
                value={selectedBookId}
                label="Select Book"
                onChange={(e) => setSelectedBookId(e.target.value)}
              >
                {books.length === 0 ? (
                  <MenuItem disabled value="">
                    No books pending image generation
                  </MenuItem>
                ) : (
                  books.map((book) => (
                    <MenuItem 
                        key={book.id} 
                        value={book.id}
                        disabled={book.status === 'processing'}
                    >
                      {book.title} (Grade {book.grade}) 
                      {book.status === 'processing' ? ' - Processing...' : ''}
                      {book.status === 'failed' ? ' - Failed (Retry)' : ''}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={generating}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleGenerate} 
          disabled={!selectedBookId || generating || loading}
          startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
        >
          {generating ? 'Starting...' : 'Generate Images'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GenerateImagesModal;
