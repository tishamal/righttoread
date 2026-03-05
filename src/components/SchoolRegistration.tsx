import React, { useState, useEffect } from 'react';
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
  const [schools, setSchools] = useState<RegisteredSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<SchoolFormData>(emptyForm());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Partial<SchoolFormData>>({});

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Derived: filter schools across all columns
  const filteredSchools = searchQuery
    ? schools.filter((s) => {
        const q = searchQuery.toLowerCase();
        return (
          s.school_name.toLowerCase().includes(q) ||
          s.census_no.toLowerCase().includes(q) ||
          s.province.toLowerCase().includes(q) ||
          s.district.toLowerCase().includes(q) ||
          s.zone.toLowerCase().includes(q) ||
          s.division.toLowerCase().includes(q)
        );
      })
    : schools;

  // ---------------------------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------------------------
  const loadSchools = async () => {
    try {
      setLoading(true);
      const data = await schoolsAPI.getAll();
      setSchools(data);
    } catch (err) {
      showSnackbar('Failed to load schools. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, []);

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

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------
  const validate = (): boolean => {
    const newErrors: Partial<SchoolFormData> = {};

    if (!form.school_name.trim()) newErrors.school_name = 'School name is required.';
    if (!form.census_no.trim()) {
      newErrors.census_no = 'Census No is required.';
    } else {
      // Uniqueness check (excluding current record when editing)
      const duplicate = schools.find(
        (s) => s.census_no === form.census_no.trim() && s.id !== editingId
      );
      if (duplicate) newErrors.census_no = 'This Census No is already registered.';
    }
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
        const updated = await schoolsAPI.update(editingId, form);
        setSchools((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
        showSnackbar('School updated successfully.', 'success');
      } else {
        const created = await schoolsAPI.create(form);
        setSchools((prev) => [...prev, created]);
        showSnackbar('School registered successfully.', 'success');
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
      setSchools((prev) => prev.filter((s) => s.id !== school.id));
      if (editingId === school.id) resetForm();
      showSnackbar('School deleted successfully.', 'success');
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
    <Box className="fade-in">
      {/* Page Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <SchoolIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            School Registration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage registered schools for the Right to Read programme
          </Typography>
        </Box>
        {/* Search bar + Schools count */}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search schools…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setSearchQuery(searchInput);
            }}
            InputProps={{
              endAdornment: searchQuery ? (
                <IconButton
                  size="small"
                  onClick={() => { setSearchInput(''); setSearchQuery(''); }}
                  edge="end"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              ) : null,
            }}
            sx={{ width: 240 }}
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<SearchIcon />}
            onClick={() => setSearchQuery(searchInput)}
            sx={{ textTransform: 'none', height: 40 }}
          >
            Search
          </Button>
          <Chip
            label={`${filteredSchools.length}${searchQuery ? ` / ${schools.length}` : ''} Schools`}
            color="primary"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Two-column layout */}
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>

        {/* ------------------------------------------------------------------ */}
        {/* LEFT: Schools Table                                                  */}
        {/* ------------------------------------------------------------------ */}
        <Paper
          elevation={2}
          sx={{ flex: '1 1 60%', minWidth: 0, borderRadius: 3, overflow: 'hidden' }}
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
            <TableContainer sx={{ maxHeight: 620 }}>
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
                        No schools registered yet. Use the form to add the first one.
                      </TableCell>
                    </TableRow>
                  ) : filteredSchools.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        No schools match your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSchools.map((school) => (
                      <TableRow
                        key={school.id}
                        hover
                        selected={editingId === school.id}
                        sx={{
                          '&.Mui-selected': {
                            backgroundColor: 'primary.50',
                          },
                        }}
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
          )}
        </Paper>

        {/* ------------------------------------------------------------------ */}
        {/* RIGHT: Registration Form                                             */}
        {/* ------------------------------------------------------------------ */}
        <Paper
          elevation={2}
          sx={{ flex: '0 0 340px', width: 340, borderRadius: 3 }}
        >
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

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ px: 3, py: 3 }}
          >
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
                    saving ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                >
                  {saving
                    ? 'Saving…'
                    : editingId !== null
                    ? 'Save Changes'
                    : 'Register School'}
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
