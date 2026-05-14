import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  Tooltip,
  TablePagination,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import api from '../services/api';

const colors = {
  navyDark: '#0a1928',
  navyLight: '#1e3a5f',
  accentGold: '#F6D673',
  white: '#ffffff',
  black: '#0a0a0a',
  grayLight: '#f5f5f5',
  primary: '#1e3a5f',
  primaryLight: '#3a5a7f',
  secondary: '#F6D673',
  secondaryDark: '#e6c660',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
};

const CouponCode = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    totalUsed: 0
  });

  const [formData, setFormData] = useState({
    discountPercentage: 10,
    description: '',
    minPurchase: 0,
    usageLimit: '',
    validFrom: new Date().toISOString().slice(0, 16),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  });

  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.get('/coupons');
      setCoupons(response.data.coupons);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load coupons',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        discountPercentage: coupon.discountPercentage,
        description: coupon.description || '',
        minPurchase: coupon.minPurchase,
        usageLimit: coupon.usageLimit || '',
        validFrom: new Date(coupon.validFrom).toISOString().slice(0, 16),
        validUntil: new Date(coupon.validUntil).toISOString().slice(0, 16),
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        discountPercentage: 10,
        description: '',
        minPurchase: 0,
        usageLimit: '',
        validFrom: new Date().toISOString().slice(0, 16),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCoupon(null);
    setFormLoading(false);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      setFormLoading(true);
      
      const data = {
        discountPercentage: formData.discountPercentage,
        description: formData.description,
        minPurchase: formData.minPurchase,
        usageLimit: formData.usageLimit || null,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
      };
      
      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon._id}`, data);
        setSnackbar({
          open: true,
          message: 'Coupon updated successfully!',
          severity: 'success',
        });
      } else {
        await api.post('/coupons', data);
        setSnackbar({
          open: true,
          message: 'Coupon created successfully!',
          severity: 'success',
        });
      }
      
      fetchCoupons();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving coupon:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save coupon',
        severity: 'error',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (couponId) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await api.delete(`/coupons/${couponId}`);
        setSnackbar({
          open: true,
          message: 'Coupon deleted successfully!',
          severity: 'success',
        });
        fetchCoupons();
      } catch (error) {
        console.error('Error deleting coupon:', error);
        setSnackbar({
          open: true,
          message: 'Failed to delete coupon',
          severity: 'error',
        });
      }
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      await api.put(`/coupons/${coupon._id}/toggle`);
      setSnackbar({
        open: true,
        message: `Coupon ${coupon.isActive ? 'deactivated' : 'activated'} successfully`,
        severity: 'success',
      });
      fetchCoupons();
    } catch (error) {
      console.error('Error toggling coupon:', error);
      setSnackbar({
        open: true,
        message: 'Failed to toggle coupon status',
        severity: 'error',
      });
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setSnackbar({
      open: true,
      message: 'Coupon code copied to clipboard!',
      severity: 'success',
    });
  };

  const getStatusChip = (coupon) => {
    if (!coupon.isActive) {
      return <Chip label="Inactive" size="small" sx={{ bgcolor: colors.grayLight, color: '#666' }} />;
    }
    if (coupon.isValid) {
      return <Chip label="Active" size="small" sx={{ bgcolor: colors.success, color: '#fff' }} />;
    }
    return <Chip label="Expired" size="small" sx={{ bgcolor: colors.error, color: '#fff' }} />;
  };

  const paginatedCoupons = coupons.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            color: colors.primary, 
            fontFamily: "'Amaranth', sans-serif",
            mb: 1,
          }}
        >
          Discount Codes
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Create and manage discount coupons for your customers
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.primary, 0.05) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Total Coupons</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.primary }}>
                  {stats.total}
                </Typography>
              </Box>
              <Typography variant="h2" sx={{ opacity: 0.5 }}>🎫</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.success, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Active Coupons</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.success }}>
                  {stats.active}
                </Typography>
              </Box>
              <Typography variant="h2" sx={{ opacity: 0.5 }}>✅</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.warning, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Expired</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.warning }}>
                  {stats.expired}
                </Typography>
              </Box>
              <Typography variant="h2" sx={{ opacity: 0.5 }}>⏰</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.secondary, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Times Used</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.secondary }}>
                  {stats.totalUsed}
                </Typography>
              </Box>
              <Typography variant="h2" sx={{ opacity: 0.5 }}>🔄</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: colors.primary,
            '&:hover': { bgcolor: colors.primaryLight },
            borderRadius: '50px',
            textTransform: 'none',
          }}
        >
          Create Coupon
        </Button>
      </Box>

      {/* Coupons Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: alpha(colors.primary, 0.05) }}>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Min Purchase</TableCell>
              <TableCell>Used / Limit</TableCell>
              <TableCell>Valid Period</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCoupons.map((coupon) => (
              <TableRow key={coupon._id} hover>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '1rem' }}>
                      {coupon.code}
                    </Typography>
                    <Tooltip title="Copy code">
                      <IconButton size="small" onClick={() => copyToClipboard(coupon.code)}>
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={`${coupon.discountPercentage}% OFF`} 
                    size="small" 
                    sx={{ bgcolor: colors.secondary, color: colors.navyDark, fontWeight: 700 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {coupon.description || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {coupon.minPurchase > 0 ? `${coupon.minPurchase} TND` : 'No minimum'}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {coupon.usedCount} / {coupon.usageLimit || '∞'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>{getStatusChip(coupon)}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={0.5} justifyContent="center">
                    <Tooltip title={coupon.isActive ? 'Deactivate' : 'Activate'}>
                      <IconButton size="small" onClick={() => handleToggleStatus(coupon)}>
                        {coupon.isActive ? <ToggleOnIcon sx={{ color: colors.success }} /> : <ToggleOffIcon sx={{ color: '#999' }} />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenDialog(coupon)} sx={{ color: colors.primary }}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDelete(coupon._id)} sx={{ color: colors.error }}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={coupons.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Create/Edit Coupon Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: colors.primary, color: colors.white }}>
          {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3} sx={{ mt: 4 }}>
            <FormControl fullWidth >
              <InputLabel>Discount Percentage</InputLabel>
              <Select
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleFormChange}
                label="Discount Percentage"
              >
                <MenuItem value={10}>10% OFF</MenuItem>
                <MenuItem value={20}>20% OFF</MenuItem>
                <MenuItem value={30}>30% OFF</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Description (Optional)"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              multiline
              rows={2}
              placeholder="e.g., Summer Sale 2024"
            />

            <TextField
              fullWidth
              type="number"
              label="Minimum Purchase (TND)"
              name="minPurchase"
              value={formData.minPurchase}
              onChange={handleFormChange}
              InputProps={{ startAdornment: <InputAdornment position="start">TND</InputAdornment> }}
            />

            <TextField
              fullWidth
              type="number"
              label="Usage Limit (Leave empty for unlimited)"
              name="usageLimit"
              value={formData.usageLimit}
              onChange={handleFormChange}
              placeholder="Unlimited"
            />

            <TextField
              fullWidth
              type="datetime-local"
              label="Valid From"
              name="validFrom"
              value={formData.validFrom}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              type="datetime-local"
              label="Valid Until"
              name="validUntil"
              value={formData.validUntil}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
            />

            <Alert severity="info" sx={{ borderRadius: '12px' }}>
              <Typography variant="caption">
                Code format: <strong>HSXXXX10</strong> (for 10%), <strong>HSXXXX20</strong> (for 20%), <strong>HSXXXX30</strong> (for 30%)
                <br />where XXXX are random letters/numbers
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={formLoading}
            sx={{ bgcolor: colors.primary, '&:hover': { bgcolor: colors.primaryLight } }}
          >
            {formLoading ? <CircularProgress size={24} /> : (editingCoupon ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default CouponCode;