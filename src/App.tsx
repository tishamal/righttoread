import React, { useState, useEffect } from 'react';
import './App.css';
import AddBookModal from './components/AddBookModal';
import Login from './components/Login';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import DigitalVersionReview from './components/DigitalVersionReview';
import PictureDictionary from './components/PictureDictionary';
import SchoolRegistration from './components/SchoolRegistration';
import UserManagement from './components/UserManagement';
import Profile from './components/Profile';
import GenerateDictionaryModal from './components/GenerateDictionaryModal';
import GenerateAudioLibraryModal from './components/GenerateAudioLibraryModal';
import { booksAPI, ttsAPI, analyticsAPI } from './services/api';
import { authAPI } from './services/authAPI';
import { OverviewStats, SchoolMetrics } from './types/analytics';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  InputBase,
  Avatar,
  Badge,
  Chip,
  Button,
  FormControl,
  Select,
  MenuItem,
  Stack,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountCircle as AccountIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  MenuBook as BookIcon,
  Equalizer as AnalyticsIcon,
  Audiotrack as AudioIcon,
  Collections as DictionaryIcon,
  School as SchoolIcon,
  ManageAccounts as ManageAccountsIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

interface Book {
  id: string;
  title: string;
  author: string;
  grade: string;
  subject: string;
  image: string;
  status: string;
  yearOfPublished?: string;
  description?: string;
  isPublishedByNIE?: boolean;
}

interface BookFormData {
  name: string;
  grade: string;
  pdfFile: File | null;
  startingPageNumber: number;
}

const drawerWidth = 240;

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const sampleBooks = [
  {
    id: '1',
    title: 'English Student Handbook - Grade 3',
    author: 'Ministry of Education Sri Lanka',
    grade: 'Grade 3',
    subject: 'English',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
    status: 'Available',
  },
  {
    id: '2',
    title: 'English Student Handbook - Grade 4',
    author: 'Ministry of Education Sri Lanka',
    grade: 'Grade 4',
    subject: 'English',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
    status: 'Available',
  },
  {
    id: '3',
    title: 'English Student Handbook - Grade 5',
    author: 'Ministry of Education Sri Lanka',
    grade: 'Grade 5',
    subject: 'English',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop',
    status: 'Available',
  },
  {
    id: '4',
    title: 'English Student Handbook - Grade 6',
    author: 'Ministry of Education Sri Lanka',
    grade: 'Grade 6',
    subject: 'English',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
    status: 'Limited',
  },
  {
    id: '5',
    title: 'English Student Handbook - Grade 7',
    author: 'Ministry of Education Sri Lanka',
    grade: 'Grade 7',
    subject: 'English',
    image: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=300&h=400&fit=crop',
    status: 'Available',
  },
  {
    id: '6',
    title: 'English Student Handbook - Grade 8',
    author: 'Ministry of Education Sri Lanka',
    grade: 'Grade 8',
    subject: 'English',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop',
    status: 'Available',
  },
  {
    id: '7',
    title: 'English Student Handbook - Grade 9',
    author: 'Ministry of Education Sri Lanka',
    grade: 'Grade 9',
    subject: 'English',
    image: 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=300&h=400&fit=crop',
    status: 'Available',
  },
  {
    id: '8',
    title: 'English Student Handbook - Grade 10',
    author: 'Ministry of Education Sri Lanka',
    grade: 'Grade 10',
    subject: 'English',
    image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=300&h=400&fit=crop',
    status: 'Limited',
  },
];

