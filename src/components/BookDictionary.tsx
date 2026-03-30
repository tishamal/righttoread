import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Tooltip,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  MenuBook as MenuBookIcon,
  Clear as ClearIcon,
  AddCircleOutline as AddIcon,
} from '@mui/icons-material';
import { bookDictionaryAPI, ttsAPI, DictionaryWord, DictionaryWordUpdate, DictionaryWordCreate } from '../services/api';

interface BookDictionaryProps {
  onShowNotification: (message: string, severity: 'success' | 'error' | 'info') => void;
}

interface EditState {
  sinhala_translation: string;
  tamil_translation: string;
  simple_definition: string;
}

const BookDictionary: React.FC<BookDictionaryProps> = ({ onShowNotification }) => {
  // Book selection
  const [books, setBooks] = useState<{ slug: string; label: string }[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [booksLoading, setBooksLoading] = useState(false);

  // Dictionary data
  const [words, setWords] = useState<DictionaryWord[]>([]);
  const [dictLoading, setDictLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Inline edit state: keyed by word string
  const [editingWord, setEditingWord] = useState<string | null>(null);

  // Word filter
  const [wordFilter, setWordFilter] = useState<string>('');
  const [editValues, setEditValues] = useState<EditState>({ sinhala_translation: '', tamil_translation: '', simple_definition: '' });
  const [saving, setSaving] = useState(false);

  // Add word dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState<DictionaryWordCreate>({ word: '', type: '', sinhala_translation: '', tamil_translation: '', simple_definition: '' });
  const [adding, setAdding] = useState(false);

  // Load completed books on mount (same source as Audio Library feature)
  useEffect(() => {
    setBooksLoading(true);
    ttsAPI
      .getBooksForReview({ status: 'completed' })
      .then((data) =>
        setBooks(
          data.map((b: any) => ({
            slug: b.book_name,
            label: b.book_name.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
          }))
        )
      )
      .catch(() => onShowNotification('Failed to load available books.', 'error'))
      .finally(() => setBooksLoading(false));
  }, []);

  const handleSearch = async () => {
    if (!selectedSlug) {
      onShowNotification('Please select a book first.', 'info');
      return;
    }
    setDictLoading(true);
    setSearched(true);
    setPage(0);
    setEditingWord(null);
    setWordFilter('');
    try {
      const data = await bookDictionaryAPI.getByBook(selectedSlug);
      setWords(data);
    } catch {
      onShowNotification('Failed to load dictionary for this book.', 'error');
      setWords([]);
    } finally {
      setDictLoading(false);
    }
  };

  const handleEditClick = (w: DictionaryWord) => {
    setEditingWord(w.word);
    setEditValues({
      sinhala_translation: w.sinhala_translation ?? '',
      tamil_translation: w.tamil_translation ?? '',
      simple_definition: w.simple_definition ?? '',
    });
  };

  const handleCancelEdit = () => {
    setEditingWord(null);
  };

  const handleSave = async (word: string) => {
    setSaving(true);
    const payload: DictionaryWordUpdate = {
      sinhala_translation: editValues.sinhala_translation,
      tamil_translation: editValues.tamil_translation,
      simple_definition: editValues.simple_definition,
    };
    try {
      const updated = await bookDictionaryAPI.updateWord(selectedSlug, word, payload);
      setWords((prev) => prev.map((w) => (w.word === word ? { ...w, ...updated } : w)));
      onShowNotification(`"${word}" updated successfully.`, 'success');
      setEditingWord(null);
    } catch {
      onShowNotification(`Failed to update "${word}".`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredWords = wordFilter.trim()
    ? words.filter((w) => w.word.toLowerCase().includes(wordFilter.trim().toLowerCase()))
    : words;

  const paginatedWords = filteredWords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const openAddDialog = () => {
    setAddForm({ word: '', type: '', sinhala_translation: '', tamil_translation: '', simple_definition: '' });
    setAddDialogOpen(true);
  };

  const handleAddWord = async () => {
    if (!addForm.word.trim()) {
      onShowNotification('Word is required.', 'info');
      return;
    }
    setAdding(true);
    try {
      const created = await bookDictionaryAPI.addWord(selectedSlug, {
        ...addForm,
        word: addForm.word.trim(),
      });
      setWords((prev) => [...prev, created]);
      onShowNotification(`"${created.word}" added to the dictionary.`, 'success');
      setAddDialogOpen(false);
    } catch (err: any) {
      const detail = err?.message || '';
      if (detail.includes('409') || detail.toLowerCase().includes('already exists')) {
        onShowNotification(`"${addForm.word}" already exists in the dictionary.`, 'error');
      } else {
        onShowNotification(`Failed to add word.`, 'error');
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <Box className="fade-in">
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Dictionary
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          {searched && words.length > 0 && (
            <Chip
              icon={<MenuBookIcon />}
              label={wordFilter.trim() ? `${filteredWords.length} / ${words.length} words` : `${words.length} words`}
              color="primary"
              variant="outlined"
            />
          )}
          {searched && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openAddDialog}
              disabled={!selectedSlug}
              sx={{ textTransform: 'none' }}
            >
              Add Word
            </Button>
          )}
        </Stack>
      </Box>

      {/* Book selector + Search */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <FormControl sx={{ minWidth: 280 }} size="small">
            <InputLabel id="book-select-label">Select Book</InputLabel>
            <Select
              labelId="book-select-label"
              value={selectedSlug}
              label="Select Book"
              onChange={(e) => {
                setSelectedSlug(e.target.value);
                setWords([]);
                setSearched(false);
                setEditingWord(null);
              }}
              disabled={booksLoading}
            >
              {booksLoading ? (
                <MenuItem disabled>Loading books…</MenuItem>
              ) : (
                books.map((b) => (
                  <MenuItem key={b.slug} value={b.slug}>
                    {b.label}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={dictLoading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
            onClick={handleSearch}
            disabled={dictLoading || !selectedSlug}
            sx={{ textTransform: 'none', px: 3 }}
          >
            {dictLoading ? 'Loading…' : 'Search'}
          </Button>

          {/* Word search — right side */}
          <Box sx={{ flexGrow: 1 }} />
          <TextField
            size="small"
            placeholder="Search word…"
            value={wordFilter}
            onChange={(e) => {
              setWordFilter(e.target.value);
              setPage(0);
            }}
            disabled={!searched || words.length === 0}
            sx={{ minWidth: 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: wordFilter ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => { setWordFilter(''); setPage(0); }}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Stack>
      </Paper>

      {/* Dictionary Table */}
      {searched && (
        <Paper sx={{ borderRadius: 3 }}>
          {dictLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : words.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No dictionary found for this book. Generate one first.
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                      {['Word', 'Sinhala Meaning', 'Tamil Meaning', 'Simple Definition', 'Actions'].map(
                        (col) => (
                          <TableCell
                            key={col}
                            sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                          >
                            {col}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedWords.map((w) => {
                      const isEditing = editingWord === w.word;
                      return (
                        <TableRow key={w.word} hover sx={{ '&:last-child td': { border: 0 } }}>
                          {/* Word (never editable) */}
                          <TableCell sx={{ fontWeight: 'medium', whiteSpace: 'nowrap' }}>
                            {w.word}
                            {w.type && (
                              <Typography
                                component="span"
                                variant="caption"
                                color="textSecondary"
                                sx={{ ml: 0.5 }}
                              >
                                ({w.type})
                              </Typography>
                            )}
                          </TableCell>

                          {/* Sinhala */}
                          <TableCell>
                            {isEditing ? (
                              <TextField
                                value={editValues.sinhala_translation}
                                onChange={(e) =>
                                  setEditValues((v) => ({ ...v, sinhala_translation: e.target.value }))
                                }
                                size="small"
                                variant="outlined"
                                sx={{ minWidth: 160 }}
                              />
                            ) : (
                              w.sinhala_translation ?? '—'
                            )}
                          </TableCell>

                          {/* Tamil */}
                          <TableCell>
                            {isEditing ? (
                              <TextField
                                value={editValues.tamil_translation}
                                onChange={(e) =>
                                  setEditValues((v) => ({ ...v, tamil_translation: e.target.value }))
                                }
                                size="small"
                                variant="outlined"
                                sx={{ minWidth: 160 }}
                              />
                            ) : (
                              w.tamil_translation ?? '—'
                            )}
                          </TableCell>

                          {/* Simple Definition */}
                          <TableCell sx={{ maxWidth: 320 }}>
                            {isEditing ? (
                              <TextField
                                value={editValues.simple_definition}
                                onChange={(e) =>
                                  setEditValues((v) => ({ ...v, simple_definition: e.target.value }))
                                }
                                size="small"
                                variant="outlined"
                                multiline
                                sx={{ minWidth: 240 }}
                              />
                            ) : (
                              w.simple_definition ?? '—'
                            )}
                          </TableCell>

                          {/* Actions */}
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {isEditing ? (
                              <>
                                <Tooltip title="Save">
                                  <span>
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => handleSave(w.word)}
                                      disabled={saving}
                                    >
                                      {saving ? <CircularProgress size={16} /> : <SaveIcon fontSize="small" />}
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                <Tooltip title="Cancel">
                                  <IconButton
                                    size="small"
                                    color="default"
                                    onClick={handleCancelEdit}
                                    disabled={saving}
                                  >
                                    <CancelIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            ) : (
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleEditClick(w)}
                                  disabled={editingWord !== null && editingWord !== w.word}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredWords.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            </>
          )}
        </Paper>
      )}

      {!searched && (
        <Box sx={{ py: 10, textAlign: 'center' }}>
          <MenuBookIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography color="textSecondary">Select a book and click Search to view its dictionary.</Typography>
        </Box>
      )}

      {/* Add Word Dialog */}
      <Dialog open={addDialogOpen} onClose={() => !adding && setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Word</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Word"
              value={addForm.word}
              onChange={(e) => setAddForm((f) => ({ ...f, word: e.target.value }))}
              size="small"
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Type (e.g. noun, verb)"
              value={addForm.type ?? ''}
              onChange={(e) => setAddForm((f) => ({ ...f, type: e.target.value }))}
              size="small"
              fullWidth
            />
            <TextField
              label="Sinhala Meaning"
              value={addForm.sinhala_translation ?? ''}
              onChange={(e) => setAddForm((f) => ({ ...f, sinhala_translation: e.target.value }))}
              size="small"
              fullWidth
            />
            <TextField
              label="Tamil Meaning"
              value={addForm.tamil_translation ?? ''}
              onChange={(e) => setAddForm((f) => ({ ...f, tamil_translation: e.target.value }))}
              size="small"
              fullWidth
            />
            <TextField
              label="Simple Definition"
              value={addForm.simple_definition ?? ''}
              onChange={(e) => setAddForm((f) => ({ ...f, simple_definition: e.target.value }))}
              size="small"
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddDialogOpen(false)} disabled={adding} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddWord}
            disabled={adding || !addForm.word.trim()}
            startIcon={adding ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
            sx={{ textTransform: 'none' }}
          >
            {adding ? 'Adding…' : 'Add Word'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookDictionary;
