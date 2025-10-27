import React, { useState, useEffect } from 'react';
import './App.css';
import AddBookModal from './components/AddBookModal';
import Login from './components/Login';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import DigitalVersionReview from './components/DigitalVersionReview';
import { booksAPI, analyticsAPI } from './services/api';
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
  isPublishedByNIE: string;
  author: string;
  yearOfPublished: string;
  description: string;
  pdfFile: File | null;
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
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const [addBookModalOpen, setAddBookModalOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>(sampleBooks);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');

  const navigationItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, id: 'Dashboard' },
    { text: 'Analytics', icon: <AnalyticsIcon />, id: 'Analytics' },
    { text: 'Digital Review', icon: <AudioIcon />, id: 'DigitalReview' },
    { text: 'Account', icon: <AccountIcon />, id: 'Account' },
    { text: 'Settings', icon: <SettingsIcon />, id: 'Settings' },
  ];

  // Fetch books from API when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchBooks();
    }
  }, [isAuthenticated]);

  const fetchBooks = async () => {
    try {
      const booksData = await booksAPI.getAll();
      // Convert API books to match frontend Book interface
      const convertedBooks = booksData.map((book: any) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        grade: book.grade,
        subject: book.subject,
        image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=300&h=400&fit=crop', // Default image
        status: book.status === 'published' ? 'Available' : book.status === 'approved' ? 'Limited' : 'Draft',
      }));
      setBooks(convertedBooks);
    } catch (error) {
      console.error('Failed to fetch books:', error);
      // Fall back to sample data if API fails
      setBooks(sampleBooks);
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
      const newBookData = {
        title: bookData.name,
        author: bookData.author,
        grade: bookData.grade,
        subject: 'Custom',
        description: bookData.description,
        published_by_nie: bookData.isPublishedByNIE === 'true',
        year_published: parseInt(bookData.yearOfPublished),
        status: 'draft' as const,
      };

      const apiBook = await booksAPI.create(newBookData);
      
      // Convert API book to local Book type
      const newBook: Book = {
        id: apiBook.id,
        title: apiBook.title,
        author: apiBook.author,
        grade: apiBook.grade,
        subject: apiBook.subject,
        image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop',
        status: 'Available',
        yearOfPublished: bookData.yearOfPublished,
        description: apiBook.description,
        isPublishedByNIE: apiBook.published_by_nie,
      };
      
      setBooks(prev => [...prev, newBook]);
      console.log('New book added:', newBook);
      console.log('PDF file:', bookData.pdfFile);
    } catch (error) {
      console.error('Error adding book:', error);
      // Fallback: add to local state
      const newBook: Book = {
        id: (books.length + 1).toString(),
        title: bookData.name,
        author: bookData.author,
        grade: bookData.grade,
        subject: 'Custom',
        image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop',
        status: 'Available',
        yearOfPublished: bookData.yearOfPublished,
        description: bookData.description,
        isPublishedByNIE: bookData.isPublishedByNIE === 'true',
      };
      setBooks(prev => [...prev, newBook]);
    }
  };

  const handleLogin = (email: string, password: string) => {
    // Simple authentication - in a real app, this would call an API
    if (email && password) {
      setIsAuthenticated(true);
      setCurrentUser(email);
      console.log('User logged in:', email);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser('');
    setCurrentPage('Dashboard');
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
      case 'Dashboard':
      default:
        return (
          <>
            <Box sx={{ mb: 4 }}>
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
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {totalBooks}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Books
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f3e5f5' }}>
                  <Typography variant="h4" fontWeight="bold" color="secondary.main">
                    24
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
                {['Colombo High School', 'Royal College Colombo', 'Ananda College', 
                  'St. Thomas\' College', 'Wesley College', 'Nalanda College'].map((school, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                        {school.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {school}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Active since 2024
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
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
                  Create Book
                </Button>
              </Stack>
            </Box>

            {/* Books Grid */}
            <Grid container spacing={3}>
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
          </>
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
          backgroundColor: 'white',
          color: 'black',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
            backgroundColor: '#1976d2',
            color: 'white',
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
                onClick={() => setCurrentPage(item.id)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
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
          bgcolor: '#f5f5f5',
          p: 3,
          minHeight: '100vh',
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
      </Box>
    </Box>
  );
}

export default App;
