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
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Refresh,
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

// Amazon Polly Neural Voices - Matching backend configuration
const AVAILABLE_VOICES = [
  { id: 'Justin', name: 'Justin - Young Boy', personType: 'young boy' },
  { id: 'Ivy', name: 'Ivy - Young Girl', personType: 'young girl' },
  { id: 'Joey', name: 'Joey - Middle Aged Man', personType: 'middle aged man' },
  { id: 'Ruth', name: 'Ruth - Middle Aged Woman', personType: 'middle aged woman' },
  { id: 'Matthew', name: 'Matthew - Old Man', personType: 'old man' },
  { id: 'Kimberly', name: 'Kimberly - Old Woman', personType: 'old woman' },
  { id: 'Salli', name: 'Salli - Narrator', personType: 'narrator' },
];

interface Block {
  id: string;  // Unique ID for React (includes normal/slow suffix)
  audioBlockId?: string;  // ID used for audio file lookup (without suffix)
  text: string;
  ssml?: string;
  voiceId?: string;
  blockNumber?: number;
  originalPosition?: number;  // Track original position for display
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
  id: number;
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
  index: number;  // Display position (0, 1, 2, 3...)
  isExpanded: boolean;
  isPlaying: boolean;
  audioSpeed: 'normal' | 'slow';
  editedSsml: string;
  voiceId: string;
  onToggle: () => void;
  onPlay: () => void;
  onSsmlChange: (value: string) => void;
  onVoiceChange: (value: string) => void;
}