function App() {
  const [selectedGrade, setSelectedGrade] = useState('All Grades');
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('activePage') || 'Dashboard';
  });
  const [addBookModalOpen, setAddBookModalOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>(sampleBooks);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem('currentUser') || '';
  });
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [activeSchools, setActiveSchools] = useState<SchoolMetrics[]>([]);
  const [generateDictionaryModalOpen, setGenerateDictionaryModalOpen] = useState(false);
  const [generateAudioLibraryModalOpen, setGenerateAudioLibraryModalOpen] = useState(false);

  const navigationItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, id: 'Dashboard' },
    { text: 'Analytics', icon: <AnalyticsIcon />, id: 'Analytics' },
    { text: 'Digital Review', icon: <AudioIcon />, id: 'DigitalReview' },
    { text: 'Audio Library', icon: <AudioIcon />, id: 'AudioLibrary' },
    { text: 'Picture Dictionary', icon: <DictionaryIcon />, id: 'PictureDictionary' },
    { text: 'School Registration', icon: <SchoolIcon />, id: 'SchoolRegistration' },
    { text: 'User Management', icon: <ManageAccountsIcon />, id: 'UserManagement' },
    { text: 'Account', icon: <AccountIcon />, id: 'Account' },
  ];

  // Fetch books from API when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchBooks();
      fetchDashboardStats();
      // Set up auto-refresh for dashboard stats every 5 minutes
      const interval = setInterval(fetchDashboardStats, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchDashboardStats = async () => {
    try {
      const [stats, schools] = await Promise.all([
        analyticsAPI.getOverviewStats(),
        analyticsAPI.getSchoolsStats({ limit: 6, sortBy: 'active' })
      ]);
      setOverviewStats(stats);
      setActiveSchools(schools);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchBooks = async () => {
    try {
      const booksData = await booksAPI.getAll();
      
      // Transform backend book data to frontend Book interface
      const convertedBooks = booksData.map((book: any) => {
        // Format book name: "grade_3_english_book" -> "Grade 3 English Book"
        const formatBookName = (name: string) => {
          return name
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        };
        
        // Map processing status to UI status
        const getUIStatus = (processingStatus: string) => {
          switch (processingStatus) {
            case 'completed':
              return 'Available';
            case 'processing':
              return 'Limited';
            case 'pending':
            case 'failed':
              return 'Draft';
            default:
              return 'Draft';
          }
        };
        
        return {
          id: book.id.toString(),
          title: book.book_name ? formatBookName(book.book_name) : 'Untitled Book',
          author: 'Ministry of Education Sri Lanka',
          grade: `Grade ${book.grade}`,
          subject: 'English', // Default to English, can be enhanced later
          image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=300&h=400&fit=crop',
          status: getUIStatus(book.processing_status),
        };
      });
      
      setBooks(convertedBooks);
    } catch (error) {
      console.error('Failed to fetch books:', error);
      // Show empty state or keep existing books
      setBooks([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'Limited':
        return 'warning';
      case 'Out of Stock':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleAddBook = async (bookData: BookFormData) => {
    try {
      // Upload the PDF to TTS service
      if (bookData.pdfFile) {
        setUploading(true);
        
        // Initiate the TTS processing (fire and forget)
        ttsAPI.uploadBook(bookData.pdfFile, bookData.startingPageNumber)
          .then((ttsResult) => {
            console.log('TTS processing completed:', ttsResult);
            setUploadStatus({
              open: true,
              message: `Book "${bookData.name}" has been digitized successfully! ${ttsResult.total_pages_processed || 0} pages processed.`,
              severity: 'success',
            });
            
            // Refresh books list after processing completes
            fetchBooks();
          })
          .catch((ttsError) => {
            console.error('TTS processing failed:', ttsError);
            setUploadStatus({
              open: true,
              message: `Failed to digitize "${bookData.name}". Please check the PDF file and try again.`,
              severity: 'error',
            });
          });

        // Show immediate feedback and stop loading
        setTimeout(() => {
          setUploading(false);
          setUploadStatus({
            open: true,
            message: `Book "${bookData.name}" has been uploaded successfully! Digitization process started in the background. This may take several minutes depending on the book size.`,
            severity: 'success',
          });

          // Create a local book entry for immediate display
          const newBook: Book = {
            id: `temp-${Date.now()}`,
            title: bookData.name,
            author: 'Ministry of Education Sri Lanka',
            grade: bookData.grade,
            subject: 'English',
            image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop',
            status: 'Limited', // Show as Limited until processing completes
          };
          
          setBooks(prev => [...prev, newBook]);
          console.log('Book upload initiated:', newBook);
        }, 800); // Small delay to show the upload started

      } else {
        setUploadStatus({
          open: true,
          message: 'Please upload a PDF file.',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error adding book:', error);
      setUploadStatus({
        open: true,
        message: 'Failed to upload book. Please try again.',
        severity: 'error',
      });
      setUploading(false);
    }
  };

  const handleLogin = (username: string) => {
    setIsAuthenticated(true);
    setCurrentUser(username);
    setCurrentPage('Dashboard');
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentUser', username);
    localStorage.setItem('activePage', 'Dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser('');
    setCurrentPage('Dashboard');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    authAPI.clearTokens();
  };

  const filteredBooks = selectedGrade === 'All Grades' 
    ? books 
    : books.filter(book => book.grade === selectedGrade);

  // Calculate statistics
  const totalBooks = books.length;
  const availableBooks = books.filter(book => book.status === 'Available').length;
  const limitedBooks = books.filter(book => book.status === 'Limited').length;
  const outOfStockBooks = books.filter(book => book.status === 'Out of Stock').length;

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'Analytics':
        return <AnalyticsDashboard />;
      case 'DigitalReview':
        return <DigitalVersionReview />;
      case 'AudioLibrary':
        return (
          <Box className="fade-in">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Audio Library
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<BookIcon />}
                  sx={{ textTransform: 'none' }}
                  onClick={() => setGenerateDictionaryModalOpen(true)}
                >
                  Generate Dictionary
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AudioIcon />}
                  sx={{ textTransform: 'none' }}
                  onClick={() => setGenerateAudioLibraryModalOpen(true)}
                >
                  Generate Audio Library
                </Button>
              </Box>
            </Box>

            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom>
                Audio Content
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Manage and generate audio library assets from digitized books in this section.
              </Typography>
            </Paper>
          </Box>
        );
      case 'PictureDictionary':
        return (
          <PictureDictionary
            onShowNotification={(message, severity) => setUploadStatus({ open: true, message, severity })}
          />
        );
      case 'SchoolRegistration':
        return <SchoolRegistration />;
      case 'UserManagement':
        return <UserManagement />;
      case 'Account':
        return <Profile currentUser={currentUser} />;
      case 'Dashboard':
      default:
        return (
          <Box className="fade-in">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Dashboard
              </Typography>
              
              {/* Grade Selector */}
              <FormControl sx={{ minWidth: 200, mb: 3 }}>
                <Select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  variant="outlined"
                  size="small"
                >
                  <MenuItem value="All Grades">All Grades</MenuItem>
                  <MenuItem value="Grade 3">Grade 3</MenuItem>
                  <MenuItem value="Grade 4">Grade 4</MenuItem>
                  <MenuItem value="Grade 5">Grade 5</MenuItem>
                  <MenuItem value="Grade 6">Grade 6</MenuItem>
                  <MenuItem value="Grade 7">Grade 7</MenuItem>
                  <MenuItem value="Grade 8">Grade 8</MenuItem>
                  <MenuItem value="Grade 9">Grade 9</MenuItem>
                  <MenuItem value="Grade 10">Grade 10</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={6}>
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1), borderRadius: 4 }}>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {totalBooks}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Books
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1), borderRadius: 4 }}>
                  <Typography variant="h4" fontWeight="bold" color="secondary.main">
                    {overviewStats?.totalActiveSchools || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Schools Using
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Schools Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Schools Using Right to Read
              </Typography>
              <Grid container spacing={2}>
                {activeSchools.length > 0 ? (
                  activeSchools.map((school, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
                        <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                          {school.schoolName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {school.schoolName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {school.isActive ? 'Active Now' : `Last active: ${new Date(school.lastSyncTime).toLocaleDateString()}`}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography color="textSecondary" align="center">
                      No active schools data available yet.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Actions Bar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                Textbook Library
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  Filter
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ textTransform: 'none' }}
                  onClick={() => setAddBookModalOpen(true)}
                >
                  Digitize New Book
                </Button>
              </Stack>
            </Box>

            {/* Books Grid */}
            <Grid container spacing={3} className="animate-child">
              {filteredBooks.map((book) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={book.image}
                      alt={book.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h2" gutterBottom noWrap>
                        {book.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {book.author}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Chip
                          label={book.grade}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={book.status}
                          size="small"
                          color={getStatusColor(book.status) as any}
                          variant="filled"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: '#1976d2' }}>
            Right to Read Admin Dashboard
          </Typography>
          
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase placeholder="Search…" inputProps={{ 'aria-label': 'search' }} />
          </Search>
          
          <IconButton size="large" color="inherit">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <Tooltip title={`Logout (${currentUser})`}>
            <IconButton size="large" edge="end" color="inherit" onClick={handleLogout}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
                {currentUser.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <BookIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            Right to Read
          </Typography>
        </Box>
        
        <List>
          {navigationItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                selected={currentPage === item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  localStorage.setItem('activePage', item.id);
                }}
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                  transition: 'background-color 0.2s',
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        
        <Container maxWidth="xl">
          {renderContent()}
        </Container>

        {/* Add Book Modal */}
        <AddBookModal
          open={addBookModalOpen}
          onClose={() => setAddBookModalOpen(false)}
          onSave={handleAddBook}
        />

        {/* Generate Dictionary Modal */}
        <GenerateDictionaryModal
          open={generateDictionaryModalOpen}
          onClose={() => setGenerateDictionaryModalOpen(false)}
          onShowNotification={(message, severity) =>
            setUploadStatus({ open: true, message, severity: severity as 'success' | 'error' | 'info' })
          }
        />

        {/* Generate Audio Library Modal */}
        <GenerateAudioLibraryModal
          open={generateAudioLibraryModalOpen}
          onClose={() => setGenerateAudioLibraryModalOpen(false)}
          onShowNotification={(message, severity) =>
            setUploadStatus({ open: true, message, severity: severity as 'success' | 'error' | 'info' })
          }
        />

        {/* Upload Status Snackbar */}
        <Snackbar
          open={uploadStatus.open}
          autoHideDuration={6000}
          onClose={() => setUploadStatus(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setUploadStatus(prev => ({ ...prev, open: false }))}
            severity={uploadStatus.severity}
            sx={{ width: '100%' }}
          >
            {uploadStatus.message}
          </Alert>
        </Snackbar>

        {/* Loading Overlay */}
        {uploading && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
          >
            <CircularProgress size={60} sx={{ color: 'white' }} />
            <Typography variant="h6" sx={{ color: 'white', mt: 2 }}>
              Processing book upload...
            </Typography>
            <Typography variant="body2" sx={{ color: 'white', mt: 1 }}>
              This may take a few minutes depending on the book size
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default App;
