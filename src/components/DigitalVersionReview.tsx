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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
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
  ExpandMore,
  DragIndicator,
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

// Sortable Block Item Component
interface SortableBlockItemProps {
  block: Block;
  index: number;
  isExpanded: boolean;
  isPlaying: boolean;
  audioSpeed: 'normal' | 'slow';
  editedSsml: string;
  onToggle: () => void;
  onPlay: () => void;
  onSsmlChange: (value: string) => void;
}

const SortableBlockItem: React.FC<SortableBlockItemProps> = ({
  block,
  index,
  isExpanded,
  isPlaying,
  audioSpeed,
  editedSsml,
  onToggle,
  onPlay,
  onSsmlChange,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box ref={setNodeRef} style={style} sx={{ mb: 2 }}>
      <Accordion
        expanded={isExpanded}
        onChange={onToggle}
        sx={{
          bgcolor: isPlaying ? 'primary.light' : 'background.paper',
          border: isPlaying ? 2 : 1,
          borderColor: isPlaying ? 'primary.main' : 'divider',
          '&:before': { display: 'none' },
          boxShadow: isPlaying ? 4 : 1,
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            '& .MuiAccordionSummary-content': {
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            },
          }}
        >
          <Tooltip title="Drag to reorder">
            <Box
              {...attributes}
              {...listeners}
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'grab',
                '&:active': { cursor: 'grabbing' },
                mr: 1,
              }}
            >
              <DragIndicator sx={{ color: 'text.secondary' }} />
            </Box>
          </Tooltip>
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
          <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onPlay();
              }}
              color={isPlaying ? 'primary' : 'default'}
              sx={{
                bgcolor: isPlaying ? 'primary.main' : 'grey.200',
                color: isPlaying ? 'white' : 'inherit',
                '&:hover': {
                  bgcolor: isPlaying ? 'primary.dark' : 'grey.300',
                },
                ml: 'auto',
              }}
            >
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
          </Tooltip>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {audioSpeed === 'normal' ? 'Normal' : 'Slow'}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
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
            value={editedSsml}
            onChange={(e) => onSsmlChange(e.target.value)}
            variant="outlined"
            size="small"
            onClick={(e) => e.stopPropagation()}
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: 'monospace',
                fontSize: '0.85rem',
              },
            }}
            helperText="Edit SSML markup to modify speech synthesis"
          />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

