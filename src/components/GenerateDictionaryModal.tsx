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
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { ttsAPI } from '../services/api';

interface Book {
  id: number;
  book_name: string;
  grade: number;
  processing_status: string;
}

interface GenerateDictionaryModalProps {
  open: boolean;
  onClose: () => void;
  onShowNotification: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}

const GenerateDictionaryModal: React.FC<GenerateDictionaryModalProps> = ({
  open,
  onClose,
  onShowNotification,
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<number | ''>('');
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedBookId('');
      setFetchError(null);
      loadBooks();
    }
  }, [open]);

  const loadBooks = async () => {
    setLoadingBooks(true);
    setFetchError(null);
    try {
      const data = await ttsAPI.getBooksForReview({ status: 'completed' });
      setBooks(data);
    } catch (err) {
      setFetchError('Failed to load completed books. Please try again.');
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedBookId) return;
    setSubmitting(true);
    try {
      await ttsAPI.generateDictionary(selectedBookId);
      onShowNotification('Dictionary generation started in the background.', 'success');
      onClose();
    } catch (err) {
      onShowNotification('Failed to start dictionary generation. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBook = books.find((b) => b.id === selectedBookId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <MenuBookIcon color="primary" />
        Generate Dictionary
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Select a completed book to generate (or regenerate) its Sinhala and Tamil
          vocabulary dictionary. This runs in the background and will overwrite any
          existing dictionary for the selected book.
        </Typography>

        {fetchError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {fetchError}
          </Alert>
        )}

        {loadingBooks ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <FormControl fullWidth>
            <InputLabel id="book-select-label">Select Book</InputLabel>
            <Select
              labelId="book-select-label"
              value={selectedBookId}
              label="Select Book"
              onChange={(e) => setSelectedBookId(e.target.value as number)}
              disabled={books.length === 0}
            >
              {books.length === 0 ? (
                <MenuItem disabled value="">
                  No completed books available
                </MenuItem>
              ) : (
                books.map((book) => (
                  <MenuItem key={book.id} value={book.id}>
                    {book.book_name}
                    {book.grade ? ` — Grade ${book.grade}` : ''}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        )}

        {selectedBook && (
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Book ID: {selectedBook.id} · Grade: {selectedBook.grade ?? '—'}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={!selectedBookId || submitting || loadingBooks}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <MenuBookIcon />}
        >
          {submitting ? 'Starting…' : 'Generate Dictionary'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GenerateDictionaryModal;