const SortableBlockItem: React.FC<SortableBlockItemProps> = ({
  block,
  index,  // This is the display position after reordering
  isExpanded,
  isPlaying,
  audioSpeed,
  editedSsml,
  voiceId,
  onToggle,
  onPlay,
  onSsmlChange,
  onVoiceChange,
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
            label={`Block ${index}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          {block.originalPosition !== undefined && block.originalPosition !== index && (
            <Tooltip title={`Original block number from file: ${block.originalPosition}`}>
              <Chip
                label={`Original: ${block.originalPosition}`}
                size="small"
                color="warning"
                variant="filled"
                sx={{ fontSize: '0.7rem' }}
              />
            </Tooltip>
          )}
          
          {/* Voice Selector as compact dropdown */}
          <Select
            value={voiceId || 'Ruth'}
            onChange={(e) => {
              e.stopPropagation();
              onVoiceChange(e.target.value);
            }}
            size="small"
            variant="outlined"
            onClick={(e) => e.stopPropagation()}
            sx={{
              minWidth: 140,
              height: 28,
              fontSize: '0.8125rem',
              '& .MuiSelect-select': {
                py: 0.5,
                px: 1,
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'secondary.main',
              },
              bgcolor: 'background.paper',
            }}
          >
            {AVAILABLE_VOICES.map((voice) => (
              <MenuItem key={voice.id} value={voice.id} sx={{ fontSize: '0.875rem' }}>
                {voice.name}
              </MenuItem>
            ))}
          </Select>
          
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
  const [voiceIds, setVoiceIds] = useState<Record<string, string>>({});
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
  
  // Approval dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');

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
      const fetchBlocksFromUrl = async (
        blocksKey: string | null, 
        blockType: 'normal' | 'slow'
      ): Promise<Block[]> => {
        if (!blocksKey || !urls[blocksKey]) {
          return [];
        }

        try {
          console.log('Fetching blocks from:', blocksKey, 'Type:', blockType);
          // Use proxy endpoint to avoid CORS issues
          // Fallback to /api if env var is missing (for hosted environment behind Nginx)
          const baseUrl = process.env.REACT_APP_TTS_SERVICE_URL || '/api';
          const proxyUrl = `${baseUrl}/s3-proxy?s3_key=${encodeURIComponent(blocksKey)}`;
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
            const parsedBlockNumber = parseInt(blockNumber);
            // Create unique ID for this block including the type (normal/slow)
            // This ensures normal and slow blocks have different IDs
            const blockId = `block_${page.page_number}_${blockNumber}_${blockType}`;
            // For audio lookup, use simple block number to match database block_id format
            // Database stores block_id as just the number (e.g., "5" not "block_0_5")
            const audioBlockId = blockNumber;
            
            return {
              id: blockId,  // Unique ID for React and state management
              audioBlockId,  // Simple block number for audio lookups (matches DB)
              text: block.text || block.content || '',
              ssml: block.ssml || block.text || '',
              voiceId: block.voice_id || 'Ruth',
              blockNumber: parsedBlockNumber,
              originalPosition: parsedBlockNumber,  // Store original position from file
            };
          });
          
          console.log('Parsed blocks from', blocksKey, ':', blocks.map(b => ({ 
            id: b.id, 
            audioBlockId: b.audioBlockId,
            originalPosition: b.originalPosition,
            text: b.text.substring(0, 50),
            ssml: b.ssml?.substring(0, 50)
          })));
          return blocks;
        } catch (err) {
          console.error('Error fetching blocks from', blocksKey, ':', err);
          return [];
        }
      };

      // Fetch BOTH normal and slow blocks
      const [normalBlocks, slowBlocks] = await Promise.all([
        fetchBlocksFromUrl(page.blocks_s3_key, 'normal'),
        fetchBlocksFromUrl(page.slow_blocks_s3_key, 'slow'),
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
        normalBlocksSample: normalBlocks.slice(0, 2).map(b => ({
          id: b.id,
          text: b.text.substring(0, 50),
          ssml: b.ssml?.substring(0, 50)
        })),
        slowBlocksSample: slowBlocks.slice(0, 2).map(b => ({
          id: b.id,
          text: b.text.substring(0, 50),
          ssml: b.ssml?.substring(0, 50)
        })),
      });

      // Initialize SSML edit state for BOTH block sets - use block.id as key
      const ssmlState: Record<string, string> = {};
      const voiceState: Record<string, string> = {};
      normalBlocks.forEach(block => {
        ssmlState[block.id] = block.ssml || block.text;
        voiceState[block.id] = block.voiceId || 'Ruth';
      });
      slowBlocks.forEach(block => {
        ssmlState[block.id] = block.ssml || block.text;
        voiceState[block.id] = block.voiceId || 'Ruth';
      });
      setEditedSsml(ssmlState);
      setVoiceIds(voiceState);
      
      console.log('SSML state initialized:', {
        normalBlocksSsml: normalBlocks.slice(0, 2).map(b => ({
          blockId: b.id,
          ssml: ssmlState[b.id]?.substring(0, 50),
          voiceId: voiceState[b.id]
        })),
        slowBlocksSsml: slowBlocks.slice(0, 2).map(b => ({
          blockId: b.id,
          ssml: ssmlState[b.id]?.substring(0, 50),
          voiceId: voiceState[b.id]
        })),
      });

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

  const handlePlayBlock = (blockId: string, audioBlockId?: string) => {
    if (playingBlockId === blockId) {
      setPlayingBlockId(null);
    } else {
      setPlayingBlockId(blockId);
      
      // Use audioBlockId for audio lookup if provided, otherwise fall back to blockId
      const lookupId = audioBlockId || blockId;
      const audioKey = `${lookupId}_${audioSpeed}`;
      const audioUrl = currentPageData.audioUrls[audioKey];
      
      console.log('Attempting to play audio:', {
        blockId,
        audioBlockId,
        lookupId,
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

  const handleVoiceChange = (blockId: string, newVoiceId: string) => {
    setVoiceIds(prev => ({
      ...prev,
      [blockId]: newVoiceId,
    }));
    console.log(`Voice changed for block ${blockId}: ${newVoiceId}`);
    setSnackbar({
      open: true,
      message: `Voice updated to ${newVoiceId}. Note: Audio will need to be regenerated for this change to take effect.`,
      severity: 'info',
    });
  };

  const logAllBlockDetails = () => {
    const currentBlocks = audioSpeed === 'slow' ? currentPageData.slowBlocks : currentPageData.normalBlocks;
    const currentOrder = audioSpeed === 'slow' ? blockOrder.slow : blockOrder.normal;
    
    // Map blocks in the current order
    const orderedBlocks = currentOrder.map((blockId, index) => {
      const block = currentBlocks.find(b => b.id === blockId);
      if (!block) return null;
      
      return {
        blockNumber: index,  // Current position (not original)
        originalBlockNumber: block.originalPosition,  // Original position from file
        ssml: editedSsml[block.id] || block.ssml || '',
        voiceId: voiceIds[block.id] || block.voiceId || 'Ruth',
        text: block.text,
      };
    }).filter(b => b !== null);

    console.log('=== ALL BLOCK DETAILS (JSON) ===');
    console.log(JSON.stringify({
      audioSpeed: audioSpeed,
      pageNumber: bookDetails?.pages[currentPageIndex]?.page_number || currentPageIndex + 1,
      totalBlocks: orderedBlocks.length,
      blocks: orderedBlocks
    }, null, 2));
    
    return orderedBlocks;
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

      console.log('Block reordered:', {
        movedBlock: active.id,
        fromPosition: oldIndex,
        toPosition: newIndex,
        newOrder: newOrder.map((id, idx) => `Position ${idx}: ${id}`)
      });
      
      setSnackbar({
        open: true,
        message: `Block moved from position ${oldIndex} to position ${newIndex}. Blocks renumbered in ascending order!`,
        severity: 'info',
      });
    }
  };

  const handleApproveBook = async () => {
    if (!selectedBook) return;

    try {
      await ttsAPI.updateReviewStatus(selectedBook.id, 'approved', approvalNotes);
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
      
      // Clear selection and reset approval state
      setSelectedBook(null);
      setBookDetails(null);
      setReviewerNotes('');
      setApproveDialogOpen(false);
      setApprovalNotes('');
    } catch (error) {
      console.error('Error approving book:', error);
      setSnackbar({
        open: true,
        message: 'Failed to approve book',
        severity: 'error',
      });
    }
  };

  const handleRegeneratePage = async () => {
    if (!selectedBook || !bookDetails) return;

    const currentPage = bookDetails.pages[currentPageIndex];
    if (!currentPage) return;

    try {
      setLoadingPage(true);

      // Step 1: Get current blocks from S3
      const blocksResponse = await fetch(
        `${process.env.REACT_APP_TTS_SERVICE_URL}/digital-review/books/${selectedBook.id}/pages/${currentPage.id}/blocks?audio_speed=${audioSpeed}`
      );

      if (!blocksResponse.ok) {
        throw new Error('Failed to load current blocks');
      }

      const blocksData = await blocksResponse.json();
      const originalBlocks = blocksData.data.blocks;

      // Step 2: Collect user changes
      const currentBlocks = audioSpeed === 'slow' ? currentPageData.slowBlocks : currentPageData.normalBlocks;
      const currentOrder = audioSpeed === 'slow' ? blockOrder.slow : blockOrder.normal;

      const userChanges: any = {};

      // Check for block reordering
      const reorderedBlockIds = currentOrder.map((blockId) => {
        const block = currentBlocks.find(b => b.id === blockId);
        return block?.audioBlockId || blockId.replace('_normal', '').replace('_slow', '');
      });

      const originalBlockIds = Object.keys(originalBlocks);
      if (JSON.stringify(reorderedBlockIds) !== JSON.stringify(originalBlockIds)) {
        userChanges.reordered_block_ids = reorderedBlockIds;
      }

      // Collect voice changes
      const voiceChanges: Record<string, string> = {};
      currentOrder.forEach((blockId) => {
        const block = currentBlocks.find(b => b.id === blockId);
        const audioBlockId = block?.audioBlockId || blockId.replace('_normal', '').replace('_slow', '');
        if (block && voiceIds[blockId] && voiceIds[blockId] !== block.voiceId) {
          voiceChanges[audioBlockId] = voiceIds[blockId];
        }
      });

      if (Object.keys(voiceChanges).length > 0) {
        userChanges.voice_changes = voiceChanges;
      }

      // Collect SSML changes
      const ssmlChanges: Record<string, string> = {};
      currentOrder.forEach((blockId) => {
        const block = currentBlocks.find(b => b.id === blockId);
        const audioBlockId = block?.audioBlockId || blockId.replace('_normal', '').replace('_slow', '');
        if (block && editedSsml[blockId] && editedSsml[blockId] !== block.ssml) {
          ssmlChanges[audioBlockId] = editedSsml[blockId];
        }
      });

      if (Object.keys(ssmlChanges).length > 0) {
        userChanges.ssml_changes = ssmlChanges;
      }

      if (Object.keys(userChanges).length === 0) {
        setSnackbar({
          open: true,
          message: 'No changes to save',
          severity: 'info',
        });
        setLoadingPage(false);
        return;
      }

      console.log('Updating page with changes:', userChanges);

      // Step 3: Update blocks with Bedrock
      const updateResponse = await fetch(
        `${process.env.REACT_APP_TTS_SERVICE_URL}/digital-review/books/${selectedBook.id}/pages/${currentPage.id}/update-blocks`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            original_blocks: originalBlocks,
            user_changes: userChanges,
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.detail || 'Failed to update blocks');
      }

      const updateData = await updateResponse.json();
      const updatedBlocks = updateData.data.updated_blocks;

      // Step 4: Save changes (generate audio + upload to S3 + update DB)
      const saveResponse = await fetch(
        `${process.env.REACT_APP_TTS_SERVICE_URL}/digital-review/books/${selectedBook.id}/pages/${currentPage.id}/save-changes`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            updated_blocks: updatedBlocks,
            audio_speed: audioSpeed,
            version_notes: `Updated via digital review: ${Object.keys(userChanges).join(', ')}`,
          }),
        }
      );

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.detail || 'Failed to save changes');
      }

      setSnackbar({
        open: true,
        message: `Page ${currentPage.page_number} updated successfully! Audio files regenerated.`,
        severity: 'success',
      });

      // Reload page data to reflect changes
      await loadPageData(currentPageIndex);

    } catch (error) {
      console.error('Error updating page:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update page',
        severity: 'error',
      });
    } finally {
      setLoadingPage(false);
    }
  };

  const handleOpenApproveDialog = () => {
    setApproveDialogOpen(true);
  };

  const handleCloseApproveDialog = () => {
    setApproveDialogOpen(false);
    setApprovalNotes('');
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
                  variant="contained"
                  size="small"
                  startIcon={<CheckCircle />}
                  onClick={handleOpenApproveDialog}
                  disabled={!bookDetails}
                  color="success"
                >
                  Approve Book
                </Button>
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
                                voiceId={voiceIds[block.id] || block.voiceId || 'Ruth'}
                                onToggle={() => handleToggleBlock(block.id)}
                                onPlay={() => handlePlayBlock(block.id, block.audioBlockId)}
                                onSsmlChange={(value) => handleSsmlChange(block.id, value)}
                                onVoiceChange={(value) => handleVoiceChange(block.id, value)}
                              />
                            ))}
                          </SortableContext>
                        </DndContext>
                      );
                    })()}
                  </Box>

                  {/* Page Action Buttons */}
                  <Box
                    sx={{
                      p: 2,
                      borderTop: 1,
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      display: 'flex',
                      gap: 2,
                      justifyContent: 'space-between',
                    }}
                  >
                    <Button
                      variant="outlined"
                      color="info"
                      onClick={() => {
                        logAllBlockDetails();
                        setSnackbar({
                          open: true,
                          message: 'Block details logged to console (F12)',
                          severity: 'info',
                        });
                      }}
                    >
                      Log Blocks to Console
                    </Button>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => {
                          setSnackbar({
                            open: true,
                            message: `Page ${bookDetails?.pages[currentPageIndex]?.page_number} approved`,
                            severity: 'success',
                          });
                        }}
                      >
                        Approve Page
                      </Button>
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<Refresh />}
                        onClick={handleRegeneratePage}
                        disabled={loadingPage}
                      >
                        {loadingPage ? 'Updating...' : 'Update & Save Page'}
                      </Button>
                    </Box>
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

      {/* Approve Book Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={handleCloseApproveDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Book</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You are about to approve this book. Please add any final notes or comments below.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Approval Notes (Optional)"
            placeholder="Add any final notes or comments about this book approval..."
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseApproveDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleApproveBook}
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
          >
            Confirm Approval
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DigitalVersionReview;

