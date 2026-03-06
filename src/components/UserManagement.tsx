import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  Snackbar,
  CircularProgress,
  Stack,
  Chip,
  IconButton,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  ManageAccounts as ManageAccountsIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { usersAPI, UserRecord, UserFormData } from '../services/usersAPI';

// ---------------------------------------------------------------------------
// Empty form helper
// ---------------------------------------------------------------------------
const emptyForm = (): UserFormData => ({
  first_name: '',
  last_name: '',
  contact_no: '',
  email: '',
  username: '',
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const UserManagement: React.FC = () => {
  // Table data
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Pagination (client-side page for display; Cognito uses tokens)
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(50);

  // Search
  const [searchInput, setSearchInput] = useState('');
  const [committedSearch, setCommittedSearch] = useState('');

  // Form
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<UserFormData>(emptyForm());
  const [errors, setErrors] = useState<Partial<UserFormData>>({});

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // ---------------------------------------------------------------------------
  // Debounce search
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setCommittedSearch(searchInput);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ---------------------------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------------------------
  const loadUsers = useCallback(async (search: string) => {
    try {
      setLoading(true);
      const result = await usersAPI.getAll({
        limit: 60,
        search: search || undefined,
      });
      setUsers(result.data);
      setTotalCount(result.total);
    } catch {
      showSnackbar('Failed to load users. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers(committedSearch);
  }, [committedSearch, loadUsers]);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const resetForm = () => {
    setForm(emptyForm());
    setErrors({});
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setCommittedSearch('');
    setPage(0);
  };

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------
  const validate = (): boolean => {
    const newErrors: Partial<UserFormData> = {};

    if (!form.first_name.trim()) newErrors.first_name = 'First name is required.';
    if (!form.last_name.trim())  newErrors.last_name  = 'Last name is required.';
    if (!form.contact_no.trim()) newErrors.contact_no = 'Contact number is required.';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address.';
    }
    if (!form.username.trim()) newErrors.username = 'Username is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------------------------------------------------------------------------
  // Submit handler
  // ---------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      await usersAPI.create(form);
      showSnackbar('User created successfully. An invitation email has been sent.', 'success');
      resetForm();
      await loadUsers(committedSearch);
      window.location.reload();
    } catch (err: any) {
      const detail = err?.message || '';
      const msg = detail.includes('already exists')
        ? `Username '${form.username}' already exists.`
        : 'Failed to create user. Please try again.';
      showSnackbar(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof UserFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Paginated slice for display
  const visibleUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <Box className="fade-in" sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)', overflow: 'hidden' }}>
      {/* Page Header */}
      <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
        <ManageAccountsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            User Management
          </Typography>
        </Box>

        {/* Search bar + count */}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search by email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              endAdornment: searchInput ? (
                <IconButton size="small" onClick={handleClearSearch} edge="end">
                  <ClearIcon fontSize="small" />
                </IconButton>
              ) : (
                <SearchIcon fontSize="small" sx={{ color: 'text.disabled', mr: 0.5 }} />
              ),
            }}
            sx={{ width: 260 }}
          />
          <Chip
            label={
              committedSearch
                ? `${totalCount.toLocaleString()} results`
                : `${totalCount.toLocaleString()} Users`
            }
            color="primary"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Two-column layout */}
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'stretch', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* ------------------------------------------------------------------ */}
        {/* LEFT: Users Table                                                    */}
        {/* ------------------------------------------------------------------ */}
        <Paper
          elevation={2}
          sx={{ flex: '1 1 60%', minWidth: 0, borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight="bold">
              Admin Users
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
                <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, width: '10%' }}>First Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '10%' }}>Last Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '19%' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '10%' }}>Username</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '14%' }}>Contact No</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '10%' }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '14%' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                          {committedSearch
                            ? 'No users match your search.'
                            : 'No users have been created yet.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      visibleUsers.map((user) => (
                        <TableRow key={user.sub} hover>
                          <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user.first_name}
                          </TableCell>
                          <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user.last_name}
                          </TableCell>
                          <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user.email}
                          </TableCell>
                          <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user.username}
                          </TableCell>
                          <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user.contact_no}
                          </TableCell>
                          <TableCell>
                            <Chip label={user.role} color="primary" size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.status}
                              color={user.status === 'CONFIRMED' ? 'success' : 'warning'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
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
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[50]}
                onPageChange={(_, newPage) => setPage(newPage)}
                sx={{ borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}
              />
            </Box>
          )}
        </Paper>

        {/* ------------------------------------------------------------------ */}
        {/* RIGHT: Create User Form                                              */}
        {/* ------------------------------------------------------------------ */}
        <Paper
          elevation={2}
          sx={{ flex: '0 0 300px', borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonAddIcon fontSize="small" color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Create User
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflow: 'auto' }}
          >
            <TextField
              label="First Name"
              value={form.first_name}
              onChange={handleChange('first_name')}
              error={!!errors.first_name}
              helperText={errors.first_name}
              fullWidth
              size="small"
              required
            />

            <TextField
              label="Last Name"
              value={form.last_name}
              onChange={handleChange('last_name')}
              error={!!errors.last_name}
              helperText={errors.last_name}
              fullWidth
              size="small"
              required
            />

            <TextField
              label="Contact No"
              value={form.contact_no}
              onChange={handleChange('contact_no')}
              error={!!errors.contact_no}
              helperText={errors.contact_no || 'Format: +94771234567'}
              fullWidth
              size="small"
              required
            />

            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
              size="small"
              required
            />

            <TextField
              label="Username"
              value={form.username}
              onChange={handleChange('username')}
              error={!!errors.username}
              helperText={errors.username}
              fullWidth
              size="small"
              required
            />

            {/* Role — read-only */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Role
              </Typography>
              <Chip label="ADMIN" color="primary" size="medium" sx={{ fontWeight: 700, px: 1 }} />
            </Box>

            <Stack direction="row" spacing={1.5}>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <PersonAddIcon />}
                sx={{ flex: 1 }}
              >
                {saving ? 'Creating…' : 'Create User'}
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={resetForm}
                disabled={saving}
              >
                Clear
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;
