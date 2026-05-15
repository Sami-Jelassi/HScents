import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  TextField,
  Stack,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  alpha,
} from '@mui/material';
import {
  Person,
  Email,
  CalendarToday,
  PhotoCamera,
  Edit,
  Save,
  Cancel,
  AdminPanelSettings,
  Delete,
  AddCircleOutlined,
  Visibility,
  VisibilityOff,
  VerifiedUser,
  Shield,
  Lock,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../services/api';
import authService from '../services/auth';

const colors = {
  navyDark: '#0a1928',
  navyLight: '#1e3a5f',
  accentGold: '#73a7f6',
  white: '#ffffff',
  black: '#0a0a0a',
  grayLight: '#f5f5f5',
  primary: '#1e3a5f',
  primaryLight: '#3a5a7f',
  secondary: '#738ff6',
  secondaryDark: '#60b0e6',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
  diamond: '#9c27b0',
};

const Profile = () => {
  const currentUser = authService.getUser();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    profileImage: null,
    role: 'admin',
    createdAt: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    dateOfBirth: '',
  });
  
  // Password change state
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Admin management state
  const [admins, setAdmins] = useState([]);
  const [adminDialog, setAdminDialog] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    dateOfBirth: '',
    role: 'admin',
  });
  const [adminFormErrors, setAdminFormErrors] = useState({});
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deletingAdmin, setDeletingAdmin] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const isSuperAdmin = currentUser?.role === 'super_admin';

  useEffect(() => {
    fetchProfile();
    if (isSuperAdmin) {
      fetchAdmins();
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authService.getCurrentUser();
      const userData = response.user;
      setProfile(userData);
      setEditForm({
        name: userData.name || '',
        dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
      });
      setProfilePreview(userData.profileImage);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load profile',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

const fetchAdmins = async () => {
  try {
    // Use the new /admins endpoint instead of /users
    const response = await api.get('/auth/admins');
    setAdmins(response.data.admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    setSnackbar({
      open: true,
      message: 'Failed to load admin list',
      severity: 'error',
    });
  }
};

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'Image size should be less than 5MB',
          severity: 'error',
        });
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('dateOfBirth', editForm.dateOfBirth);
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }
      
      const response = await api.put('/auth/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setProfile(response.data.user);
      // Update localStorage
      const updatedUser = { ...currentUser, ...response.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setEditMode(false);
      setProfileImage(null);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update profile',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) errors.newPassword = 'New password is required';
    else if (passwordForm.newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters';
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    try {
      setChangingPassword(true);
      await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      setSnackbar({
        open: true,
        message: 'Password changed successfully!',
        severity: 'success',
      });
      setPasswordDialog(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    } catch (error) {
      console.error('Error changing password:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to change password',
        severity: 'error',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const validateAdminForm = () => {
    const errors = {};
    if (!adminForm.name.trim()) errors.name = 'Name is required';
    if (!adminForm.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(adminForm.email)) errors.email = 'Email is invalid';
    if (!editingAdmin && !adminForm.password) errors.password = 'Password is required';
    else if (!editingAdmin && adminForm.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!adminForm.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
    return errors;
  };

  const handleCreateAdmin = async () => {
    const errors = validateAdminForm();
    if (Object.keys(errors).length > 0) {
      setAdminFormErrors(errors);
      return;
    }
    
    try {
      setCreatingAdmin(true);
      await authService.register(adminForm);
      setSnackbar({
        open: true,
        message: `Admin ${adminForm.name} created successfully!`,
        severity: 'success',
      });
      fetchAdmins();
      handleCloseAdminDialog();
    } catch (error) {
      console.error('Error creating admin:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create admin',
        severity: 'error',
      });
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleUpdateAdmin = async () => {
    try {
      setCreatingAdmin(true);
      await api.put(`/auth/users/${editingAdmin._id}`, {
        name: adminForm.name,
        dateOfBirth: adminForm.dateOfBirth,
        role: adminForm.role,
      });
      setSnackbar({
        open: true,
        message: `Admin ${adminForm.name} updated successfully!`,
        severity: 'success',
      });
      fetchAdmins();
      handleCloseAdminDialog();
    } catch (error) {
      console.error('Error updating admin:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update admin',
        severity: 'error',
      });
    } finally {
      setCreatingAdmin(false);
    }
  };

const handleDeleteAdmin = async () => {
  // Only check if trying to delete own account
  if (deletingAdmin._id === profile._id) {
    setSnackbar({
      open: true,
      message: 'You cannot delete your own account',
      severity: 'error',
    });
    setDeleteDialog(false);
    return;
  }
  
  try {
    await api.delete(`/auth/users/${deletingAdmin._id}`);
    setSnackbar({
      open: true,
      message: `${deletingAdmin.name} has been removed successfully`,
      severity: 'success',
    });
    fetchAdmins(); // Refresh the list
    setDeleteDialog(false);
  } catch (error) {
    console.error('Error deleting admin:', error);
    setSnackbar({
      open: true,
      message: error.response?.data?.message || 'Failed to delete admin',
      severity: 'error',
    });
  }
};

  const handleOpenAdminDialog = (admin = null) => {
    if (admin) {
      setEditingAdmin(admin);
      setAdminForm({
        name: admin.name,
        email: admin.email,
        password: '',
        dateOfBirth: admin.dateOfBirth ? admin.dateOfBirth.split('T')[0] : '',
        role: admin.role,
      });
    } else {
      setEditingAdmin(null);
      setAdminForm({
        name: '',
        email: '',
        password: '',
        dateOfBirth: '',
        role: '',
      });
    }
    setAdminFormErrors({});
    setAdminDialog(true);
  };

  const handleCloseAdminDialog = () => {
    setAdminDialog(false);
    setEditingAdmin(null);
    setAdminForm({
      name: '',
      email: '',
      password: '',
      dateOfBirth: '',
      role: 'admin',
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: colors.primary,
            fontFamily: "'Montserrat', sans-serif",
            mb: 1,
          }}
        >
          Account Settings
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Manage your profile and account preferences
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column - Profile Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper sx={{ borderRadius: '20px', overflow: 'hidden', position: 'relative' }}>
              <Box
                sx={{
                  height: 120,
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: -5, mb: 2 }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    editMode ? (
                      <IconButton
                        component="label"
                        sx={{
                          bgcolor: colors.accentGold,
                          color: colors.navyDark,
                          '&:hover': { bgcolor: colors.secondaryDark },
                          width: 32,
                          height: 32,
                        }}
                      >
                        <PhotoCamera sx={{ fontSize: 18 }} />
                        <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                      </IconButton>
                    ) : null
                  }
                >
                  <Avatar
                    src={profilePreview}
                    sx={{
                      width: 100,
                      height: 100,
                      border: `4px solid ${colors.white}`,
                      bgcolor: colors.primary,
                    }}
                  >
                    {!profilePreview && profile.name?.charAt(0)}
                  </Avatar>
                </Badge>
              </Box>
              
              <Box sx={{ textAlign: 'center', px: 3, pb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: colors.primary }}>
                  {profile.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                  {profile.email}
                </Typography>
                <Chip
                  icon={profile.role === 'super_admin' ? <Shield /> : <AdminPanelSettings />}
                  label={profile.role === 'super_admin' ? 'Super Admin' : 'Administrator'}
                  size="small"
                  sx={{
                    bgcolor: alpha(colors.accentGold, 0.2),
                    color: colors.primary,
                    fontWeight: 600,
                  }}
                />
                
                <Divider sx={{ my: 2 }} />
                
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday sx={{ color: colors.accentGold, fontSize: 18 }} />
                    <Typography variant="body2">
                      Joined: {formatDate(profile.createdAt)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VerifiedUser sx={{ color: colors.success, fontSize: 18 }} />
                    <Typography variant="body2">Verified Account</Typography>
                  </Box>
                </Stack>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Lock />}
                  onClick={() => setPasswordDialog(true)}
                  sx={{ mt: 3, borderRadius: '50px', textTransform: 'none' }}
                >
                  Change Password
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        {/* Right Column - Profile Info & Admin Management */}
        <Grid size={{ xs: 12, md: 8 }}>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper sx={{ borderRadius: '20px', overflow: 'hidden' }}>
              <Tabs
                value={activeTab}
                onChange={(e, v) => setActiveTab(v)}
                sx={{ borderBottom: `1px solid ${colors.grayLight}`, px: 2 }}
              >
                <Tab label="Profile Information" />
                {isSuperAdmin }
              </Tabs>

              {/* Profile Information Tab */}
              {activeTab === 0 && (
                <Box sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary }}>
                      Personal Information
                    </Typography>
                    {!editMode ? (
                      <Button
                        startIcon={<Edit />}
                        onClick={() => setEditMode(true)}
                        sx={{ color: colors.accentGold }}
                      >
                        Edit Profile
                      </Button>
                    ) : (
                      <Stack direction="row" spacing={1}>
                        <Button
                          startIcon={<Cancel />}
                          onClick={() => {
                            setEditMode(false);
                            setEditForm({
                              name: profile.name,
                              dateOfBirth: profile.dateOfBirth?.split('T')[0] || '',
                            });
                            setProfilePreview(profile.profileImage);
                            setProfileImage(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                          onClick={handleUpdateProfile}
                          disabled={saving}
                          sx={{ bgcolor: colors.primary }}
                        >
                          Save Changes
                        </Button>
                      </Stack>
                    )}
                  </Stack>

                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={editMode ? editForm.name : profile.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: colors.accentGold }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        value={profile.email}
                        disabled
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email sx={{ color: colors.accentGold }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        type="date"
                        value={editMode ? editForm.dateOfBirth : (profile.dateOfBirth?.split('T')[0] || '')}
                        onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                        disabled={!editMode}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarToday sx={{ color: colors.accentGold }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

            </Paper>
          </motion.div>
        </Grid>
      </Grid>



      

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: '12px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;