import React, { useState, useEffect } from 'react';
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
  ListItemButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Edit as EditIcon,
  NavigateBefore,
  NavigateNext,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { booksAPI } from '../services/api';

interface Paragraph {
  id: string;
  text: string;
  ssmlText: string;
  audioUrl: string;
}

interface Page {
  pageNumber: number;
  paragraphs: Paragraph[];
}

interface DigitalVersion {
  id: string;
  bookTitle: string;
  grade: string;
  status: 'pending' | 'approved' | 'rejected';
  lastModified: string;
  pages: Page[];
}

const sampleDigitalVersions: DigitalVersion[] = [
  {
    id: '1',
    bookTitle: 'The Great Gatsby',
    grade: 'Grade 11',
    status: 'pending',
    lastModified: '2025-10-27',
    pages: [
      {
        pageNumber: 1,
        paragraphs: [
          {
            id: '1-1-1',
            text: "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since.",
            ssmlText: "<speak>In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since.</speak>",
            audioUrl: '/audio/gatsby-1-1-1.mp3',
          },
          {
            id: '1-1-2',
            text: "Whenever you feel like criticizing any one, he told me, just remember that all the people in this world haven't had the advantages that you've had.",
            ssmlText: "<speak>Whenever you feel like criticizing any one, he told me, just remember that all the people in this world haven't had the advantages that you've had.</speak>",
            audioUrl: '/audio/gatsby-1-1-2.mp3',
          },
        ],
      },
      {
        pageNumber: 2,
        paragraphs: [
          {
            id: '1-2-1',
            text: "He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that.",
            ssmlText: "<speak>He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that.</speak>",
            audioUrl: '/audio/gatsby-1-2-1.mp3',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    bookTitle: 'To Kill a Mockingbird',
    grade: 'Grade 10',
    status: 'approved',
    lastModified: '2025-10-26',
    pages: [
      {
        pageNumber: 1,
        paragraphs: [
          {
            id: '2-1-1',
            text: 'When he was nearly thirteen, my brother Jem got his arm badly broken at the elbow.',
            ssmlText: '<speak>When he was nearly thirteen, my brother Jem got his arm badly broken at the elbow.</speak>',
            audioUrl: '/audio/mockingbird-1-1-1.mp3',
          },
        ],
      },
    ],
  },
];

const DigitalVersionReview: React.FC = () => {
  const [versions, setVersions] = useState<DigitalVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<DigitalVersion | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedParagraph, setSelectedParagraph] = useState<Paragraph | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedSsml, setEditedSsml] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDigitalVersions();
  }, []);

  const fetchDigitalVersions = async () => {
    try {
      setLoading(true);
      const books = await booksAPI.getAll();
      
      // Convert books to digital versions format for review
      const convertedVersions: DigitalVersion[] = books
        .filter((book: any) => book.status === 'pending' || book.status === 'approved')
        .map((book: any) => ({
          id: book.id.toString(),
          bookTitle: book.title,
          grade: `Grade ${book.grade}`,
          status: book.status as 'pending' | 'approved' | 'rejected',
          lastModified: book.updated_at || new Date().toISOString().split('T')[0],
          pages: [
            {
              pageNumber: 1,
              paragraphs: [
                {
                  id: '1-1-1',
                  text: book.description || 'Sample text',
                  ssmlText: `<speak>${book.description || 'Sample text'}</speak>`,
                  audioUrl: `/audio/${book.id}/default.mp3`,
                },
              ],
            },
          ],
        }));
      
      setVersions(convertedVersions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching digital versions:', error);
      setVersions(sampleDigitalVersions);
      setLoading(false);
    }
  };

  const handleVersionSelect = (version: DigitalVersion) => {
    setSelectedVersion(version);
    setCurrentPage(0);
    setSelectedParagraph(null);
    setTabValue(0);
  };

  const handleNextPage = () => {
    if (selectedVersion && currentPage < selectedVersion.pages.length - 1) {
      setCurrentPage(currentPage + 1);
      setSelectedParagraph(null);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setSelectedParagraph(null);
    }
  };

  const handleParagraphSelect = (paragraph: Paragraph) => {
    setSelectedParagraph(paragraph);
  };

  const handlePlayParagraph = (id: string) => {
    if (isPlaying === id) {
      setIsPlaying(null);
    } else {
      setIsPlaying(id);
    }
  };

  const handleEditParagraph = (paragraph: Paragraph) => {
    setSelectedParagraph(paragraph);
    setEditedSsml(paragraph.ssmlText);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedParagraph) {
      console.log('Saving edited SSML:', editedSsml);
      setEditDialogOpen(false);
    }
  };

  const handleApproveBook = (id: string) => {
    console.log('Approving book:', id);
  };

  const handleRejectBook = (id: string) => {
    console.log('Rejecting book:', id);
  };

  const handleRequestRegeneration = (id: string) => {
    console.log('Requesting regeneration for:', id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Digital Version Review
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="600px">
          <CircularProgress />
        </Box>
      ) : (
      <Grid container spacing={3}>
        {/* Books List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Books to Review
            </Typography>
            <List sx={{ maxHeight: '600px', overflow: 'auto' }}>
              {versions.map((version) => (
                <ListItemButton
                  key={version.id}
                  selected={selectedVersion?.id === version.id}
                  onClick={() => handleVersionSelect(version)}
                  sx={{
                    mb: 1,
                    borderRadius: 1,
                    bgcolor: selectedVersion?.id === version.id ? 'primary.light' : 'background.paper',
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {version.bookTitle}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {version.grade}
                    </Typography>
                    <Chip
                      label={version.status}
                      size="small"
                      color={getStatusColor(version.status) as any}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Content Review Area */}
        <Grid item xs={12} md={8}>
          {selectedVersion ? (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {selectedVersion.bookTitle}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Page {currentPage + 1} of {selectedVersion.pages.length}
                  </Typography>
                </Box>
                <Chip
                  label={selectedVersion.status}
                  color={getStatusColor(selectedVersion.status) as any}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
                <Tab label="Page Content" />
                <Tab label="Actions" />
              </Tabs>

              {tabValue === 0 && (
                <Box>
                  {/* Page Navigation */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Button
                      startIcon={<NavigateBefore />}
                      onClick={handlePrevPage}
                      disabled={currentPage === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      endIcon={<NavigateNext />}
                      onClick={handleNextPage}
                      disabled={currentPage === selectedVersion.pages.length - 1}
                    >
                      Next
                    </Button>
                  </Box>

                  {/* Paragraphs List */}
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Paragraphs
                  </Typography>
                  <List>
                    {selectedVersion.pages[currentPage]?.paragraphs.map((paragraph) => (
                      <Paper
                        key={paragraph.id}
                        sx={{
                          mb: 2,
                          p: 2,
                          cursor: 'pointer',
                          bgcolor: selectedParagraph?.id === paragraph.id ? 'primary.light' : 'background.paper',
                          border: selectedParagraph?.id === paragraph.id ? '2px solid primary.main' : '1px solid grey.300',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                        onClick={() => handleParagraphSelect(paragraph)}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" gutterBottom>
                              {paragraph.text}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: 'monospace',
                                bgcolor: 'grey.100',
                                p: 1,
                                borderRadius: 1,
                                display: 'block',
                                mt: 1,
                                maxHeight: '80px',
                                overflow: 'auto',
                              }}
                            >
                              {paragraph.ssmlText}
                            </Typography>
                          </Box>
                          <Stack direction="column" spacing={1}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayParagraph(paragraph.id);
                              }}
                              color={isPlaying === paragraph.id ? 'primary' : 'default'}
                            >
                              {isPlaying === paragraph.id ? <PauseIcon /> : <PlayIcon />}
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditParagraph(paragraph);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Stack>
                        </Box>
                      </Paper>
                    ))}
                  </List>
                </Box>
              )}

              {tabValue === 1 && (
                <Stack spacing={2}>
                  <Alert severity="info">
                    Review the pages and paragraphs. Make corrections to SSML text, approve, reject, or request regeneration.
                  </Alert>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<ApproveIcon />}
                      onClick={() => handleApproveBook(selectedVersion.id)}
                      disabled={selectedVersion.status === 'approved'}
                    >
                      Approve Book
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<RejectIcon />}
                      onClick={() => handleRejectBook(selectedVersion.id)}
                    >
                      Reject Book
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={() => handleRequestRegeneration(selectedVersion.id)}
                    >
                      Request Regeneration
                    </Button>
                  </Box>
                </Stack>
              )}
            </Paper>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">
                Select a book to review
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
      )}

      {/* SSML Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit SSML Text</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={editedSsml}
            onChange={(e) => setEditedSsml(e.target.value)}
            variant="outlined"
            sx={{ mt: 2 }}
            placeholder="<speak>Your SSML text here</speak>"
          />
          {selectedParagraph && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Audio Preview:
              </Typography>
              <audio controls src={selectedParagraph.audioUrl} style={{ width: '100%' }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DigitalVersionReview;
