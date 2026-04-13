import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip as MuiTooltip,
  Alert,
  Switch,
  FormControlLabel,
  Skeleton,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  School as SchoolIcon,
  MenuBook as BookIcon,
  AccessTime as TimeIcon,
  Sync as SyncIcon,
  Refresh as RefreshIcon,
  GetApp as DownloadIcon,
  Search as SearchIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { analyticsAPI } from '../services/api';
import { BACKEND_API_URL } from '../config/apiConfig';
import {
  OverviewStats,
  SchoolMetrics,
  BookAnalytics,
  TimeSeriesDataPoint,
  SyncLogEntry,
  GradeDistribution,
} from '../types/analytics';
import {
  formatReadingTime,
  formatTimestamp,
  getRelativeTime,
  calculatePercentageChange,
  formatLargeNumber,
  getGradeColor,
  exportToCSV,
  convertMsToHours,
  convertMsToMinutes,
} from '../utils/analyticsHelpers';


const COLORS = ['#6365f1ef', '#0ea4e9ea', '#8a5cf6f6', '#14b8a5f4', '#3b83f6f4', '#06b5d4f1', '#10b981f3', '#d846eff1'];

const formatSyncTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? 'P.M' : 'A.M';
  return `${month}/${day}/${year} : ${String(hours).padStart(2, '0')}:${minutes} ${period}`;
};

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, loading }) => {
  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" height={40} />
        <Skeleton variant="text" width="30%" />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          boxShadow: '0 6px 20px rgba(99,102,241,0.10)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography
            color="text.secondary"
            variant="body2"
            fontWeight={500}
            sx={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              color: 'primary.main',
              bgcolor: 'rgba(99,102,241,0.1)',
              borderRadius: 2,
              p: 0.8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Stack>
        <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.5px', lineHeight: 1.2 }}>
          {value}
        </Typography>
        {change !== undefined && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {change >= 0 ? (
              <TrendingUpIcon fontSize="small" color="success" />
            ) : (
              <TrendingDownIcon fontSize="small" color="error" />
            )}
            <Typography
              color={change >= 0 ? 'success.main' : 'error.main'}
              variant="body2"
              fontWeight={500}
            >
              {Math.abs(change)}% vs last period
            </Typography>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Data states
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [schools, setSchools] = useState<SchoolMetrics[]>([]);
  const [popularBooks, setPopularBooks] = useState<BookAnalytics[]>([]);
  const [timelineData, setTimelineData] = useState<TimeSeriesDataPoint[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>([]);
  const [gradeDistribution, setGradeDistribution] = useState<GradeDistribution[]>([]);

  // Table pagination
  const [schoolsPage, setSchoolsPage] = useState(0);
  const [schoolsRowsPerPage, setSchoolsRowsPerPage] = useState(10);
  const [booksPage, setBooksPage] = useState(0);
  const [booksRowsPerPage, setBooksRowsPerPage] = useState(10);
  const [logsPage, setLogsPage] = useState(0);
  const [logsRowsPerPage, setLogsRowsPerPage] = useState(10);

  // Sort states
  const [schoolsSort, setSchoolsSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({ column: 'schoolName', direction: 'asc' });
  const [booksSort, setBooksSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({ column: 'totalAccessCount', direction: 'desc' });
  const [logsSort, setLogsSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({ column: 'syncTimestamp', direction: 'desc' });

  // Search/filter states
  const [schoolSearch, setSchoolSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState<'all' | 'success' | 'failed'>('all');

  useEffect(() => {
    fetchAllAnalytics();
  }, [timeRange]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchAllAnalytics, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [autoRefresh, timeRange]);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading analytics data from database...');
      console.log('📡 Backend API URL:', BACKEND_API_URL);

      // Fetch all analytics data from the backend
      const [
        overviewResponse,
        schoolsResponse,
        booksResponse,
        timelineResponse,
        gradeResponse,
        syncLogsResponse,
      ] = await Promise.all([
        analyticsAPI.getOverviewStats(),
        analyticsAPI.getSchoolsStats({ limit: 100 }),
        analyticsAPI.getPopularBooks(20),
        analyticsAPI.getTimelineData(timeRange),
        analyticsAPI.getBooksByGrade(),
        analyticsAPI.getSyncLogs(50),
      ]);

      console.log('✅ Analytics data loaded successfully from database');
      console.log('📊 Data:', {
        schools: schoolsResponse.length,
        books: booksResponse.length,
        timeline: timelineResponse.length,
        logs: syncLogsResponse.length,
      });

      // Transform data to match frontend types
      setOverviewStats({
        totalActiveSchools: overviewResponse.totalActiveSchools,
        totalBooks: overviewResponse.totalBooks,
        totalReadingTimeMs: overviewResponse.totalReadingTimeMs,
        totalReadingTimeHours: overviewResponse.totalReadingTimeHours,
        totalRecords: overviewResponse.totalRecords,
        activeSchoolsLast7Days: overviewResponse.activeSchoolsLast7Days,
        activeSchoolsLast30Days: overviewResponse.activeSchoolsLast30Days,
        weeklyReadingTimeMs: overviewResponse.weeklyReadingTimeMs ?? 0,
        weeklyReadingTimeHours: overviewResponse.weeklyReadingTimeHours ?? 0,
        percentageChange: {
          ...overviewResponse.percentageChange,
          weeklyReadingTime: overviewResponse.percentageChange?.weeklyReadingTime ?? 0,
        },
      });

      setSchools(schoolsResponse.map((school: any) => ({
        id: school.schoolId,
        schoolName: school.schoolName,
        serialNumber: school.serialNumber,
        totalReadingTimeMs: school.totalReadingTimeMs,
        totalReadingTimeHours: school.totalReadingTimeHours,
        totalBooksAccessed: school.totalBooksAccessed,
        totalRecords: school.totalRecords,
        lastSyncTime: school.lastSyncTime,
        isActive: school.isActive,
        weeklyReadingTimeMs: school.weeklyReadingTimeMs ?? 0,
      })));

      setPopularBooks(booksResponse.map((book: any) => ({
        bookId: book.bookId,
        bookTitle: book.bookTitle,
        grade: book.grade,
        totalActiveTimeMs: book.totalActiveTimeMs,
        totalAccessCount: book.totalAccessCount,
        uniqueSchools: book.uniqueSchools,
        avgSessionTimeMs: book.avgSessionTimeMs,
        pagesAccessed: book.pagesAccessed || [],
      })));

      setTimelineData(timelineResponse.map((point: any) => ({
        timestamp: point.timestamp,
        date: point.date,
        totalSessions: point.totalSessions,
        totalActiveTimeMs: point.totalActiveTimeMs,
        uniqueBooks: point.uniqueBooks,
        uniqueSchools: point.uniqueSchools,
      })));

      setGradeDistribution(gradeResponse.map((grade: any) => ({
        grade: grade.grade,
        count: grade.count,
        totalReadingTimeMs: grade.totalReadingTimeMs,
        percentage: grade.percentage,
      })));

      setSyncLogs(syncLogsResponse.map((log: any) => ({
        id: log.id,
        schoolId: log.schoolId,
        schoolName: log.schoolName,
        censusNo: log.censusNo,
        syncTimestamp: log.syncTimestamp,
        recordsProcessed: log.recordsProcessed,
        success: log.success,
        errorMessage: log.errorMessage,
        createdAt: log.createdAt,
      })));

      setLoading(false);
    } catch (err: any) {
      console.error('Error loading analytics data from database:', err);
      const errorMessage = `Failed to load analytics from ${BACKEND_API_URL}: ${err.message || 'Unknown error'}.`;
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAllAnalytics();
  };

  const handleExportSchools = () => {
    const exportData = filteredSchools.map(school => ({
      'School Name': school.schoolName,
      'Serial Number': school.serialNumber,
      'Total Reading Time (hours)': convertMsToHours(school.totalReadingTimeMs),
      'Weekly Reading Time (min)': convertMsToMinutes(school.weeklyReadingTimeMs),
      'Books Accessed': school.totalBooksAccessed,
      'Total Records': school.totalRecords,
      'Last Sync': formatSyncTimestamp(school.lastSyncTime),
      'Status': school.isActive ? 'Active' : 'Inactive',
    }));
    exportToCSV(exportData, 'schools_analytics');
  };

  const handleExportBooks = () => {
    const exportData = filteredBooks.map(book => ({
      'Book Title': book.bookTitle,
      'Grade': book.grade,
      'Total Time': formatReadingTime(book.totalActiveTimeMs),
      'Schools Using': book.uniqueSchools,
      'Times Opened': book.totalAccessCount,
      'Avg Session (min)': Math.round(book.avgSessionTimeMs / 60000),
    }));
    exportToCSV(exportData, 'books_analytics');
  };

  const handleExportLogs = () => {
    const exportData = filteredLogs.map(log => ({
      'Timestamp': formatSyncTimestamp(log.syncTimestamp),
      'Census No': log.censusNo || '',
      'School': log.schoolName,
      'Records Processed': log.recordsProcessed,
      'Status': log.success ? 'Success' : 'Failed',
      'Error': log.errorMessage || '',
    }));
    exportToCSV(exportData, 'sync_logs');
  };

  // Sort utility
  const sortData = (data: any[], column: string, direction: 'asc' | 'desc'): any[] => {
    return [...data].sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];
      let result = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        result = aVal.localeCompare(bVal);
      } else if (aVal !== null && aVal !== undefined && bVal !== null && bVal !== undefined) {
        result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }
      return direction === 'asc' ? result : -result;
    });
  };

  const handleSchoolsSort = (column: string) => {
    setSchoolsSort(prev => ({ column, direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc' }));
    setSchoolsPage(0);
  };

  const handleBooksSort = (column: string) => {
    setBooksSort(prev => ({ column, direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc' }));
    setBooksPage(0);
  };

  const handleLogsSort = (column: string) => {
    setLogsSort(prev => ({ column, direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc' }));
    setLogsPage(0);
  };

  // Filtered data
  const filteredSchools = schools.filter(school =>
    school.schoolName.toLowerCase().includes(schoolSearch.toLowerCase()) ||
    school.serialNumber.toLowerCase().includes(schoolSearch.toLowerCase())
  );

  const filteredBooks = popularBooks.filter(book =>
    book.bookTitle.toLowerCase().includes(bookSearch.toLowerCase())
  );

  const filteredLogs = syncLogs.filter(log => {
    if (logStatusFilter === 'all') return true;
    if (logStatusFilter === 'success') return log.success;
    if (logStatusFilter === 'failed') return !log.success;
    return true;
  });

  // Sorted data
  const sortedSchools = sortData(filteredSchools, schoolsSort.column, schoolsSort.direction);
  const sortedBooks = sortData(filteredBooks, booksSort.column, booksSort.direction);
  const sortedLogs = sortData(filteredLogs, logsSort.column, logsSort.direction);

  // Calculate sync success rate
  const syncSuccessRate = syncLogs.length > 0
    ? Math.round((syncLogs.filter(log => log.success).length / syncLogs.length) * 100)
    : 0;

  // Calculate average session duration
  const avgSessionDuration = popularBooks.length > 0
    ? Math.round(popularBooks.reduce((sum, book) => sum + book.avgSessionTimeMs, 0) / popularBooks.length / 60000)
    : 0;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.5px' }}>
          Analytics Dashboard
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
            }
            label="Auto-refresh"
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
              <MenuItem value="365d">Last Year</MenuItem>
            </Select>
          </FormControl>
          <MuiTooltip title="Refresh data">
            <IconButton onClick={handleRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
          </MuiTooltip>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4} lg>
          <StatCard
            title="Active Schools"
            value={overviewStats?.totalActiveSchools || 0}
            change={overviewStats?.percentageChange.schools}
            icon={<SchoolIcon />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg>
          <StatCard
            title="Weekly Reading Time"
            value={formatReadingTime(overviewStats?.weeklyReadingTimeMs || 0)}
            change={overviewStats?.percentageChange.weeklyReadingTime}
            icon={<TimeIcon />}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg>
          <StatCard
            title="Total Records"
            value={formatLargeNumber(overviewStats?.totalRecords || 0)}
            change={overviewStats?.percentageChange.records}
            icon={<BookIcon />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg>
          <StatCard
            title="Avg Session"
            value={`${avgSessionDuration}m`}
            icon={<TimeIcon />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg>
          <StatCard
            title="Sync Success Rate"
            value={`${syncSuccessRate}%`}
            icon={<SyncIcon />}
            loading={loading}
          />
        </Grid>
      </Grid>

      {loading && !overviewStats ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          {/* Charts Section */}
          <Grid container spacing={3} mb={4}>
            {/* Reading Activity Over Time */}
            <Grid item xs={12} lg={8}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Reading Activity Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalSessions"
                      stroke="#6366f1"
                      name="Sessions"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#6366f1', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="uniqueSchools"
                      stroke="#0ea5e9"
                      name="Active Schools"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Grade Distribution */}
            <Grid item xs={12} lg={4}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Usage by Grade
                </Typography>
                {gradeDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={gradeDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#6366f1"
                        paddingAngle={5}
                        dataKey="count"
                        label={(entry) => `Grade ${entry.grade}`}
                      >
                        {gradeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getGradeColor(entry.grade)} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <Typography color="text.secondary">
                      No grade distribution data available
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Most Popular Books */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, width: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Most Popular Books
                </Typography>
                <Box sx={{ width: '100%', height: 450 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={popularBooks.slice(0, 10)}
                      layout="vertical"
                      margin={{ top: 5, right: 50, bottom: 5, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis
                        type="category"
                        dataKey="bookTitle"
                        width={190}
                        tick={{ fontSize: 13 }}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`${value} times`, 'Times Opened']}
                      />
                      <Legend />
                      <Bar
                        dataKey="totalAccessCount"
                        fill="#6366f1"
                        name="Times Opened"
                        radius={[0, 8, 8, 0]}
                      >
                        {popularBooks.slice(0, 10).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getGradeColor(entry.grade)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Data Tables */}
          <Grid container spacing={3} mt={1}>
            {/* Schools Table */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight={600}>Schools Overview</Typography>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      size="small"
                      placeholder="Search schools..."
                      value={schoolSearch}
                      onChange={(e) => setSchoolSearch(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      startIcon={<DownloadIcon />}
                      onClick={handleExportSchools}
                      variant="outlined"
                      size="small"
                    >
                      Export
                    </Button>
                  </Stack>
                </Stack>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 600 }} sortDirection={schoolsSort.column === 'schoolName' ? schoolsSort.direction : false}>
                          <TableSortLabel active={schoolsSort.column === 'schoolName'} direction={schoolsSort.column === 'schoolName' ? schoolsSort.direction : 'asc'} onClick={() => handleSchoolsSort('schoolName')}>School Name</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }} sortDirection={schoolsSort.column === 'serialNumber' ? schoolsSort.direction : false}>
                          <TableSortLabel active={schoolsSort.column === 'serialNumber'} direction={schoolsSort.column === 'serialNumber' ? schoolsSort.direction : 'asc'} onClick={() => handleSchoolsSort('serialNumber')}>Serial Number</TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }} sortDirection={schoolsSort.column === 'totalReadingTimeMs' ? schoolsSort.direction : false}>
                          <TableSortLabel active={schoolsSort.column === 'totalReadingTimeMs'} direction={schoolsSort.column === 'totalReadingTimeMs' ? schoolsSort.direction : 'asc'} onClick={() => handleSchoolsSort('totalReadingTimeMs')}>Reading Time (min)</TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }} sortDirection={schoolsSort.column === 'weeklyReadingTimeMs' ? schoolsSort.direction : false}>
                          <TableSortLabel active={schoolsSort.column === 'weeklyReadingTimeMs'} direction={schoolsSort.column === 'weeklyReadingTimeMs' ? schoolsSort.direction : 'asc'} onClick={() => handleSchoolsSort('weeklyReadingTimeMs')}>Weekly Time (min)</TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }} sortDirection={schoolsSort.column === 'totalBooksAccessed' ? schoolsSort.direction : false}>
                          <TableSortLabel active={schoolsSort.column === 'totalBooksAccessed'} direction={schoolsSort.column === 'totalBooksAccessed' ? schoolsSort.direction : 'asc'} onClick={() => handleSchoolsSort('totalBooksAccessed')}>Books Accessed</TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }} sortDirection={schoolsSort.column === 'totalRecords' ? schoolsSort.direction : false}>
                          <TableSortLabel active={schoolsSort.column === 'totalRecords'} direction={schoolsSort.column === 'totalRecords' ? schoolsSort.direction : 'asc'} onClick={() => handleSchoolsSort('totalRecords')}>Total Records</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }} sortDirection={schoolsSort.column === 'lastSyncTime' ? schoolsSort.direction : false}>
                          <TableSortLabel active={schoolsSort.column === 'lastSyncTime'} direction={schoolsSort.column === 'lastSyncTime' ? schoolsSort.direction : 'asc'} onClick={() => handleSchoolsSort('lastSyncTime')}>Last Sync</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }} sortDirection={schoolsSort.column === 'isActive' ? schoolsSort.direction : false}>
                          <TableSortLabel active={schoolsSort.column === 'isActive'} direction={schoolsSort.column === 'isActive' ? schoolsSort.direction : 'asc'} onClick={() => handleSchoolsSort('isActive')}>Status</TableSortLabel>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedSchools
                        .slice(schoolsPage * schoolsRowsPerPage, schoolsPage * schoolsRowsPerPage + schoolsRowsPerPage)
                        .map((school) => (
                          <TableRow key={school.id} hover>
                            <TableCell>{school.schoolName}</TableCell>
                            <TableCell>{school.serialNumber}</TableCell>
                            <TableCell align="right">
                              {convertMsToMinutes(school.totalReadingTimeMs)}
                            </TableCell>
                            <TableCell align="right">
                              {convertMsToMinutes(school.weeklyReadingTimeMs)}
                            </TableCell>
                            <TableCell align="right">{school.totalBooksAccessed}</TableCell>
                            <TableCell align="right">{school.totalRecords}</TableCell>
                            <TableCell>
                              {formatSyncTimestamp(school.lastSyncTime)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={school.isActive ? 'Active' : 'Inactive'}
                                color={school.isActive ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={sortedSchools.length}
                  page={schoolsPage}
                  onPageChange={(_, newPage) => setSchoolsPage(newPage)}
                  rowsPerPage={schoolsRowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setSchoolsRowsPerPage(parseInt(e.target.value, 10));
                    setSchoolsPage(0);
                  }}
                />
              </Paper>
            </Grid>

            {/* Books Table */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight={600}>Books Performance</Typography>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      size="small"
                      placeholder="Search books..."
                      value={bookSearch}
                      onChange={(e) => setBookSearch(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      startIcon={<DownloadIcon />}
                      onClick={handleExportBooks}
                      variant="outlined"
                      size="small"
                    >
                      Export
                    </Button>
                  </Stack>
                </Stack>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 600 }} sortDirection={booksSort.column === 'bookTitle' ? booksSort.direction : false}>
                          <TableSortLabel active={booksSort.column === 'bookTitle'} direction={booksSort.column === 'bookTitle' ? booksSort.direction : 'asc'} onClick={() => handleBooksSort('bookTitle')}>Book Title</TableSortLabel>
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }} sortDirection={booksSort.column === 'grade' ? booksSort.direction : false}>
                          <TableSortLabel active={booksSort.column === 'grade'} direction={booksSort.column === 'grade' ? booksSort.direction : 'asc'} onClick={() => handleBooksSort('grade')}>Grade</TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }} sortDirection={booksSort.column === 'totalActiveTimeMs' ? booksSort.direction : false}>
                          <TableSortLabel active={booksSort.column === 'totalActiveTimeMs'} direction={booksSort.column === 'totalActiveTimeMs' ? booksSort.direction : 'asc'} onClick={() => handleBooksSort('totalActiveTimeMs')}>Total Time</TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }} sortDirection={booksSort.column === 'uniqueSchools' ? booksSort.direction : false}>
                          <TableSortLabel active={booksSort.column === 'uniqueSchools'} direction={booksSort.column === 'uniqueSchools' ? booksSort.direction : 'asc'} onClick={() => handleBooksSort('uniqueSchools')}>Schools Using</TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }} sortDirection={booksSort.column === 'totalAccessCount' ? booksSort.direction : false}>
                          <TableSortLabel active={booksSort.column === 'totalAccessCount'} direction={booksSort.column === 'totalAccessCount' ? booksSort.direction : 'asc'} onClick={() => handleBooksSort('totalAccessCount')}>Times Opened</TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }} sortDirection={booksSort.column === 'avgSessionTimeMs' ? booksSort.direction : false}>
                          <TableSortLabel active={booksSort.column === 'avgSessionTimeMs'} direction={booksSort.column === 'avgSessionTimeMs' ? booksSort.direction : 'asc'} onClick={() => handleBooksSort('avgSessionTimeMs')}>Avg Session</TableSortLabel>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedBooks
                        .slice(booksPage * booksRowsPerPage, booksPage * booksRowsPerPage + booksRowsPerPage)
                        .map((book) => (
                          <TableRow key={book.bookId} hover>
                            <TableCell>{book.bookTitle}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={book.grade}
                                size="small"
                                sx={{ bgcolor: getGradeColor(book.grade), color: 'white' }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              {formatReadingTime(book.totalActiveTimeMs)}
                            </TableCell>
                            <TableCell align="right">{book.uniqueSchools}</TableCell>
                            <TableCell align="right">{book.totalAccessCount}</TableCell>
                            <TableCell align="right">
                              {Math.round(book.avgSessionTimeMs / 60000)}m
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={sortedBooks.length}
                  page={booksPage}
                  onPageChange={(_, newPage) => setBooksPage(newPage)}
                  rowsPerPage={booksRowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setBooksRowsPerPage(parseInt(e.target.value, 10));
                    setBooksPage(0);
                  }}
                />
              </Paper>
            </Grid>

            {/* Sync Logs Table */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight={600}>Recent Sync Logs</Typography>
                  <Stack direction="row" spacing={2}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={logStatusFilter}
                        label="Status"
                        onChange={(e) => setLogStatusFilter(e.target.value as any)}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="success">Success</MenuItem>
                        <MenuItem value="failed">Failed</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      startIcon={<DownloadIcon />}
                      onClick={handleExportLogs}
                      variant="outlined"
                      size="small"
                    >
                      Export
                    </Button>
                  </Stack>
                </Stack>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 600 }} sortDirection={logsSort.column === 'syncTimestamp' ? logsSort.direction : false}>
                          <TableSortLabel active={logsSort.column === 'syncTimestamp'} direction={logsSort.column === 'syncTimestamp' ? logsSort.direction : 'asc'} onClick={() => handleLogsSort('syncTimestamp')}>Timestamp</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }} sortDirection={logsSort.column === 'censusNo' ? logsSort.direction : false}>
                          <TableSortLabel active={logsSort.column === 'censusNo'} direction={logsSort.column === 'censusNo' ? logsSort.direction : 'asc'} onClick={() => handleLogsSort('censusNo')}>Census No</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }} sortDirection={logsSort.column === 'schoolName' ? logsSort.direction : false}>
                          <TableSortLabel active={logsSort.column === 'schoolName'} direction={logsSort.column === 'schoolName' ? logsSort.direction : 'asc'} onClick={() => handleLogsSort('schoolName')}>School</TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }} sortDirection={logsSort.column === 'recordsProcessed' ? logsSort.direction : false}>
                          <TableSortLabel active={logsSort.column === 'recordsProcessed'} direction={logsSort.column === 'recordsProcessed' ? logsSort.direction : 'asc'} onClick={() => handleLogsSort('recordsProcessed')}>Records Processed</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }} sortDirection={logsSort.column === 'success' ? logsSort.direction : false}>
                          <TableSortLabel active={logsSort.column === 'success'} direction={logsSort.column === 'success' ? logsSort.direction : 'asc'} onClick={() => handleLogsSort('success')}>Status</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Error Message</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedLogs
                        .slice(logsPage * logsRowsPerPage, logsPage * logsRowsPerPage + logsRowsPerPage)
                        .map((log) => (
                          <TableRow key={log.id} hover>
                            <TableCell>
                              {formatSyncTimestamp(log.syncTimestamp)}
                            </TableCell>
                            <TableCell>{log.censusNo || '-'}</TableCell>
                            <TableCell>{log.schoolName}</TableCell>
                            <TableCell align="right">{log.recordsProcessed}</TableCell>
                            <TableCell>
                              <Chip
                                icon={log.success ? <SuccessIcon /> : <ErrorIcon />}
                                label={log.success ? 'Success' : 'Failed'}
                                color={log.success ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                color="error"
                                sx={{
                                  maxWidth: 300,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {log.errorMessage || '-'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={sortedLogs.length}
                  page={logsPage}
                  onPageChange={(_, newPage) => setLogsPage(newPage)}
                  rowsPerPage={logsRowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setLogsRowsPerPage(parseInt(e.target.value, 10));
                    setLogsPage(0);
                  }}
                />
              </Paper>
            </Grid>
          </Grid>

          {/* Last Updated Timestamp */}
          <Box mt={3} textAlign="center">
            <Typography variant="caption" color="text.secondary">
              Last updated: {formatTimestamp(Date.now(), true)}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default AnalyticsDashboard;
