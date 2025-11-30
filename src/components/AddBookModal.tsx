import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Paper,
  Stack,
  SelectChangeEvent,
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface AddBookModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (bookData: BookFormData) => void;
}

interface BookFormData {
  name: string;
  grade: string;
  pdfFile: File | null;
  startingPageNumber: number;
}

const UploadBox = styled(Paper)(({ theme }) => ({
  border: `2px dashed ${theme.palette.grey[300]}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(6),
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: theme.palette.grey[50],
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + '10',
  },
  '&.drag-over': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + '20',
  },
}));

const HiddenInput = styled('input')({
  display: 'none',
});

const AddBookModal: React.FC<AddBookModalProps> = ({ open, onClose, onSave }) => {
  const [formData, setFormData] = useState<BookFormData>({
    name: '',
    grade: '',
    pdfFile: null,
    startingPageNumber: 1,
  });

  const [dragOver, setDragOver] = useState(false);

  const handleInputChange = (field: keyof BookFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (file: File | null) => {
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({
        ...prev,
        pdfFile: file,
      }));
    } else if (file) {
      alert('Please upload a PDF file only.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileUpload(file);
  };

  const handleSave = () => {
    // Basic validation
    if (!formData.name || !formData.grade || !formData.pdfFile) {
      alert('Please fill in all required fields and upload a PDF file.');
      return;
    }

    onSave(formData);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      name: '',
      grade: '',
      pdfFile: null,
      startingPageNumber: 1,
    });
    setDragOver(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Add Book
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        <Stack spacing={3}>
          {/* Detail Section */}
          <Typography variant="h6" fontWeight="bold" color="text.primary">
            Book Details
          </Typography>

          {/* Name of the Book */}
          <Box>
            <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
              Name of the Book *
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter book name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              sx={{ backgroundColor: '#f8f9fa' }}
            />
          </Box>

          {/* Grade */}
          <Box>
            <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
              Grade *
            </Typography>
            <FormControl fullWidth sx={{ backgroundColor: '#f8f9fa' }}>
              <Select
                value={formData.grade}
                name="grade"
                onChange={handleSelectChange}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return <em style={{ color: '#999' }}>Choose grade</em>;
                  }
                  return selected;
                }}
              >
                <MenuItem value="Grade 3">Grade 3</MenuItem>
                <MenuItem value="Grade 4">Grade 4</MenuItem>
                <MenuItem value="Grade 5">Grade 5</MenuItem>
                <MenuItem value="Grade 6">Grade 6</MenuItem>
                <MenuItem value="Grade 7">Grade 7</MenuItem>
                <MenuItem value="Grade 8">Grade 8</MenuItem>
                <MenuItem value="Grade 9">Grade 9</MenuItem>
                <MenuItem value="Grade 10">Grade 10</MenuItem>
                <MenuItem value="Grade 11">Grade 11</MenuItem>
                <MenuItem value="Grade 12">Grade 12</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Starting Page Number */}
          <Box>
            <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
              Starting Page Number
            </Typography>
            <TextField
              fullWidth
              type="number"
              variant="outlined"
              placeholder="Enter starting page number (default: 1)"
              value={formData.startingPageNumber}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                setFormData(prev => ({ ...prev, startingPageNumber: Math.max(1, value) }));
              }}
              inputProps={{ min: 1 }}
              sx={{ backgroundColor: '#f8f9fa' }}
              helperText="The page number from which the book processing should start"
            />
          </Box>

          {/* Upload Section */}
          <Box>
            <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
              Upload the Book PDF *
            </Typography>
            
            <UploadBox
              className={dragOver ? 'drag-over' : ''}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('pdf-upload')?.click()}
            >
              <HiddenInput
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileInputChange}
              />
              
              {formData.pdfFile ? (
                <Box>
                  <PdfIcon sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    {formData.pdfFile.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    File size: {(formData.pdfFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({ ...prev, pdfFile: null }));
                    }}
                  >
                    Remove File
                  </Button>
                </Box>
              ) : (
                <Box>
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Click to upload or drag and drop
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    PDF files only (Max size: 50MB)
                  </Typography>
                </Box>
              )}
            </UploadBox>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{ mr: 2, textTransform: 'none', minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{ textTransform: 'none', minWidth: 100 }}
        >
          Save Book
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBookModal;
