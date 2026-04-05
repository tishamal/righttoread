import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  Alert,
  Snackbar,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  PhoneAndroid as DeviceIcon,
} from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { devicesAPI, DeviceDownloadEntry } from '../services/devicesAPI';

const SchoolDownloads: React.FC = () => {
  const [rows, setRows] = useState<DeviceDownloadEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);           // 0-based (MUI)
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const [searchInput, setSearchInput] = useState('');
  const [committedSearch, setCommittedSearch] = useState('');

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'error' });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCommittedSearch(searchInput);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadData = useCallback(async (p: number, limit: number, search: string) => {
    try {
      setLoading(true);
      const result = await devicesAPI.getDownloads({
        page: p + 1,
        limit,
        search: search || undefined,
      });
      setRows(result.data);
      setTotalCount(result.total);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load downloads. Please try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(page, rowsPerPage, committedSearch);
  }, [loadData, page, rowsPerPage, committedSearch]);

  const platformLabel = (platform: string | null) => {
    if (!platform) return <Chip label="Unknown" size="small" />;
    const lower = platform.toLowerCase();
    if (lower === 'android')
      return <Chip label="Android" size="small" color="success" variant="outlined" />;
    if (lower === 'ios')
      return <Chip label="iOS" size="small" color="primary" variant="outlined" />;
    return <Chip label={platform} size="small" variant="outlined" />;
  };

  return (
    <Box className="fade-in">
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <DeviceIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              School Downloads
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Devices that have registered and downloaded the app
            </Typography>
          </Box>
        </Stack>

        <Chip
          label={`${totalCount} device${totalCount !== 1 ? 's' : ''}`}
          color="primary"
          variant="outlined"
        />
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        {/* Search */}
        <Box sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search by school name or census no…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ width: 340 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchInput ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchInput('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>

        {/* Table */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>School Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Census No</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Platform</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>App Version</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Device ID (MAC)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Downloaded Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Downloaded Time</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No records found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => (
                  <TableRow key={`${row.census_no}-${row.created_at}`} hover>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {page * rowsPerPage + idx + 1}
                    </TableCell>
                    <TableCell>{row.school_name}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {row.census_no || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>{platformLabel(row.platform)}</TableCell>
                    <TableCell>
                      {row.app_version ? (
                        <Chip label={`v${row.app_version}`} size="small" color="default" />
                      ) : (
                        <Typography variant="body2" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" fontSize={11}>
                        {row.mac_address || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.downloaded_date}</TableCell>
                    <TableCell>{row.downloaded_time}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[25, 50, 100]}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SchoolDownloads;
