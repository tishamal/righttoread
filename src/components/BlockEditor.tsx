import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  List,
  ListItem,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  Save as SaveIcon,
  Undo as UndoIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface Block {
  text: string;
  words: any[];
  bounding_boxes: number[][][];
  ssml: string;
  dialog: string;
  person_type: string | null;
}

interface BlockEditorProps {
  bookId: number;
  pageId: number;
  audioSpeed: 'normal' | 'slow';
  onSaveSuccess: () => void;
}

// AWS Polly Neural Voices for English
const AVAILABLE_VOICES = [
  { value: 'Joanna', label: 'Joanna (Female, US)' },
  { value: 'Matthew', label: 'Matthew (Male, US)' },
  { value: 'Ivy', label: 'Ivy (Female, Child, US)' },
  { value: 'Kendra', label: 'Kendra (Female, US)' },
  { value: 'Joey', label: 'Joey (Male, US)' },
  { value: 'Ruth', label: 'Ruth (Female, US)' },
  { value: 'Stephen', label: 'Stephen (Male, US)' },
  { value: 'Amy', label: 'Amy (Female, UK)' },
  { value: 'Emma', label: 'Emma (Female, UK)' },
  { value: 'Brian', label: 'Brian (Male, UK)' },
];

const BlockEditor: React.FC<BlockEditorProps> = ({
  bookId,
  pageId,
  audioSpeed,
  onSaveSuccess,
}) => {
  const [originalBlocks, setOriginalBlocks] = useState<Record<string, Block>>({});
  const [blocks, setBlocks] = useState<Record<string, Block>>({});
  const [blockOrder, setBlockOrder] = useState<string[]>([]);
  const [voiceChanges, setVoiceChanges] = useState<Record<string, string>>({});
  const [ssmlChanges, setSSMLChanges] = useState<Record<string, string>>({});
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModified, setIsModified] = useState(false);

  // Load blocks from backend
  useEffect(() => {
    loadBlocks();
  }, [bookId, pageId, audioSpeed]);

  const loadBlocks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.REACT_APP_TTS_SERVICE_URL}/api/digital-review/books/${bookId}/pages/${pageId}/blocks?audio_speed=${audioSpeed}`
      );

      if (!response.ok) {
        throw new Error('Failed to load blocks');
      }

      const data = await response.json();
      const blocksData = data.data.blocks;

      setOriginalBlocks(blocksData);
      setBlocks(blocksData);
      setBlockOrder(Object.keys(blocksData));
      setVoiceChanges({});
      setSSMLChanges({});
      setIsModified(false);

    } catch (err: any) {
      setError(err.message || 'Failed to load blocks');
    } finally {
      setLoading(false);
    }
  };

  // Extract voice from SSML
  const extractVoiceFromSSML = (ssml: string): string => {
    const match = ssml.match(/<voice name="([^"]+)">/);
    return match ? match[1] : 'Joanna';
  };

  // Handle drag and drop reordering
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newOrder = Array.from(blockOrder);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);

    setBlockOrder(newOrder);
    setIsModified(true);
  };

  // Handle voice change
  const handleVoiceChange = (blockId: string, newVoice: string) => {
    setVoiceChanges({
      ...voiceChanges,
      [blockId]: newVoice,
    });
    setIsModified(true);
  };

  // Handle SSML change
  const handleSSMLChange = (blockId: string, newSSML: string) => {
    setSSMLChanges({
      ...ssmlChanges,
      [blockId]: newSSML,
    });
    setIsModified(true);
  };

  // Reset to original
  const handleReset = () => {
    setBlocks(originalBlocks);
    setBlockOrder(Object.keys(originalBlocks));
    setVoiceChanges({});
    setSSMLChanges({});
    setSelectedBlock(null);
    setIsModified(false);
    setSuccess(null);
    setError(null);
  };

  // Save changes
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Step 1: Update blocks with Bedrock
      const userChanges: any = {};
      
      // Check if block order changed
      const originalOrder = Object.keys(originalBlocks);
      if (JSON.stringify(blockOrder) !== JSON.stringify(originalOrder)) {
        userChanges.reordered_block_ids = blockOrder;
      }

      // Add voice changes
      if (Object.keys(voiceChanges).length > 0) {
        userChanges.voice_changes = voiceChanges;
      }

      // Add SSML changes
      if (Object.keys(ssmlChanges).length > 0) {
        userChanges.ssml_changes = ssmlChanges;
      }

      if (Object.keys(userChanges).length === 0) {
        setError('No changes to save');
        setSaving(false);
        return;
      }

      // Call update blocks API
      const updateResponse = await fetch(
        `${process.env.REACT_APP_TTS_SERVICE_URL}/api/digital-review/books/${bookId}/pages/${pageId}/update-blocks`,
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

      // Step 2: Save changes (generate audio + upload to S3 + update DB)
      const saveResponse = await fetch(
        `${process.env.REACT_APP_TTS_SERVICE_URL}/api/digital-review/books/${bookId}/pages/${pageId}/save-changes`,
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

      setSuccess('Changes saved successfully! Audio files have been regenerated.');
      setIsModified(false);
      
      // Reload blocks to get fresh data
      await loadBlocks();
      
      // Notify parent component
      onSaveSuccess();

    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" gutterBottom>
          Edit Blocks - {audioSpeed === 'slow' ? 'Slow Reading' : 'Normal Speed'}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Drag blocks to reorder, change voices, or edit SSML content
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={handleSave}
            disabled={!isModified || saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<UndoIcon />}
            onClick={handleReset}
            disabled={!isModified || saving}
          >
            Reset
          </Button>
          {isModified && (
            <Chip label="Unsaved Changes" color="warning" size="small" />
          )}
        </Box>
      </Box>

      {/* Block List and Editor */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Block List with Drag & Drop */}
        <Box sx={{ width: '40%', borderRight: '1px solid #e0e0e0', overflow: 'auto', p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Blocks (Drag to reorder)
          </Typography>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="blocks">
              {(provided) => (
                <List {...provided.droppableProps} ref={provided.innerRef}>
                  {blockOrder.map((blockId, index) => {
                    const block = blocks[blockId];
                    const currentVoice = voiceChanges[blockId] || extractVoiceFromSSML(block.ssml);
                    const hasChanges = voiceChanges[blockId] || ssmlChanges[blockId];

                    return (
                      <Draggable key={blockId} draggableId={blockId} index={index}>
                        {(provided, snapshot) => (
                          <ListItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              mb: 1,
                              backgroundColor: selectedBlock === blockId ? '#e3f2fd' : snapshot.isDragging ? '#f5f5f5' : 'white',
                              border: selectedBlock === blockId ? '2px solid #1976d2' : '1px solid #e0e0e0',
                              borderRadius: 1,
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: '#f5f5f5' },
                            }}
                            onClick={() => setSelectedBlock(blockId)}
                          >
                            <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start', gap: 1 }}>
                              <Box {...provided.dragHandleProps} sx={{ mt: 1 }}>
                                <DragIcon color="action" />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  {blockId}
                                </Typography>
                                <Typography variant="body2" noWrap>
                                  {block.text}
                                </Typography>
                                <Box sx={{ mt: 0.5, display: 'flex', gap: 1 }}>
                                  <Chip label={currentVoice} size="small" color="primary" />
                                  {hasChanges && <Chip label="Modified" size="small" color="warning" />}
                                </Box>
                              </Box>
                            </Box>
                          </ListItem>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
        </Box>

        {/* Right: Block Editor */}
        <Box sx={{ width: '60%', overflow: 'auto', p: 2 }}>
          {selectedBlock ? (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Edit {selectedBlock}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Text Display */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Text Content
                </Typography>
                <Typography variant="body2" sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  {blocks[selectedBlock].text}
                </Typography>
              </Box>

              {/* Voice Selector */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Voice</InputLabel>
                <Select
                  value={voiceChanges[selectedBlock] || extractVoiceFromSSML(blocks[selectedBlock].ssml)}
                  onChange={(e: SelectChangeEvent) => handleVoiceChange(selectedBlock, e.target.value)}
                  label="Voice"
                >
                  {AVAILABLE_VOICES.map((voice) => (
                    <MenuItem key={voice.value} value={voice.value}>
                      {voice.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* SSML Editor */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  SSML Content
                </Typography>
                <TextField
                  multiline
                  rows={8}
                  fullWidth
                  value={ssmlChanges[selectedBlock] || blocks[selectedBlock].ssml}
                  onChange={(e) => handleSSMLChange(selectedBlock, e.target.value)}
                  placeholder="<speak><voice name='Joanna'>Your text here</voice></speak>"
                  sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Ensure SSML is valid and wrapped in &lt;speak&gt;&lt;voice&gt; tags
                </Typography>
              </Box>

              {/* Dialog Info */}
              <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>Dialog:</strong> {blocks[selectedBlock].dialog} <br />
                  <strong>Person Type:</strong> {blocks[selectedBlock].person_type || 'N/A'}
                </Typography>
              </Box>
            </Paper>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'text.secondary',
              }}
            >
              <Typography>Select a block to edit</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default BlockEditor;
