import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  CircularProgress,
  Paper,
  Divider,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { audioLibraryAPI } from '../services/api';

interface AudioLibraryListProps {
  onShowNotification: (message: string, severity: 'success' | 'error' | 'info') => void;
}

interface AudioItem {
  word: string;
  audioUrl: string;
  timestamp: string;
}

const AudioLibraryList: React.FC<AudioLibraryListProps> = ({ onShowNotification }) => {
  const [items, setItems] = useState<AudioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [playingWord, setPlayingWord] = useState<string | null>(null);
  const [loadingWord, setLoadingWord] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const data = await audioLibraryAPI.getAll();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch audio library:', error);
      onShowNotification('Failed to load audio library.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    audioLibraryAPI.invalidateCache();
    fetchLibrary();
  };

  useEffect(() => {
    fetchLibrary();
    // Stop audio when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayPause = (item: AudioItem) => {
    // If this word is already playing, pause it
    if (playingWord === item.word) {
      audioRef.current?.pause();
      setPlayingWord(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingWord(null);

    // Start loading the new word
    setLoadingWord(item.word);

    const audio = new Audio(item.audioUrl);
    audioRef.current = audio;

    audio.oncanplaythrough = () => {
      setLoadingWord(null);
      setPlayingWord(item.word);
      audio.play().catch((err) => {
        console.error('Audio play error:', err);
        setPlayingWord(null);
        setLoadingWord(null);
        onShowNotification('Failed to play audio.', 'error');
      });
    };

    audio.onended = () => {
      setPlayingWord(null);
      audioRef.current = null;
    };

    audio.onerror = () => {
      setLoadingWord(null);
      setPlayingWord(null);
      audioRef.current = null;
      onShowNotification(`Failed to load audio for "${item.word}".`, 'error');
    };

    audio.load();
  };

  const filteredItems = items.filter((item) =>
    item.word.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      {/* Search + stats bar */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="textSecondary">
            {items.length} word{items.length !== 1 ? 's' : ''} in library
            {searchQuery && filteredItems.length !== items.length
              ? ` · ${filteredItems.length} matching`
              : ''}
          </Typography>
          <Tooltip title="Refresh library">
            <span>
              <IconButton size="small" onClick={handleRefresh} disabled={loading}>
                {loading ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        <TextField
          variant="outlined"
          size="small"
          placeholder="Search words…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 250 }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredItems.length > 0 ? (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <List disablePadding>
            {filteredItems.map((item, index) => {
              const isPlaying = playingWord === item.word;
              const isLoading = loadingWord === item.word;

              return (
                <React.Fragment key={item.word}>
                  {index > 0 && <Divider />}
                  <ListItem
                    sx={{
                      py: 1.5,
                      px: 2,
                      bgcolor: isPlaying ? 'primary.50' : 'transparent',
                      transition: 'background-color 0.2s',
                      '&:hover': { bgcolor: isPlaying ? 'primary.50' : 'action.hover' },
                    }}
                    secondaryAction={
                      <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
                        <span>
                          <IconButton
                            edge="end"
                            onClick={() => handlePlayPause(item)}
                            color={isPlaying ? 'primary' : 'default'}
                            disabled={isLoading && loadingWord !== item.word}
                            size="small"
                          >
                            {isLoading ? (
                              <CircularProgress size={20} />
                            ) : isPlaying ? (
                              <PauseIcon />
                            ) : (
                              <PlayArrowIcon />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography
                          variant="body1"
                          fontWeight={isPlaying ? 600 : 400}
                          color={isPlaying ? 'primary.main' : 'text.primary'}
                          sx={{ textTransform: 'capitalize' }}
                        >
                          {item.word}
                        </Typography>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        </Paper>
      ) : (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 4,
            bgcolor: 'background.default',
            border: '2px dashed #e0e0e0',
          }}
        >
          <VolumeUpIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {searchQuery
              ? `No results found for "${searchQuery}"`
              : 'No audio library entries found'}
          </Typography>
          {!searchQuery && (
            <Typography variant="body2" color="textSecondary">
              Use "Generate Audio Library" to create spelling &amp; pronunciation audio for a book's
              dictionary words.
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default AudioLibraryList;
