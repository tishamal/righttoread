import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  Stack,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

interface DigitalVersion {
  id: string;
  bookTitle: string;
  ssmlText: string;
  audioUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  grade: string;
  lastModified: string;
}

const sampleDigitalVersions: DigitalVersion[] = [
  {
    id: '1',
    bookTitle: 'The Great Gatsby',
    ssmlText: "<speak>In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since.</speak>",
    audioUrl: '/sample-audio-1.mp3',
    status: 'pending',
    grade: 'Grade 11',
    lastModified: '2025-10-27',
  },
  {
    id: '2',
    bookTitle: 'To Kill a Mockingbird',
    ssmlText: '<speak>When he was nearly thirteen, my brother Jem got his arm badly broken at the elbow.</speak>',
    audioUrl: '/sample-audio-2.mp3',
    status: 'approved',
    grade: 'Grade 10',
    lastModified: '2025-10-26',
  },
];

const DigitalVersionReview: React.FC = () => {
  const [versions, setVersions] = useState<DigitalVersion[]>(sampleDigitalVersions);
  const [selectedVersion, setSelectedVersion] = useState<DigitalVersion | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedSsml, setEditedSsml] = useState('');

  const handlePlay = (id: string) => {
    if (isPlaying === id) {
      setIsPlaying(null);
      // Pause audio logic here
    } else {
      setIsPlaying(id);
      // Play audio logic here
    }
  };

  const handleApprove = (id: string) => {
    setVersions(versions.map(v => 
      v.id === id ? { ...v, status: 'approved' } : v
    ));
  };

  const handleReject = (id: string) => {
    setVersions(versions.map(v => 
      v.id === id ? { ...v, status: 'rejected' } : v
    ));
  };

  const handleEdit = (version: DigitalVersion) => {
    setSelectedVersion(version);
    setEditedSsml(version.ssmlText);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedVersion) {
      setVersions(versions.map(v =>
        v.id === selectedVersion.id ? { ...v, ssmlText: editedSsml } : v
      ));
      setEditDialogOpen(false);
    }
  };

  const getStatusColor = (status: DigitalVersion['status']) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Digital Version Review
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper>
            <List>
              {versions.map((version) => (
                <ListItem
                  key={version.id}
                  divider
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {version.bookTitle}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {version.grade} • {version.lastModified}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={5}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          bgcolor: 'grey.100',
                          p: 1,
                          borderRadius: 1,
                          maxHeight: '80px',
                          overflow: 'auto',
                        }}
                      >
                        {version.ssmlText}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton
                          onClick={() => handlePlay(version.id)}
                          color="primary"
                        >
                          {isPlaying === version.id ? <PauseIcon /> : <PlayIcon />}
                        </IconButton>

                        <IconButton
                          onClick={() => handleEdit(version)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>

                        <Chip
                          label={version.status}
                          color={getStatusColor(version.status)}
                          size="small"
                        />

                        {version.status === 'pending' && (
                          <>
                            <Button
                              startIcon={<ApproveIcon />}
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handleApprove(version.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              startIcon={<RejectIcon />}
                              variant="contained"
                              color="error"
                              size="small"
                              onClick={() => handleReject(version.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit SSML Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit SSML Text</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={6}
            value={editedSsml}
            onChange={(e) => setEditedSsml(e.target.value)}
            fullWidth
            variant="outlined"
            margin="dense"
            sx={{ fontFamily: 'monospace' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DigitalVersionReview;
