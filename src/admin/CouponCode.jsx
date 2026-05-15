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
      return <Chip label="Inactive" size="small" sx={{ bgcolor: colors.grayLight, color: '#666', fontSize: { xs: '0.65rem', sm: '0.8125rem' } }} />;
    }
    if (coupon.isValid) {
      return <Chip label="Active" size="small" sx={{ bgcolor: colors.success, color: '#fff', fontSize: { xs: '0.65rem', sm: '0.8125rem' } }} />;
    }
    return <Chip label="Expired" size="small" sx={{ bgcolor: colors.error, color: '#fff', fontSize: { xs: '0.65rem', sm: '0.8125rem' } }} />;
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
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, overflowX: 'hidden' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 3, md: 4 } }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            color: colors.primary, 
            fontFamily: "'Amaranth', sans-serif",
            mb: 1,
            fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.125rem' },
          }}
        >
          Discount Codes
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          Create and manage discount coupons for your customers
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: { xs: '12px', sm: '16px' }, bgcolor: alpha(colors.primary, 0.05), height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ height: '100%' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#666', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>Total Coupons</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.primary, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                  {stats.total}
                </Typography>
              </Box>
              <Typography variant="h2" sx={{ opacity: 0.5, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>🎫</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: { xs: '12px', sm: '16px' }, bgcolor: alpha(colors.success, 0.1), height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ height: '100%' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#666', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>Active Coupons</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.success, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                  {stats.active}
                </Typography>
              </Box>
              <Typography variant="h2" sx={{ opacity: 0.5, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>✅</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: { xs: '12px', sm: '16px' }, bgcolor: alpha(colors.warning, 0.1), height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ height: '100%' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#666', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>Expired</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.warning, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                  {stats.expired}
                </Typography>
              </Box>
              <Typography variant="h2" sx={{ opacity: 0.5, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>⏰</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: { xs: '12px', sm: '16px' }, bgcolor: alpha(colors.secondary, 0.1), height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ height: '100%' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#666', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>Times Used</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.secondary, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                  {stats.totalUsed}
                </Typography>
              </Box>
              <Typography variant="h2" sx={{ opacity: 0.5, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>🔄</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: { xs: 2, sm: 3 } }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: colors.primary,
            '&:hover': { bgcolor: colors.primaryLight },
            borderRadius: '50px',
            textTransform: 'none',
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            px: { xs: 2, sm: 3 },
          }}
        >
          Create Coupon
        </Button>
      </Box>

      {/* Coupons Table */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: { xs: '12px', sm: '16px' }, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          overflowX: 'auto',
          '& .MuiTable-root': {
            minWidth: { xs: 800, md: 900 },
          },
        }}
      >
        <Table size="small">
          <TableHead sx={{ bgcolor: alpha(colors.primary, 0.05) }}>
            <TableRow>
              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, whiteSpace: 'nowrap' }}>Code</TableCell>
              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, whiteSpace: 'nowrap' }}>Discount</TableCell>
              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, whiteSpace: 'nowrap' }}>Description</TableCell>
              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, whiteSpace: 'nowrap' }}>Min Purchase</TableCell>
              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, whiteSpace: 'nowrap' }}>Used / Limit</TableCell>
              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, whiteSpace: 'nowrap' }}>Valid Period</TableCell>
              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, whiteSpace: 'nowrap' }}>Status</TableCell>
              <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, whiteSpace: 'nowrap' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCoupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  No coupons found
                </TableCell>
              </TableRow>
            ) : (
              paginatedCoupons.map((coupon) => (
                <TableRow key={coupon._id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                        {coupon.code}
                      </Typography>
                      <Tooltip title="Copy code">
                        <IconButton size="small" onClick={() => copyToClipboard(coupon.code)} sx={{ padding: { xs: '4px', sm: '8px' } }}>
                          <CopyIcon sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' } }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Chip 
                      label={`${coupon.discountPercentage}% OFF`} 
                      size="small" 
                      sx={{ 
                        bgcolor: colors.secondary, 
                        color: colors.navyDark, 
                        fontWeight: 700,
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        height: { xs: 20, sm: 24 },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        maxWidth: { xs: 100, sm: 150, md: 200 }, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      }}
                    >
                      {coupon.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                    {coupon.minPurchase > 0 ? `${coupon.minPurchase} TND` : 'No minimum'}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                    {coupon.usedCount} / {coupon.usageLimit || '∞'}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Typography variant="caption" sx={{ color: '#666', fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
                      {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{getStatusChip(coupon)}</TableCell>
                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                    <Stack direction="row" spacing={0} justifyContent="center">
                      <Tooltip title={coupon.isActive ? 'Deactivate' : 'Activate'}>
                        <IconButton size="small" onClick={() => handleToggleStatus(coupon)} sx={{ padding: { xs: '4px', sm: '8px' } }}>
                          {coupon.isActive ? 
                            <ToggleOnIcon sx={{ color: colors.success, fontSize: { xs: '1.1rem', sm: '1.3rem' } }} /> : 
                            <ToggleOffIcon sx={{ color: '#999', fontSize: { xs: '1.1rem', sm: '1.3rem' } }} />
                          }
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenDialog(coupon)} sx={{ color: colors.primary, padding: { xs: '4px', sm: '8px' } }}>
                          <EditIcon sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(coupon._id)} sx={{ color: colors.error, padding: { xs: '4px', sm: '8px' } }}>
                          <DeleteIcon sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
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
          sx={{
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            },
            '& .MuiTablePagination-select': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            },
          }}
        />
      </TableContainer>

      {/* Create/Edit Coupon Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: '100%' },
            maxHeight: { xs: 'calc(100% - 32px)', sm: 'auto' },
          },
        }}
      >
        <DialogTitle sx={{ bgcolor: colors.primary, color: colors.white, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={{ xs: 2, sm: 3 }} sx={{ mt: { xs: 2, sm: 4 } }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Discount Percentage</InputLabel>
              <Select
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleFormChange}
                label="Discount Percentage"
                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                <MenuItem value={10} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>10% OFF</MenuItem>
                <MenuItem value={20} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>20% OFF</MenuItem>
                <MenuItem value={30} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>30% OFF</MenuItem>
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
              size="small"
              placeholder="e.g., Summer Sale 2024"
              InputLabelProps={{ sx: { fontSize: { xs: '0.8rem', sm: '0.875rem' } } }}
              inputProps={{ sx: { fontSize: { xs: '0.8rem', sm: '0.875rem' } } }}
            />

            <TextField
              fullWidth
              type="number"
              label="Minimum Purchase (TND)"
              name="minPurchase"
              value={formData.minPurchase}
              onChange={handleFormChange}
              size="small"
              InputProps={{ 
                startAdornment: <InputAdornment position="start" sx={{ '& p': { fontSize: { xs: '0.8rem', sm: '0.875rem' } } }}>TND</InputAdornment>,
              }}
              InputLabelProps={{ sx: { fontSize: { xs: '0.8rem', sm: '0.875rem' } } }}
              inputProps={{ sx: { fontSize: { xs: '0.8rem', sm: '0.875rem' } } }}
            />

            <TextField
              fullWidth
              type="number"
              label="Usage Limit (Leave empty for unlimited)"
              name="usageLimit"
              value={formData.usageLimit}
              onChange={handleFormChange}
              size="small"
              placeholder="Unlimited"
              InputLabelProps={{ sx: { fontSize: { xs: '0.8rem', sm: '0.875rem' } } }}
              inputProps={{ sx: { fontSize: { xs: '0.8rem', sm: '0.875rem' } } }}
            />

            <TextField
              fullWidth
              type="datetime-local"
              label="Valid From"
              name="validFrom"
              value={formData.validFrom}
              onChange={handleFormChange}
              size="small"
              InputLabelProps={{ shrink: true, sx: { fontSize: { xs: '0.8rem', sm: '0.875rem' } } }}
              inputProps={{ sx: { fontSize: { xs: '0.8rem', sm: '0.875rem' } } }}
            />

            <TextField
              fullWidth
              type="datetime-local"
              label="Valid Until"
              name="validUntil"
              value={formData.validUntil}
              onChange={handleFormChange}
              size="small"
              InputLabelProps={{ shrink: true, sx: { fontSize: { xs: '0.8rem', sm: '0.875rem' } } }}
              inputProps={{ sx: { fontSize: { xs: '0.8rem', sm: '0.875rem' } } }}
            />

            <Alert severity="info" sx={{ borderRadius: '12px', fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
              <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                Code format: <strong>HSXXXX10</strong> (for 10%), <strong>HSXXXX20</strong> (for 20%), <strong>HSXXXX30</strong> (for 30%)
                <br />where XXXX are random letters/numbers
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 0, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
          <Button 
            onClick={handleCloseDialog}
            fullWidth
            sx={{ 
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              order: { xs: 2, sm: 1 },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={formLoading}
            fullWidth
            sx={{ 
              bgcolor: colors.primary, 
              '&:hover': { bgcolor: colors.primaryLight },
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              order: { xs: 1, sm: 2 },
            }}
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
        sx={{
          '& .MuiAlert-root': {
            borderRadius: { xs: '8px', sm: '12px' },
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
          },
        }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: '12px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CouponCode;