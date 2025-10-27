import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
} from '@mui/icons-material';

interface AudioReview {
  id: string;
  bookTitle: string;
  chapter: string;
  audioUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
  lastModified: string;
}

const AudioReviewPage: React.FC = () => {
  const [selectedReview, setSelectedReview] = useState<AudioReview | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  // Sample data - replace with actual data from your backend
  const audioReviews: AudioReview[] = [
    {
      id: '1',
      bookTitle: 'Physics Grade 9',
      chapter: 'Chapter 1: Introduction',
      audioUrl: '/sample-audio/physics-ch1.mp3',
      status: 'pending',
      lastModified: '2025-10-27',
    },
    {
      id: '2',
      bookTitle: 'Chemistry Grade 10',
      chapter: 'Chapter 2: Atomic Structure',
      audioUrl: '/sample-audio/chemistry-ch2.mp3',
      status: 'pending',
      lastModified: '2025-10-26',
    },
  ];

  const handleReviewClick = (review: AudioReview) => {
    setSelectedReview(review);
    setReviewNotes(review.reviewNotes || '');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReview(null);
    setReviewNotes('');
    setIsPlaying(false);
  };

  const handleApprove = () => {
    if (selectedReview) {
      // Implement approval logic
      console.log('Approved:', selectedReview.id, 'Notes:', reviewNotes);
    }
    handleCloseDialog();
  };

  const handleReject = () => {
    if (selectedReview) {
      // Implement rejection logic
      console.log('Rejected:', selectedReview.id, 'Notes:', reviewNotes);
    }
    handleCloseDialog();
  };

  const getStatusChip = (status: string) => {
    const chipProps = {
      pending: { color: 'warning', label: 'Pending Review' },
      approved: { color: 'success', label: 'Approved' },
      rejected: { color: 'error', label: 'Rejected' },
    }[status] as any;

    return (
      <Chip
        size="small"
        {...chipProps}
        sx={{ minWidth: 100 }}
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Audio Review
      </Typography>

      <List>
        {audioReviews.map((review) => (
          <Paper
            key={review.id}
            sx={{
              mb: 2,
              p: 2,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.01)',
              },
            }}
          >
            <ListItem
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={() => handleReviewClick(review)}
                >
                  <PlayIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={review.bookTitle}
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {review.chapter}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                      {getStatusChip(review.status)}
                      <Typography variant="caption" color="text.secondary">
                        Last modified: {review.lastModified}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          </Paper>
        ))}
      </List>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Review Audio
          {selectedReview && (
            <Typography variant="subtitle1" color="text.secondary">
              {selectedReview.bookTitle} - {selectedReview.chapter}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedReview && (
            <>
              <Box sx={{ my: 2 }}>
                <audio
                  controls
                  style={{ width: '100%' }}
                  src={selectedReview.audioUrl}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                >
                  Your browser does not support the audio element.
                </audio>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Review Notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                variant="outlined"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="error"
            startIcon={<RejectIcon />}
            onClick={handleReject}
          >
            Reject
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<ApproveIcon />}
            onClick={handleApprove}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AudioReviewPage;