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
} from '../utils/analyticsHelpers';


const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

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
      <Paper sx={{ p: 3 }}>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" height={40} />
        <Skeleton variant="text" width="30%" />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography color="text.secondary" variant="body2">
            {title}
          </Typography>
          <Box sx={{ color: 'primary.main' }}>{icon}</Box>
        </Stack>
        <Typography variant="h4" fontWeight="bold">
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

      console.log('🔄 Fetching analytics data from backend...');
      console.log('📡 API Base URL:', process.env.REACT_APP_API_URL || 'http://localhost:8080/api');

      // Fetch all data in parallel
      const [
        overview,
        schoolsData,
        booksData,
        timeline,
        logs,
        grades,
      ] = await Promise.all([
        analyticsAPI.getOverviewStats().catch((err) => { console.error('❌ Overview stats failed:', err); return null; }),
        analyticsAPI.getSchoolsStats().catch((err) => { console.error('❌ Schools stats failed:', err); return []; }),
        analyticsAPI.getPopularBooks(10).catch((err) => { console.error('❌ Popular books failed:', err); return []; }),
        analyticsAPI.getTimelineData(timeRange).catch((err) => { console.error('❌ Timeline data failed:', err); return []; }),
        analyticsAPI.getSyncLogs(50).catch((err) => { console.error('❌ Sync logs failed:', err); return []; }),
        analyticsAPI.getBooksByGrade().catch((err) => { console.error('❌ Books by grade failed:', err); return []; }),
      ]);

      console.log('✅ Analytics data fetched successfully');
      console.log('📊 Data received:', { overview, schoolsData: schoolsData.length, booksData: booksData.length });

      setOverviewStats(overview);
      setSchools(schoolsData);
      setPopularBooks(booksData);
      setTimelineData(timeline);
      setSyncLogs(logs);
      setGradeDistribution(grades);

      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to fetch analytics data');
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
      'Books Accessed': school.totalBooksAccessed,
      'Total Records': school.totalRecords,
      'Last Sync': formatTimestamp(school.lastSyncTime),
      'Status': school.isActive ? 'Active' : 'Inactive',
    }));
    exportToCSV(exportData, 'schools_analytics');
  };

  const handleExportBooks = () => {
    const exportData = filteredBooks.map(book => ({
      'Book Title': book.bookTitle,
      'Grade': book.grade,
      'Total Time (hours)': convertMsToHours(book.totalActiveTimeMs),
      'Schools Using': book.uniqueSchools,
      'Times Opened': book.totalAccessCount,
      'Avg Session (min)': Math.round(book.avgSessionTimeMs / 60000),
    }));
    exportToCSV(exportData, 'books_analytics');
  };

  const handleExportLogs = () => {
    const exportData = filteredLogs.map(log => ({
      'Timestamp': formatTimestamp(log.syncTimestamp, true),
      'School': log.schoolName,
      'Records Processed': log.recordsProcessed,
      'Status': log.success ? 'Success' : 'Failed',
      'Error': log.errorMessage || '',
    }));
    exportToCSV(exportData, 'sync_logs');
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

  // Calculate sync success rate
  const syncSuccessRate = syncLogs.length > 0
    ? Math.round((syncLogs.filter(log => log.success).length / syncLogs.length) * 100)
    : 0;

  // Calculate average session duration
  const avgSessionDuration = popularBooks.length > 0
    ? Math.round(popularBooks.reduce((sum, book) => sum + book.avgSessionTimeMs, 0) / popularBooks.length / 60000)
    : 0;

  return (
    <Box p={3}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h4" fontWeight="bold">
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
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Active Schools"
            value={overviewStats?.totalActiveSchools || 0}
            change={overviewStats?.percentageChange.schools}
            icon={<SchoolIcon />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Total Reading Time"
            value={formatReadingTime(overviewStats?.totalReadingTimeMs || 0)}
            change={overviewStats?.percentageChange.readingTime}
            icon={<TimeIcon />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Books Accessed"
            value={overviewStats?.totalBooks || 0}
            icon={<BookIcon />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Total Records"
            value={formatLargeNumber(overviewStats?.totalRecords || 0)}
            change={overviewStats?.percentageChange.records}
            icon={<BookIcon />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Avg Session"
            value={`${avgSessionDuration}m`}
            icon={<TimeIcon />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
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
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
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
                      stroke="#8884d8"
                      name="Sessions"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="uniqueSchools"
                      stroke="#82ca9d"
                      name="Active Schools"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Grade Distribution */}
            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
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
                        fill="#8884d8"
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
              <Paper sx={{ p: 3, width: '100%' }}>
                <Typography variant="h6" gutterBottom>
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
                        fill="#8884d8"
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
              <Paper sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Schools Overview</Typography>
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
                      <TableRow>
                        <TableCell>School Name</TableCell>
                        <TableCell>Serial Number</TableCell>
                        <TableCell align="right">Reading Time</TableCell>
                        <TableCell align="right">Books Accessed</TableCell>
                        <TableCell align="right">Total Records</TableCell>
                        <TableCell>Last Sync</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredSchools
                        .slice(schoolsPage * schoolsRowsPerPage, schoolsPage * schoolsRowsPerPage + schoolsRowsPerPage)
                        .map((school) => (
                          <TableRow key={school.id} hover>
                            <TableCell>{school.schoolName}</TableCell>
                            <TableCell>{school.serialNumber}</TableCell>
                            <TableCell align="right">
                              {formatReadingTime(school.totalReadingTimeMs)}
                            </TableCell>
                            <TableCell align="right">{school.totalBooksAccessed}</TableCell>
                            <TableCell align="right">{school.totalRecords}</TableCell>
                            <TableCell>
                              <MuiTooltip title={formatTimestamp(school.lastSyncTime, true)}>
                                <span>{getRelativeTime(school.lastSyncTime)}</span>
                              </MuiTooltip>
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
                  count={filteredSchools.length}
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
              <Paper sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Books Performance</Typography>
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
                      <TableRow>
                        <TableCell>Book Title</TableCell>
                        <TableCell align="center">Grade</TableCell>
                        <TableCell align="right">Total Time</TableCell>
                        <TableCell align="right">Schools Using</TableCell>
                        <TableCell align="right">Times Opened</TableCell>
                        <TableCell align="right">Avg Session</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredBooks
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
                  count={filteredBooks.length}
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
              <Paper sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Recent Sync Logs</Typography>
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
                      <TableRow>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>School</TableCell>
                        <TableCell align="right">Records Processed</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Error Message</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredLogs
                        .slice(logsPage * logsRowsPerPage, logsPage * logsRowsPerPage + logsRowsPerPage)
                        .map((log) => (
                          <TableRow key={log.id} hover>
                            <TableCell>
                              <MuiTooltip title={formatTimestamp(log.syncTimestamp, true)}>
                                <span>{getRelativeTime(log.syncTimestamp)}</span>
                              </MuiTooltip>
                            </TableCell>
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
                  count={filteredLogs.length}
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
