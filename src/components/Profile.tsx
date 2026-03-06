import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Alert,
  Snackbar,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { authAPI } from '../services/authAPI';

interface ProfileProps {
  currentUser: string;
}

interface UserProfile {
  username: string;
  displayName: string;
  email: string;
  role: string;
  department: string;
  phone: string;
}

const Profile: React.FC<ProfileProps> = ({ currentUser }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, username: currentUser };
    }
    return {
      username: currentUser,
      displayName: currentUser,
      email: '',
      role: 'Administrator',
      department: 'Ministry of Education',
      phone: '',
    };
  });

  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  const [errors, setErrors] = useState<Partial<UserProfile & { confirmPassword: string }>>({});

  // Load latest attributes from Cognito on mount
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return;

    authAPI.getMe()
      .then((attrs) => {
        setProfile((prev) => {
          const updated: UserProfile = {
            ...prev,
            email: attrs.email ?? prev.email,
            phone: attrs.phone_number ?? prev.phone,
            displayName:
              attrs.name ??
              (attrs.given_name && attrs.family_name
                ? `${attrs.given_name} ${attrs.family_name}`
                : prev.displayName),
          };
          localStorage.setItem('userProfile', JSON.stringify(updated));
          return updated;
        });
      })
      .catch((err) => {
        console.warn('Could not load Cognito user attributes:', err);
      });
  }, []);


  const validateProfile = (): boolean => {
    const newErrors: Partial<UserProfile> = {};
    if (!editedProfile.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    if (editedProfile.phone && !/^[\d\s\+\-\(\)]{7,15}$/.test(editedProfile.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setEditedProfile({ ...profile });
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditedProfile({ ...profile });
    setErrors({});
    setEditMode(false);
  };

  const handleSave = async () => {
    if (!validateProfile()) return;

    try {
      await authAPI.updateMe({
        name: editedProfile.displayName,
        phone_number: editedProfile.phone || undefined,
        role: editedProfile.role,
        department: editedProfile.department,
      });

      const updated = { ...editedProfile, username: currentUser };
      setProfile(updated);
      localStorage.setItem('userProfile', JSON.stringify(updated));
      setEditMode(false);
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.message || 'Failed to update profile. Please try again.',
        severity: 'error',
      });
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#c62828', '#00796b'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Box className="fade-in">
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Account
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
        View and manage your profile information
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: getAvatarColor(currentUser),
                fontSize: 40,
                mx: 'auto',
                mb: 2,
              }}
            >
              {profile.displayName.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6" fontWeight="bold">
              {profile.displayName}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              @{profile.username}
            </Typography>
            <Chip label={profile.role} color="primary" size="small" sx={{ mb: 2 }} />
            {profile.email && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {profile.email}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Profile Details
              </Typography>
              {!editMode ? (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  sx={{ textTransform: 'none' }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    sx={{ textTransform: 'none' }}
                    color="inherit"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    sx={{ textTransform: 'none' }}
                  >
                    Save Changes
                  </Button>
                </Box>
              )}
            </Box>

            <Grid container spacing={2}>
              {/* Username (read-only) */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={profile.username}
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Username cannot be changed"
                />
              </Grid>

              {/* Display Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Display Name"
                  value={editMode ? editedProfile.displayName : profile.displayName}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, displayName: e.target.value }))}
                  disabled={!editMode}
                  error={!!errors.displayName}
                  helperText={errors.displayName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Email (read-only) */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={profile.email}
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Email cannot be changed"
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={editMode ? editedProfile.phone : profile.phone}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!editMode}
                  error={!!(errors as any).phone}
                  helperText={(errors as any).phone}
                  placeholder="Enter phone number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Role */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Role"
                  value={editMode ? editedProfile.role : profile.role}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, role: e.target.value }))}
                  disabled={!editMode}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Department */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department / Organization"
                  value={editMode ? editedProfile.department : profile.department}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, department: e.target.value }))}
                  disabled={!editMode}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
