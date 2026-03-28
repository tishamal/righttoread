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
  TextField,
  IconButton,
  Stack,
  Divider,
} from '@mui/material';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { ttsAPI, tocAPI, TOCEntry } from '../services/api';

interface Book {
  id: number;
  book_name: string;
  grade: number;
  total_pages: number | null;
  processing_status: string;
}

interface AddTableOfContentsModalProps {
  open: boolean;
  onClose: () => void;
  onShowNotification: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}

const emptyEntry = (): TOCEntry => ({ chapter_title: '', page_number: 1, order_index: 0 });

const AddTableOfContentsModal: React.FC<AddTableOfContentsModalProps> = ({
  open,
  onClose,
  onShowNotification,
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<number | ''>('');
  const [entries, setEntries] = useState<TOCEntry[]>([emptyEntry()]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingTOC, setLoadingTOC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedBookId('');
      setEntries([emptyEntry()]);
      setFetchError(null);
      loadBooks();
    }
  }, [open]);

  // Load existing TOC when a book is selected
  useEffect(() => {
    if (!selectedBookId) {
      setEntries([emptyEntry()]);
      return;
    }
    const fetchTOC = async () => {
      setLoadingTOC(true);
      try {
        const existing = await tocAPI.getTableOfContents(selectedBookId);
        if (existing.length > 0) {
          setEntries(existing);
        } else {
          setEntries([emptyEntry()]);
        }
      } catch {
        setEntries([emptyEntry()]);
      } finally {
        setLoadingTOC(false);
      }
    };
    fetchTOC();
  }, [selectedBookId]);

  const loadBooks = async () => {
    setLoadingBooks(true);
    setFetchError(null);
    try {
      const data = await ttsAPI.getBooksForReview({ status: 'completed' });
      setBooks(data);
    } catch {
      setFetchError('Failed to load completed books. Please try again.');
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleEntryChange = (index: number, field: keyof TOCEntry, value: string | number) => {
    setEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry))
    );
  };

  const handleAddEntry = () => {
    setEntries((prev) => [
      ...prev,
      { chapter_title: '', page_number: 1, order_index: prev.length },
    ]);
  };

  const handleRemoveEntry = (index: number) => {
    setEntries((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((entry, i) => ({ ...entry, order_index: i }))
    );
  };

  const handleSave = async () => {
    if (!selectedBookId) return;

    const invalid = entries.filter((e) => !e.chapter_title.trim());
    if (invalid.length > 0) {
      onShowNotification('All chapter titles are required.', 'error');
      return;
    }

    const numbered = entries.map((e, i) => ({ ...e, order_index: i }));

    setSubmitting(true);
    try {
      await tocAPI.saveTableOfContents(selectedBookId, numbered);
      onShowNotification('Table of contents saved successfully.', 'success');
      onClose();
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Unknown error';
      onShowNotification(`Failed to save table of contents: ${detail}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBook = books.find((b) => b.id === selectedBookId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FormatListNumberedIcon color="primary" />
        Add Table of Contents
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Select a completed book and define its chapter list. Each chapter requires a title and
          the 1-based display page number where it starts. Saving replaces any existing table of
          contents for the selected book.
        </Typography>

        {fetchError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {fetchError}
          </Alert>
        )}

        {/* Book selector */}
        {loadingBooks ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="toc-book-select-label">Select Book</InputLabel>
            <Select
              labelId="toc-book-select-label"
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
          <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
            Book ID: {selectedBook.id} · Grade: {selectedBook.grade ?? '—'} ·
            Total pages: {selectedBook.total_pages ?? 'unknown'}
          </Typography>
        )}

        {/* Chapter entries */}
        {selectedBookId && (
          <>
            <Divider sx={{ my: 2 }} />

            {loadingTOC ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Chapters
                </Typography>

                <Stack spacing={1.5}>
                  {entries.map((entry, index) => (
                    <Stack key={index} direction="row" spacing={1} alignItems="center">
                      <TextField
                        label="Chapter Title"
                        value={entry.chapter_title}
                        onChange={(e) => handleEntryChange(index, 'chapter_title', e.target.value)}
                        size="small"
                        sx={{ flex: 1 }}
                        inputProps={{ maxLength: 500 }}
                      />
                      <TextField
                        label="Page"
                        type="number"
                        value={entry.page_number}
                        onChange={(e) =>
                          handleEntryChange(index, 'page_number', Math.max(1, parseInt(e.target.value, 10) || 1))
                        }
                        size="small"
                        sx={{ width: 90 }}
                        inputProps={{
                          min: 1,
                          max: selectedBook?.total_pages ?? undefined,
                        }}
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveEntry(index)}
                        disabled={entries.length === 1}
                        aria-label="Remove chapter"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>

                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddEntry}
                  sx={{ mt: 1.5 }}
                >
                  Add Chapter
                </Button>
              </>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!selectedBookId || submitting || loadingBooks || loadingTOC}
          startIcon={
            submitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <FormatListNumberedIcon />
            )
          }
        >
          {submitting ? 'Saving…' : 'Save Table of Contents'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTableOfContentsModal;
