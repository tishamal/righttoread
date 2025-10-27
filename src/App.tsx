import React, { useState } from 'react';
import './App.css';
import AddBookModal from './components/AddBookModal';
import Login from './components/Login';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import DigitalVersionReview from './components/DigitalVersionReview';
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
  id: number;
  title: string;
  author: string;
  grade: string;
  subject: string;
  image: string;
  status: string;
  yearOfPublished?: string;
  description?: string;
  isPublishedByNIE?: string;
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
    id: 1,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    grade: 'Grade 11',
    subject: 'English',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
    status: 'Available',
  },
  {
    id: 2,
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    grade: 'Grade 10',
    subject: 'English',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
    status: 'Limited',
  },
  {
    id: 3,
    title: '1984',
    author: 'George Orwell',
    grade: 'Grade 12',
    subject: 'English',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop',
    status: 'Available',
  },
  {
    id: 4,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    grade: 'Grade 11',
    subject: 'English',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
    status: 'Out of Stock',
  },
  {
    id: 5,
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    grade: 'Grade 10',
    subject: 'English',
    image: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=300&h=400&fit=crop',
    status: 'Available',
  },
  {
    id: 6,
    title: 'Lord of the Flies',
    author: 'William Golding',
    grade: 'Grade 9',
    subject: 'English',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop',
    status: 'Available',
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

  const handleAddBook = (bookData: BookFormData) => {
    const newBook: Book = {
      id: books.length + 1,
      title: bookData.name,
      author: bookData.author,
      grade: bookData.grade,
      subject: 'Custom', // Default subject for new books
      image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop', // Default image
      status: 'Available', // Default status
      yearOfPublished: bookData.yearOfPublished,
      description: bookData.description,
      isPublishedByNIE: bookData.isPublishedByNIE,
    };

    setBooks(prev => [...prev, newBook]);
    console.log('New book added:', newBook);
    console.log('PDF file:', bookData.pdfFile);
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
                  <MenuItem value="Grade 9">Grade 9</MenuItem>
                  <MenuItem value="Grade 10">Grade 10</MenuItem>
                  <MenuItem value="Grade 11">Grade 11</MenuItem>
                  <MenuItem value="Grade 12">Grade 12</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {totalBooks}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Books
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#e8f5e8' }}>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {availableBooks}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Available
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#fff3e0' }}>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {limitedBooks}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Limited Stock
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#ffebee' }}>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {outOfStockBooks}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Out of Stock
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

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
