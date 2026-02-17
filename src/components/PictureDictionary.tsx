import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Paper,
  CircularProgress,
  TextField,
  InputAdornment,
  Stack
} from '@mui/material';
import { AutoAwesome as MagicIcon, Image as ImageIcon, Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import GenerateImagesModal from './GenerateImagesModal';
import AddWordModal from './AddWordModal';
import { pictureDictionaryAPI } from '../services/api';

interface PictureDictionaryProps {
  onShowNotification: (message: string, severity: 'success' | 'error' | 'info') => void;
}

interface DictionaryItem {
  word: string;
  imageUrl: string;
}

const PictureDictionary: React.FC<PictureDictionaryProps> = ({ onShowNotification }) => {
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [addWordModalOpen, setAddWordModalOpen] = useState(false);
  const [items, setItems] = useState<DictionaryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDictionary = async () => {
    setLoading(true);
    try {
      const data = await pictureDictionaryAPI.getAll();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch picture dictionary:', error);
      onShowNotification('Failed to load dictionary images.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDictionary();
  }, []);

  const handleGenerateSuccess = (message: string) => {
    onShowNotification(message, 'success');
    // Refresh the list after a delay to allow for some generation to potentially complete
    // or just to refresh in case existing items were updated
    setTimeout(fetchDictionary, 2000);
  };

  const filteredItems = items.filter(item => 
    item.word.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box className="fade-in">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Picture Dictionary
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField 
            variant="outlined"
            size="small"
            placeholder="Search words..."
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
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              sx={{ textTransform: 'none' }}
              onClick={() => setAddWordModalOpen(true)}
            >
              Add New Word
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<MagicIcon />}
              sx={{ textTransform: 'none' }}
              onClick={() => setGenerateModalOpen(true)}
            >
              Generate Picture Dictionary
            </Button>
          </Stack>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredItems.length > 0 ? (
        <Grid container spacing={3}>
          {filteredItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}>
                <CardMedia
                  component="img"
                  height="250"
                  image={item.imageUrl}
                  alt={item.word}
                  sx={{ objectFit: 'contain', p: 2, borderRadius: 3, bgcolor: '#f8f9fa' }}
                />
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Typography variant="h5" component="div" fontWeight="bold" color="primary" sx={{ textTransform: 'capitalize' }}>
                    {item.word}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, bgcolor: 'background.default', border: '2px dashed #e0e0e0' }}>
          <ImageIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {searchQuery ? `No results found for "${searchQuery}"` : 'No picture dictionary entries found'}
          </Typography>
          {!searchQuery && (
            <>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Generate a picture dictionary from your uploaded books to see entries here.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setGenerateModalOpen(true)}
              >
                Get Started
              </Button>
            </>
          )}
        </Paper>
      )}

      <GenerateImagesModal
        open={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        onSuccess={handleGenerateSuccess}
      />

      <AddWordModal
        open={addWordModalOpen}
        onClose={() => setAddWordModalOpen(false)}
        onSuccess={handleGenerateSuccess}
      />
    </Box>
  );
};

export default PictureDictionary;
