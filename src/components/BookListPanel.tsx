import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItemButton,
  Box,
  Chip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Stack,
  CircularProgress,
} from '@mui/material';
import { Book as BookIcon } from '@mui/icons-material';

interface Book {
  id: number;
  book_name: string;
  grade: number;
  total_pages: number | null;
  processing_status: string;
  s3_base_path: string | null;
  dictionary_s3_key: string | null;
  created_at: number;
  updated_at: number;
}

interface BookListPanelProps {
  books: Book[];
  selectedBookId: number | null;
  onSelectBook: (book: Book) => void;
  loading?: boolean;
  statusFilter: string;
  gradeFilter: string;
  onStatusFilterChange: (status: string) => void;
  onGradeFilterChange: (grade: string) => void;
}

const BookListPanel: React.FC<BookListPanelProps> = ({
  books,
  selectedBookId,
  onSelectBook,
  loading = false,
  statusFilter,
  gradeFilter,
  onStatusFilterChange,
  onGradeFilterChange,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'failed':
        return 'error';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Books to Review
      </Typography>

      {/* Filters */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Grade</InputLabel>
          <Select
            value={gradeFilter}
            label="Grade"
            onChange={(e) => onGradeFilterChange(e.target.value)}
          >
            <MenuItem value="all">All Grades</MenuItem>
            {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
              <MenuItem key={grade} value={grade.toString()}>
                Grade {grade}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Books List */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
          <CircularProgress />
        </Box>
      ) : books.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
          <Typography color="textSecondary">No books found</Typography>
        </Box>
      ) : (
        <List sx={{ flex: 1, overflow: 'auto' }}>
          {books.map((book) => (
            <ListItemButton
              key={book.id}
              selected={selectedBookId === book.id}
              onClick={() => onSelectBook(book)}
              sx={{
                mb: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor: selectedBookId === book.id ? 'primary.main' : 'divider',
                bgcolor: selectedBookId === book.id ? 'primary.light' : 'background.paper',
                '&:hover': {
                  bgcolor: selectedBookId === book.id ? 'primary.light' : 'action.hover',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
                <BookIcon sx={{ mt: 0.5, color: 'primary.main' }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {book.book_name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Grade {book.grade}
                    {book.total_pages && ` • ${book.total_pages} pages`}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={book.processing_status}
                      size="small"
                      color={getStatusColor(book.processing_status) as any}
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                </Box>
              </Box>
            </ListItemButton>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default BookListPanel;