const DigitalVersionReview: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookDetails, setBookDetails] = useState<BookDetails | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentPageData, setCurrentPageData] = useState<{
    imageUrl: string | null;
    normalBlocks: Block[];
    slowBlocks: Block[];
    audioUrls: Record<string, string>;
  }>({ imageUrl: null, normalBlocks: [], slowBlocks: [], audioUrls: {} });
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
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({});
  const [blockOrder, setBlockOrder] = useState<{
    normal: string[];
    slow: string[];
  }>({ normal: [], slow: [] });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      
      // Helper function to fetch and parse blocks from a URL
      const fetchBlocksFromUrl = async (blocksKey: string | null): Promise<Block[]> => {
        if (!blocksKey || !urls[blocksKey]) {
          return [];
        }

        try {
          console.log('Fetching blocks from:', blocksKey);
          // Use proxy endpoint to avoid CORS issues
          const proxyUrl = `${process.env.REACT_APP_TTS_SERVICE_URL}/api/s3-proxy?s3_key=${encodeURIComponent(blocksKey)}`;
          console.log('Using proxy URL:', proxyUrl);
          
          const response = await fetch(proxyUrl);
          const blocksData = await response.json();
          console.log('Blocks data received from', blocksKey, ':', blocksData);
          
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
          const blocks = blocksArray.map((block: any, index: number) => {
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
          
          console.log('Parsed blocks from', blocksKey, ':', blocks.map(b => ({ id: b.id, text: b.text.substring(0, 50) })));
          return blocks;
        } catch (err) {
          console.error('Error fetching blocks from', blocksKey, ':', err);
          return [];
        }
      };

      // Fetch BOTH normal and slow blocks
      const [normalBlocks, slowBlocks] = await Promise.all([
        fetchBlocksFromUrl(page.blocks_s3_key),
        fetchBlocksFromUrl(page.slow_blocks_s3_key),
      ]);
      
      console.log('Normal blocks count:', normalBlocks.length);
      console.log('Slow blocks count:', slowBlocks.length);

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
        normalBlocks,
        slowBlocks,
        audioUrls,
      });
      console.log('Current page data set:', {
        imageUrl: page.image_s3_key && urls[page.image_s3_key] ? urls[page.image_s3_key] : null,
        normalBlocksCount: normalBlocks.length,
        slowBlocksCount: slowBlocks.length,
        audioUrlsCount: Object.keys(audioUrls).length,
        audioKeys: Object.keys(audioUrls),
        normalBlockIds: normalBlocks.map(b => b.id),
        slowBlockIds: slowBlocks.map(b => b.id),
      });

      // Initialize SSML edit state for BOTH block sets
      const ssmlState: Record<string, string> = {};
      [...normalBlocks, ...slowBlocks].forEach(block => {
        ssmlState[block.id] = block.ssml || block.text;
      });
      setEditedSsml(ssmlState);

      // Initialize block order
      setBlockOrder({
        normal: normalBlocks.map(b => b.id),
        slow: slowBlocks.map(b => b.id),
      });

      // Initialize all blocks as expanded
      const expandedState: Record<string, boolean> = {};
      [...normalBlocks, ...slowBlocks].forEach(block => {
        expandedState[block.id] = true;
      });
      setExpandedBlocks(expandedState);
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

  const handleToggleBlock = (blockId: string) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId],
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const currentMode = audioSpeed;
    const orderKey = currentMode === 'slow' ? 'slow' : 'normal';
    const currentOrder = blockOrder[orderKey];

    const oldIndex = currentOrder.indexOf(active.id as string);
    const newIndex = currentOrder.indexOf(over.id as string);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(currentOrder, oldIndex, newIndex);
      setBlockOrder(prev => ({
        ...prev,
        [orderKey]: newOrder,
      }));

      console.log('Block order updated:', newOrder);
      setSnackbar({
        open: true,
        message: `Block order updated. Don't forget to save changes!`,
        severity: 'info',
      });
    }
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
                    <Box>
                      <Typography variant="h6">Text Blocks</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {audioSpeed === 'slow' 
                          ? `Slow Reading Mode (${currentPageData.slowBlocks.length} blocks)`
                          : `Normal Reading Mode (${currentPageData.normalBlocks.length} blocks)`
                        }
                      </Typography>
                    </Box>
                    <ToggleButtonGroup
                      value={audioSpeed}
                      exclusive
                      onChange={(e, newSpeed) => {
                        if (newSpeed) {
                          setAudioSpeed(newSpeed);
                          setPlayingBlockId(null); // Stop any playing audio
                          console.log('Audio speed changed to:', newSpeed);
                        }
                      }}
                      size="small"
                    >
                      <ToggleButton value="normal">
                        Normal Speed
                        {currentPageData.normalBlocks.length > 0 && (
                          <Chip 
                            label={currentPageData.normalBlocks.length} 
                            size="small" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </ToggleButton>
                      <ToggleButton value="slow">
                        Slow Speed
                        {currentPageData.slowBlocks.length > 0 && (
                          <Chip 
                            label={currentPageData.slowBlocks.length} 
                            size="small" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  {/* Blocks List Header with Expand/Collapse Controls */}
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      borderBottom: 1,
                      borderColor: 'divider',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      bgcolor: 'background.default',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <DragIndicator fontSize="small" />
                      Drag blocks to reorder
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => {
                          const currentBlocks = audioSpeed === 'slow' ? currentPageData.slowBlocks : currentPageData.normalBlocks;
                          const newState: Record<string, boolean> = {};
                          currentBlocks.forEach(block => {
                            newState[block.id] = true;
                          });
                          setExpandedBlocks(prev => ({ ...prev, ...newState }));
                        }}
                      >
                        Expand All
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => {
                          const currentBlocks = audioSpeed === 'slow' ? currentPageData.slowBlocks : currentPageData.normalBlocks;
                          const newState: Record<string, boolean> = {};
                          currentBlocks.forEach(block => {
                            newState[block.id] = false;
                          });
                          setExpandedBlocks(prev => ({ ...prev, ...newState }));
                        }}
                      >
                        Collapse All
                      </Button>
                    </Box>
                  </Box>

                  {/* Blocks List */}
                  <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                    {(() => {
                      // Select the correct blocks based on audio speed
                      const currentMode = audioSpeed === 'slow' ? 'slow' : 'normal';
                      const currentBlocks = audioSpeed === 'slow' ? currentPageData.slowBlocks : currentPageData.normalBlocks;
                      const orderedBlockIds = blockOrder[currentMode];
                      
                      if (currentBlocks.length === 0) {
                        return (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '100%',
                            }}
                          >
                            <Typography color="text.secondary">
                              No text blocks available for {audioSpeed} speed
                            </Typography>
                          </Box>
                        );
                      }

                      // Create a map for quick block lookup
                      const blocksMap = new Map(currentBlocks.map(block => [block.id, block]));
                      
                      // Order blocks according to blockOrder state
                      const orderedBlocks = orderedBlockIds
                        .map(id => blocksMap.get(id))
                        .filter((block): block is Block => block !== undefined);
                      
                      return (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={orderedBlockIds}
                            strategy={verticalListSortingStrategy}
                          >
                            {orderedBlocks.map((block, index) => (
                              <SortableBlockItem
                                key={block.id}
                                block={block}
                                index={index}
                                isExpanded={expandedBlocks[block.id] ?? true}
                                isPlaying={playingBlockId === block.id}
                                audioSpeed={audioSpeed}
                                editedSsml={editedSsml[block.id] || block.ssml || ''}
                                onToggle={() => handleToggleBlock(block.id)}
                                onPlay={() => handlePlayBlock(block.id)}
                                onSsmlChange={(value) => handleSsmlChange(block.id, value)}
                              />
                            ))}
                          </SortableContext>
                        </DndContext>
                      );
                    })()}
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

