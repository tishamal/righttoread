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
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { ttsAPI, audioLibraryAPI } from '../services/api';

interface Book {
  id: number;
  book_name: string;
  grade: number;
  processing_status: string;
}

interface GenerateAudioLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onShowNotification: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}

const GenerateAudioLibraryModal: React.FC<GenerateAudioLibraryModalProps> = ({
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
      await ttsAPI.generateAudioLibrary(selectedBookId);
      // Bust the cache so the list shows fresh data after generation completes
      audioLibraryAPI.invalidateCache();
      onShowNotification('Audio library generation started in the background.', 'success');
      onClose();
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Unknown error';
      onShowNotification(`Failed to start audio library generation: ${detail}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBook = books.find((b) => b.id === selectedBookId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <VolumeUpIcon color="primary" />
        Generate Audio Library
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          Select a completed book to generate spelling &amp; pronunciation audio for each word in
          its dictionary. Each audio spells the word letter-by-letter, pauses, then pronounces it.
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Audios are saved to the shared audio library (<em>common/audios/</em>) and words that
          already have audio are skipped automatically.
        </Typography>
        <Typography variant="caption" color="warning.main" sx={{ display: 'block', mb: 2 }}>
          Note: The selected book must have a dictionary generated before audio can be created.
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
            <InputLabel id="audio-book-select-label">Select Book</InputLabel>
            <Select
              labelId="audio-book-select-label"
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
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <VolumeUpIcon />}
        >
          {submitting ? 'Starting…' : 'Generate Audio'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GenerateAudioLibraryModal;
