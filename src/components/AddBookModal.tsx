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
  isPublishedByNIE: string;
  author: string;
  yearOfPublished: string;
  description: string;
  pdfFile: File | null;
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
    isPublishedByNIE: '',
    author: '',
    yearOfPublished: '',
    description: '',
    pdfFile: null,
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
    if (!formData.name || !formData.grade || !formData.author) {
      alert('Please fill in all required fields.');
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
      isPublishedByNIE: '',
      author: '',
      yearOfPublished: '',
      description: '',
      pdfFile: null,
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
            Detail
          </Typography>

          {/* Name of the Book */}
          <Box>
            <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
              Name of the Book
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Create a Social Media Marketing Plan"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              sx={{ backgroundColor: '#f8f9fa' }}
            />
          </Box>

          {/* Grade */}
          <Box>
            <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
              Grade
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
                <MenuItem value="Grade 9">Grade 9</MenuItem>
                <MenuItem value="Grade 10">Grade 10</MenuItem>
                <MenuItem value="Grade 11">Grade 11</MenuItem>
                <MenuItem value="Grade 12">Grade 12</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Is the Book Published by NIE? */}
          <Box>
            <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
              Is the Book Published by NIE?
            </Typography>
            <FormControl fullWidth sx={{ backgroundColor: '#f8f9fa' }}>
              <Select
                value={formData.isPublishedByNIE}
                name="isPublishedByNIE"
                onChange={handleSelectChange}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return <em style={{ color: '#999' }}>Choose Yes/No</em>;
                  }
                  return selected;
                }}
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Author */}
          <Box>
            <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
              Author
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Write the Author of the Book"
              value={formData.author}
              onChange={(e) => handleInputChange('author', e.target.value)}
              sx={{ backgroundColor: '#f8f9fa' }}
            />
          </Box>

          {/* Year of Published */}
          <Box>
            <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
              Year of Published
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter the Year here"
              value={formData.yearOfPublished}
              onChange={(e) => handleInputChange('yearOfPublished', e.target.value)}
              sx={{ backgroundColor: '#f8f9fa' }}
            />
          </Box>

          {/* Description */}
          <Box>
            <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
              Description
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Develop a comprehensive social media marketing plan for a small business."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              sx={{ backgroundColor: '#f8f9fa' }}
            />
          </Box>

          {/* Upload Section */}
          <Box>
            <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
              Upload the Book
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
