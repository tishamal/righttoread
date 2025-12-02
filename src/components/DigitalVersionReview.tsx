import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  IconButton,
  Button,
  TextField,
  Tabs,
  Tab,
  Alert,
  Divider,
  CircularProgress,
  Snackbar,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  NavigateBefore,
  NavigateNext,
  CheckCircle,
  Cancel,
  Edit,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { ttsAPI } from '../services/api';
import BookListPanel from './BookListPanel';

interface Block {
  id: string;
  text: string;
  ssml?: string;
  voiceId?: string;
  blockNumber?: number;
  normalAudioUrl?: string;
  slowAudioUrl?: string;
  speechMarksUrl?: string;
}

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

interface BookPage {
  page_number: number;
  status: string;
  image_s3_key: string | null;
  annotated_image_s3_key: string | null;
  blocks_s3_key: string | null;
  slow_blocks_s3_key: string | null;
  metadata_s3_key: string | null;
  audio_files: Array<{
    block_id: string;
    audio_type: string;
    audio_s3_key: string;
    speech_marks_s3_key: string | null;
  }>;
}

interface BookDetails {
  book: Book;
  pages: BookPage[];
}

const DigitalVersionReview: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookDetails, setBookDetails] = useState<BookDetails | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentPageData, setCurrentPageData] = useState<{
    imageUrl: string | null;
    blocks: Block[];
    audioUrls: Record<string, string>;
  }>({ imageUrl: null, blocks: [], audioUrls: {} });
  const [playingBlockId, setPlayingBlockId] = useState<string | null>(null);
  const [audioSpeed, setAudioSpeed] = useState<'normal' | 'slow'>('normal');
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState('completed');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [editedSsml, setEditedSsml] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });
  const [bookListCollapsed, setBookListCollapsed] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, [statusFilter, gradeFilter]);

  useEffect(() => {
    if (selectedBook) {
      fetchBookDetails(selectedBook.id);
    }
  }, [selectedBook]);

  useEffect(() => {
    if (bookDetails && bookDetails.pages.length > 0) {
      loadPageData(currentPageIndex);
    }
  }, [bookDetails, currentPageIndex]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (gradeFilter !== 'all') params.grade = parseInt(gradeFilter);

      const booksData = await ttsAPI.getBooksForReview(params);
      setBooks(booksData);
    } catch (error) {
      console.error('Error fetching books:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch books',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookDetails = async (bookId: number) => {
    try {
      setLoadingPage(true);
      const details = await ttsAPI.getBookDetails(bookId);
      setBookDetails(details);
      setCurrentPageIndex(0);
    } catch (error) {
      console.error('Error fetching book details:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch book details',
        severity: 'error',
      });
    } finally {
      setLoadingPage(false);
    }
  };

  const loadPageData = async (pageIndex: number) => {
    if (!bookDetails || pageIndex >= bookDetails.pages.length) return;

    try {
      setLoadingPage(true);
      const page = bookDetails.pages[pageIndex];
      
      // Collect all S3 keys we need
      const s3Keys: string[] = [];
      if (page.image_s3_key) s3Keys.push(page.image_s3_key);
      if (page.blocks_s3_key) s3Keys.push(page.blocks_s3_key);
      if (page.slow_blocks_s3_key) s3Keys.push(page.slow_blocks_s3_key);
      
      // Add audio file keys
      page.audio_files.forEach(audio => {
        if (audio.audio_s3_key) s3Keys.push(audio.audio_s3_key);
        if (audio.speech_marks_s3_key) s3Keys.push(audio.speech_marks_s3_key);
      });

      // Get presigned URLs
      const urls = await ttsAPI.getPresignedUrls(selectedBook!.id, s3Keys);
      console.log('Presigned URLs received:', urls);
      console.log('Image S3 key:', page.image_s3_key);
      console.log('Image URL:', urls[page.image_s3_key || '']);
      
      // Fetch blocks.json if available - prefer slow_blocks for slow reading, fallback to regular blocks
      let blocks: Block[] = [];
      const blocksKey = page.slow_blocks_s3_key || page.blocks_s3_key;
      
      if (blocksKey && urls[blocksKey]) {
        try {
          console.log('Fetching blocks from:', blocksKey);
          // Use proxy endpoint to avoid CORS issues
          const proxyUrl = `${process.env.REACT_APP_TTS_SERVICE_URL}/api/s3-proxy?s3_key=${encodeURIComponent(blocksKey)}`;
          console.log('Using proxy URL:', proxyUrl);
          
          const response = await fetch(proxyUrl);
          const blocksData = await response.json();
          console.log('Blocks data received:', blocksData);
          
          // Handle different JSON structures
          let blocksArray: any[] = [];
          
          if (Array.isArray(blocksData)) {
            // Array format: [block1, block2, ...]
            blocksArray = blocksData;
          } else if (blocksData.tts_blocks && Array.isArray(blocksData.tts_blocks)) {
            // Nested array format: { tts_blocks: [block1, block2, ...] }
            blocksArray = blocksData.tts_blocks;
          } else if (typeof blocksData === 'object') {
            // Object with numeric keys: { "0": block1, "1": block2, ... }
            blocksArray = Object.keys(blocksData)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map(key => ({ ...blocksData[key], blockNumber: key }));
          }
          
          // Convert blocks data to our format
          blocks = blocksArray.map((block: any, index: number) => {
            const blockNumber = block.blockNumber || index.toString();
            // Use 'block_{page}_{num}' format to match backend audio file IDs
            const blockId = `block_${page.page_number}_${blockNumber}`;
            return {
              id: blockId,
              text: block.text || block.content || '',
              ssml: block.ssml || block.text || '',
              voiceId: block.voice_id || 'Ruth',
              blockNumber: parseInt(blockNumber),
            };
          });
          
          console.log('Generated block IDs:', blocks.map(b => b.id));
          
          console.log('Parsed blocks:', blocks);
        } catch (err) {
          console.error('Error fetching blocks:', err);
        }
      }

      // Map audio URLs
      const audioUrls: Record<string, string> = {};
      page.audio_files.forEach(audio => {
        const key = `${audio.block_id}_${audio.audio_type}`;
        if (urls[audio.audio_s3_key]) {
          audioUrls[key] = urls[audio.audio_s3_key];
          console.log(`Mapped audio: ${key} -> ${urls[audio.audio_s3_key].substring(0, 100)}...`);
        } else {
          console.warn(`Missing URL for audio key: ${audio.audio_s3_key}`);
        }
      });
      
      console.log('Audio files from backend:', page.audio_files.map(a => ({ block_id: a.block_id, type: a.audio_type })));

      setCurrentPageData({
        imageUrl: page.image_s3_key && urls[page.image_s3_key] ? urls[page.image_s3_key] : null,
        blocks,
        audioUrls,
      });
      console.log('Current page data set:', {
        imageUrl: page.image_s3_key && urls[page.image_s3_key] ? urls[page.image_s3_key] : null,
        blocksCount: blocks.length,
        audioUrlsCount: Object.keys(audioUrls).length,
        audioKeys: Object.keys(audioUrls),
        blockIds: blocks.map(b => b.id),
      });

      // Initialize SSML edit state
      const ssmlState: Record<string, string> = {};
      blocks.forEach(block => {
        ssmlState[block.id] = block.ssml || block.text;
      });
      setEditedSsml(ssmlState);
    } catch (error) {
      console.error('Error loading page data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load page data',
        severity: 'error',
      });
    } finally {
      setLoadingPage(false);
    }
  };

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setTabValue(0);
    setPlayingBlockId(null);
  };

  const handleNextPage = () => {
    if (bookDetails && currentPageIndex < bookDetails.pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      setPlayingBlockId(null);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      setPlayingBlockId(null);
    }
  };

  const handlePlayBlock = (blockId: string) => {
    if (playingBlockId === blockId) {
      setPlayingBlockId(null);
    } else {
      setPlayingBlockId(blockId);
      
      // Play audio
      const audioKey = `${blockId}_${audioSpeed}`;
      const audioUrl = currentPageData.audioUrls[audioKey];
      
      console.log('Attempting to play audio:', {
        blockId,
        audioSpeed,
        audioKey,
        audioUrl: audioUrl ? audioUrl.substring(0, 100) + '...' : 'NOT FOUND',
        availableAudioKeys: Object.keys(currentPageData.audioUrls),
      });
      
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play().catch(err => {
          console.error('Error playing audio:', err);
          setSnackbar({
            open: true,
            message: 'Failed to play audio',
            severity: 'error',
          });
        });
        
        audio.onended = () => setPlayingBlockId(null);
      } else {
        console.error('No audio URL found for key:', audioKey);
        setSnackbar({
          open: true,
          message: `No audio available for this block (${audioSpeed} speed)`,
          severity: 'warning',
        });
        setPlayingBlockId(null);
      }
    }
  };

  const handleSsmlChange = (blockId: string, newSsml: string) => {
    setEditedSsml(prev => ({
      ...prev,
      [blockId]: newSsml,
    }));
  };

  const handleApproveBook = async () => {
    if (!selectedBook) return;

    try {
      await ttsAPI.updateReviewStatus(selectedBook.id, 'approved', reviewerNotes);
      setSnackbar({
        open: true,
        message: 'Book approved successfully',
        severity: 'success',
      });
      
      // Update local state
      setBooks(prev => prev.map(b => 
        b.id === selectedBook.id 
          ? { ...b, processing_status: 'approved' }
          : b
      ));
      
      // Clear selection
      setSelectedBook(null);
      setBookDetails(null);
      setReviewerNotes('');
    } catch (error) {
      console.error('Error approving book:', error);
      setSnackbar({
        open: true,
        message: 'Failed to approve book',
        severity: 'error',
      });
    }
  };

  const handleRejectBook = async () => {
    if (!selectedBook) return;

    try {
      await ttsAPI.updateReviewStatus(selectedBook.id, 'rejected', reviewerNotes);
      setSnackbar({
        open: true,
        message: 'Book rejected',
        severity: 'success',
      });
      
      // Update local state
      setBooks(prev => prev.map(b => 
        b.id === selectedBook.id 
          ? { ...b, processing_status: 'rejected' }
          : b
      ));
      
      // Clear selection
      setSelectedBook(null);
      setBookDetails(null);
      setReviewerNotes('');
    } catch (error) {
      console.error('Error rejecting book:', error);
      setSnackbar({
        open: true,
        message: 'Failed to reject book',
        severity: 'error',
      });
    }
  };

  const handleRequestRevision = async () => {
    if (!selectedBook) return;

    try {
      await ttsAPI.updateReviewStatus(selectedBook.id, 'needs_revision', reviewerNotes);
      setSnackbar({
        open: true,
        message: 'Revision requested',
        severity: 'success',
      });
      
      // Update local state
      setBooks(prev => prev.map(b => 
        b.id === selectedBook.id 
          ? { ...b, processing_status: 'needs_revision' }
          : b
      ));
      
      setReviewerNotes('');
    } catch (error) {
      console.error('Error requesting revision:', error);
      setSnackbar({
        open: true,
        message: 'Failed to request revision',
        severity: 'error',
      });
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>
      {/* Left Sidebar - Book List (Collapsible) */}
      <Box
        sx={{
          width: bookListCollapsed ? 0 : 320,
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          borderRight: bookListCollapsed ? 0 : 1,
          borderColor: 'divider',
        }}
      >
        <BookListPanel
          books={books}
          selectedBookId={selectedBook?.id || null}
          onSelectBook={handleSelectBook}
          loading={loading}
          statusFilter={statusFilter}
          gradeFilter={gradeFilter}
          onStatusFilterChange={setStatusFilter}
          onGradeFilterChange={setGradeFilter}
        />
      </Box>

      {/* Collapse/Expand Button */}
      <Box
        sx={{
          width: 40,
          bgcolor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
        onClick={() => setBookListCollapsed(!bookListCollapsed)}
      >
        <IconButton size="small">
          {bookListCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>

      {/* Main Content Area */}
      {!selectedBook ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Select a book to review
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
                  {selectedBook.book_name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Grade {selectedBook.grade}
                  </Typography>
                  <Chip
                    label={selectedBook.processing_status}
                    size="small"
                    color={
                      selectedBook.processing_status === 'approved'
                        ? 'success'
                        : selectedBook.processing_status === 'rejected'
                        ? 'error'
                        : 'warning'
                    }
                  />
                  <Typography variant="body2" color="text.secondary">
                    Page {currentPageIndex + 1} of {bookDetails?.pages.length || 0}
                  </Typography>
                </Box>
              </Box>

              {/* Page Navigation */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<NavigateBefore />}
                  onClick={handlePrevPage}
                  disabled={currentPageIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<NavigateNext />}
                  onClick={handleNextPage}
                  disabled={!bookDetails || currentPageIndex >= bookDetails.pages.length - 1}
                >
                  Next
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Main Content - Image and Blocks Side by Side */}
          <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {loadingPage ? (
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Left Side - Page Image */}
                <Box
                  sx={{
                    width: bookListCollapsed ? '45%' : '55%',
                    transition: 'width 0.3s ease',
                    borderRight: 1,
                    borderColor: 'divider',
                    overflow: 'auto',
                    bgcolor: 'grey.50',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 2,
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Page Image
                  </Typography>
                  {currentPageData.imageUrl ? (
                    <Box
                      component="img"
                      src={currentPageData.imageUrl}
                      alt={`Page ${currentPageIndex + 1}`}
                      sx={{
                        width: '100%',
                        height: 'auto',
                        boxShadow: 3,
                        borderRadius: 1,
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '400px',
                        border: '2px dashed',
                        borderColor: 'grey.400',
                        borderRadius: 1,
                        width: '100%',
                      }}
                    >
                      <Typography color="text.secondary">No image available</Typography>
                    </Box>
                  )}
                </Box>

                {/* Right Side - Text Blocks */}
                <Box
                  sx={{
                    width: bookListCollapsed ? '55%' : '45%',
                    transition: 'width 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  {/* Header with Audio Speed Toggle */}
                  <Box
                    sx={{
                      p: 2,
                      borderBottom: 1,
                      borderColor: 'divider',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Typography variant="h6">Text Blocks</Typography>
                    <ToggleButtonGroup
                      value={audioSpeed}
                      exclusive
                      onChange={(e, newSpeed) => newSpeed && setAudioSpeed(newSpeed)}
                      size="small"
                    >
                      <ToggleButton value="normal">Normal Speed</ToggleButton>
                      <ToggleButton value="slow">Slow Speed</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  {/* Blocks List */}
                  <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                    {currentPageData.blocks.length === 0 ? (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                        }}
                      >
                        <Typography color="text.secondary">
                          No text blocks available for this page
                        </Typography>
                      </Box>
                    ) : (
                      currentPageData.blocks.map((block, index) => (
                        <Paper
                          key={block.id}
                          elevation={playingBlockId === block.id ? 4 : 1}
                          sx={{
                            p: 2,
                            mb: 2,
                            bgcolor: playingBlockId === block.id ? 'primary.light' : 'background.paper',
                            border: playingBlockId === block.id ? 2 : 0,
                            borderColor: 'primary.main',
                            transition: 'all 0.3s',
                          }}
                        >
                          {/* Block Header */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Chip
                              label={`Block ${block.blockNumber !== undefined ? block.blockNumber : index}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            {block.voiceId && (
                              <Chip
                                label={`Voice: ${block.voiceId}`}
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            )}
                            <IconButton
                              onClick={() => handlePlayBlock(block.id)}
                              color={playingBlockId === block.id ? 'primary' : 'default'}
                              sx={{
                                bgcolor: playingBlockId === block.id ? 'primary.main' : 'grey.200',
                                color: playingBlockId === block.id ? 'white' : 'inherit',
                                '&:hover': {
                                  bgcolor: playingBlockId === block.id ? 'primary.dark' : 'grey.300',
                                },
                              }}
                            >
                              {playingBlockId === block.id ? <Pause /> : <PlayArrow />}
                            </IconButton>
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                              {audioSpeed === 'normal' ? 'Normal Speed' : 'Slow Speed'}
                            </Typography>
                          </Box>

                          {/* Block Text */}
                          <Typography variant="body1" gutterBottom sx={{ mb: 2, lineHeight: 1.8 }}>
                            {block.text}
                          </Typography>

                          <Divider sx={{ my: 2 }} />

                          {/* SSML Input */}
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="SSML (Editable)"
                            value={editedSsml[block.id] || block.ssml || ''}
                            onChange={(e) => handleSsmlChange(block.id, e.target.value)}
                            variant="outlined"
                            size="small"
                            sx={{
                              '& .MuiInputBase-input': {
                                fontFamily: 'monospace',
                                fontSize: '0.85rem',
                              },
                            }}
                            helperText="Edit SSML markup to modify speech synthesis"
                          />
                        </Paper>
                      ))
                    )}
                  </Box>

                  {/* Review Actions Footer */}
                  <Box
                    sx={{
                      p: 2,
                      borderTop: 1,
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={handleApproveBook}
                        fullWidth
                      >
                        Approve Book
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={handleRejectBook}
                        fullWidth
                      >
                        Reject Book
                      </Button>
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<Edit />}
                        onClick={handleRequestRevision}
                        fullWidth
                      >
                        Request Revision
                      </Button>
                    </Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Add reviewer notes..."
                      value={reviewerNotes}
                      onChange={(e) => setReviewerNotes(e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Box>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DigitalVersionReview;

