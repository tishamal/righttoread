import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  Snackbar,
  InputAdornment,
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
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

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  const [errors, setErrors] = useState<Partial<UserProfile & { confirmPassword: string }>>({});

  const validateProfile = (): boolean => {
    const newErrors: Partial<UserProfile> = {};
    if (!editedProfile.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    if (editedProfile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedProfile.email)) {
      newErrors.email = 'Invalid email address';
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

  const handleSave = () => {
    if (!validateProfile()) return;

    const updated = { ...editedProfile, username: currentUser };
    setProfile(updated);
    localStorage.setItem('userProfile', JSON.stringify(updated));
    setEditMode(false);
    setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
  };

  const validatePassword = (): boolean => {
    const newErrors: any = {};
    if (!currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = async () => {
    if (!validatePassword()) return;
    setPasswordLoading(true);
    try {
      // Attempt authentication with current password to verify it
      await authAPI.login({ username: currentUser, password: currentPassword });
      // If no error, update via setPassword endpoint using the existing session logic
      setSnackbar({ open: true, message: 'Password updated successfully!', severity: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.message || 'Failed to update password. Please check your current password.',
        severity: 'error',
      });
    } finally {
      setPasswordLoading(false);
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

              {/* Email */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={editMode ? editedProfile.email : profile.email}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!editMode}
                  error={!!errors.email}
                  helperText={errors.email}
                  placeholder="Enter email address"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
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

          {/* Change Password Section */}
          <Paper sx={{ p: 3, borderRadius: 3, mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: showPasswordSection ? 3 : 0 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Change Password
                </Typography>
                {!showPasswordSection && (
                  <Typography variant="body2" color="textSecondary">
                    Update your account password
                  </Typography>
                )}
              </Box>
              <Button
                variant={showPasswordSection ? 'text' : 'outlined'}
                startIcon={showPasswordSection ? <CancelIcon /> : <LockIcon />}
                onClick={() => {
                  setShowPasswordSection(!showPasswordSection);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setErrors({});
                }}
                sx={{ textTransform: 'none' }}
                color={showPasswordSection ? 'inherit' : 'primary'}
              >
                {showPasswordSection ? 'Cancel' : 'Change Password'}
              </Button>
            </Box>

            {showPasswordSection && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    error={!!(errors as any).currentPassword}
                    helperText={(errors as any).currentPassword}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="New Password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    error={!!(errors as any).newPassword}
                    helperText={(errors as any).newPassword}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={!!(errors as any).confirmPassword}
                    helperText={(errors as any).confirmPassword}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={handlePasswordChange}
                    disabled={passwordLoading}
                    startIcon={passwordLoading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                    sx={{ textTransform: 'none' }}
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </Grid>
              </Grid>
            )}
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
