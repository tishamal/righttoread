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
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Stack,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AddCircleOutline as AddIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { schoolsAPI, RegisteredSchool, SchoolFormData } from '../services/schoolsAPI';

// ---------------------------------------------------------------------------
// Empty form helper
// ---------------------------------------------------------------------------
const emptyForm = (): SchoolFormData => ({
  school_name: '',
  census_no: '',
  province: '',
  district: '',
  zone: '',
  division: '',
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const SchoolRegistration: React.FC = () => {
  // Table data
  const [schools, setSchools] = useState<RegisteredSchool[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Pagination (MUI TablePagination is 0-based)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  // Search
  const [searchInput, setSearchInput] = useState('');       // live text field value
  const [committedSearch, setCommittedSearch] = useState(''); // debounced â€” sent to API

  // Form
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SchoolFormData>(emptyForm());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Partial<SchoolFormData>>({});

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // ---------------------------------------------------------------------------
  // Debounce: fire API search 300ms after user stops typing
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setCommittedSearch(searchInput);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ---------------------------------------------------------------------------
  // Data loading â€” re-runs on page, rowsPerPage, or search change
  // ---------------------------------------------------------------------------
  const loadSchools = useCallback(async (
    p: number,
    limit: number,
    search: string,
  ) => {
    try {
      setLoading(true);
      const result = await schoolsAPI.getAll({
        page: p + 1, // convert 0-based MUI page â†’ 1-based API page
        limit,
        search: search || undefined,
      });
      setSchools(result.data);
      setTotalCount(result.total);
    } catch {
      showSnackbar('Failed to load schools. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchools(page, rowsPerPage, committedSearch);
  }, [page, rowsPerPage, committedSearch, loadSchools]);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
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
    const newErrors: Partial<SchoolFormData> = {};
    if (!form.school_name.trim()) newErrors.school_name = 'School name is required.';
    if (!form.census_no.trim()) newErrors.census_no = 'Census No is required.';
    if (!form.province.trim()) newErrors.province = 'Province is required.';
    if (!form.district.trim()) newErrors.district = 'District is required.';
    if (!form.zone.trim()) newErrors.zone = 'Zone is required.';
    if (!form.division.trim()) newErrors.division = 'Division is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------------------------------------------------------------------------
  // CRUD Handlers
  // ---------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      if (editingId !== null) {
        await schoolsAPI.update(editingId, form);
        showSnackbar('School updated successfully.', 'success');
        await loadSchools(page, rowsPerPage, committedSearch);
      } else {
        await schoolsAPI.create(form);
        showSnackbar('School registered successfully.', 'success');
        setPage(0);
        await loadSchools(0, rowsPerPage, committedSearch);
      }
      resetForm();
    } catch (err: any) {
      const msg = err?.message?.includes('already exists')
        ? 'A school with this Census No already exists.'
        : 'Failed to save school. Please try again.';
      showSnackbar(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (school: RegisteredSchool) => {
    setEditingId(school.id);
    setForm({
      school_name: school.school_name,
      census_no: school.census_no,
      province: school.province,
      district: school.district,
      zone: school.zone,
      division: school.division,
    });
    setErrors({});
  };

  const handleDelete = async (school: RegisteredSchool) => {
    if (!window.confirm(`Delete "${school.school_name}"? This cannot be undone.`)) return;
    try {
      await schoolsAPI.delete(school.id);
      if (editingId === school.id) resetForm();
      showSnackbar('School deleted successfully.', 'success');
      const newPage = schools.length === 1 && page > 0 ? page - 1 : page;
      setPage(newPage);
      await loadSchools(newPage, rowsPerPage, committedSearch);
    } catch {
      showSnackbar('Failed to delete school. Please try again.', 'error');
    }
  };

  const handleChange = (field: keyof SchoolFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <Box className="fade-in" sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)', overflow: 'hidden' }}>
      {/* Page Header */}
      <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
        <SchoolIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            School Registration
          </Typography>
        </Box>

        {/* Search bar + count */}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search schools..."
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
                : `${totalCount.toLocaleString()} Schools`
            }
            color="primary"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Two-column layout */}
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'stretch', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* ------------------------------------------------------------------ */}
        {/* LEFT: Schools Table                                                  */}
        {/* ------------------------------------------------------------------ */}
        <Paper
          elevation={2}
          sx={{ flex: '1 1 60%', minWidth: 0, borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight="bold">
              Registered Schools
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
                      <TableCell sx={{ fontWeight: 700, width: 200, maxWidth: 200 }}>School Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 90 }}>Census No</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 90 }}>Province</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 90 }}>District</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 110 }}>Zone</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 110 }}>Division</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, width: 80 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {schools.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                          {committedSearch
                            ? 'No schools match your search.'
                            : 'No schools registered yet. Use the form to add the first one.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      schools.map((school) => (
                        <TableRow
                          key={school.id}
                          hover
                          selected={editingId === school.id}
                          sx={{ '&.Mui-selected': { backgroundColor: 'primary.50' } }}
                        >
                          <TableCell
                            sx={{
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={school.school_name}
                          >
                            {school.school_name}
                          </TableCell>
                          <TableCell>
                            <Chip label={school.census_no} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>{school.province}</TableCell>
                          <TableCell>{school.district}</TableCell>
                          <TableCell>{school.zone}</TableCell>
                          <TableCell>{school.division}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEdit(school)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(school)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
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
                onPageChange={(_e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[25, 50, 100]}
              />
            </Box>
          )}
        </Paper>

        {/* ------------------------------------------------------------------ */}
        {/* RIGHT: Registration Form                                             */}
        {/* ------------------------------------------------------------------ */}
        <Paper elevation={2} sx={{ flex: '0 0 340px', width: 340, borderRadius: 3, overflow: 'auto' }}>
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight="bold">
              {editingId !== null ? 'Edit School' : 'Register New School'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {editingId !== null
                ? 'Update the details below and save.'
                : 'Fill in the details to register a school.'}
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ px: 3, py: 3 }}>
            <Stack spacing={2.5}>
              <TextField
                label="School Name"
                value={form.school_name}
                onChange={handleChange('school_name')}
                error={!!errors.school_name}
                helperText={errors.school_name}
                fullWidth
                size="small"
                required
              />

              <TextField
                label="Census No"
                value={form.census_no}
                onChange={handleChange('census_no')}
                error={!!errors.census_no}
                helperText={errors.census_no}
                fullWidth
                size="small"
                required
              />

              <Divider>
                <Typography variant="caption" color="text.secondary">
                  Location
                </Typography>
              </Divider>

              <TextField
                label="Province"
                value={form.province}
                onChange={handleChange('province')}
                error={!!errors.province}
                helperText={errors.province}
                fullWidth
                size="small"
                required
              />

              <TextField
                label="District"
                value={form.district}
                onChange={handleChange('district')}
                error={!!errors.district}
                helperText={errors.district}
                fullWidth
                size="small"
                required
              />

              <TextField
                label="Zone"
                value={form.zone}
                onChange={handleChange('zone')}
                error={!!errors.zone}
                helperText={errors.zone}
                fullWidth
                size="small"
                required
              />

              <TextField
                label="Division"
                value={form.division}
                onChange={handleChange('division')}
                error={!!errors.division}
                helperText={errors.division}
                fullWidth
                size="small"
                required
              />

              <Divider />

              <Stack direction="row" spacing={1.5}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={saving}
                  startIcon={
                    saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />
                  }
                >
                  {saving ? 'Savingâ€¦' : editingId !== null ? 'Save Changes' : 'Register School'}
                </Button>

                {editingId !== null && (
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={resetForm}
                    startIcon={<CancelIcon />}
                    sx={{ flexShrink: 0 }}
                  >
                    Cancel
                  </Button>
                )}
              </Stack>

              {editingId === null && (
                <Button
                  variant="text"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={resetForm}
                  sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
                >
                  Clear form
                </Button>
              )}
            </Stack>
          </Box>
        </Paper>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SchoolRegistration;
