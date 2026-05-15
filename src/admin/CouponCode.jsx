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
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
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
      return <Chip label="Inactive" size="small" color="default" variant="outlined" />;
    }
    if (coupon.isValid) {
      return <Chip label="Active" size="small" color="success" />;
    }
    return <Chip label="Expired" size="small" color="error" />;
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

  // Mobile Card View for Coupons
  const MobileCouponCard = ({ coupon }) => (
    <Card sx={{ mb: 2, borderRadius: '12px', overflow: 'hidden' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack spacing={1.5}>
          {/* Code and Status Row */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body1" sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '1rem' }}>
                {coupon.code}
              </Typography>
              <Tooltip title="Copy code">
                <IconButton size="small" onClick={() => copyToClipboard(coupon.code)}>
                  <CopyIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>
            </Stack>
            {getStatusChip(coupon)}
          </Stack>

          {/* Discount and Min Purchase */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Chip 
              label={`${coupon.discountPercentage}% OFF`} 
              size="small" 
              sx={{ bgcolor: colors.secondary, color: colors.navyDark, fontWeight: 700 }}
            />
            <Typography variant="caption" sx={{ color: '#666' }}>
              Min: {coupon.minPurchase > 0 ? `${coupon.minPurchase} TND` : 'None'}
            </Typography>
          </Stack>

          {/* Description */}
          {coupon.description && (
            <Typography variant="body2" color="text.secondary">
              {coupon.description}
            </Typography>
          )}

          {/* Usage */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" sx={{ color: '#666' }}>
              Used: {coupon.usedCount} / {coupon.usageLimit || '∞'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>
              {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}
            </Typography>
          </Stack>

          {/* Actions */}
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ pt: 1, borderTop: '1px solid #eee' }}>
            <Tooltip title={coupon.isActive ? 'Deactivate' : 'Activate'}>
              <IconButton size="small" onClick={() => handleToggleStatus(coupon)}>
                {coupon.isActive ? 
                  <ToggleOnIcon sx={{ color: colors.success }} /> : 
                  <ToggleOffIcon sx={{ color: '#999' }} />
                }
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
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, overflowX: 'hidden' }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }} 
          spacing={2}
        >
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800, 
                color: colors.primary, 
                fontFamily: "'Assistant', sans-serif",
                mb: 0.5,
                fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.125rem' },
              }}
            >
              Discount Codes
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Create and manage discount coupons for your customers
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            fullWidth={isMobile}
            sx={{
              bgcolor: colors.primary,
              '&:hover': { bgcolor: colors.primaryLight },
              borderRadius: '50px',
              textTransform: 'none',
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1 },
              whiteSpace: 'nowrap',
            }}
          >
            Create Coupon
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: { xs: '12px', sm: '16px' }, bgcolor: alpha(colors.primary, 0.05), height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>Total Coupons</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: colors.primary, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                  {stats.total}
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ opacity: 0.5, fontSize: { xs: '1.5rem', sm: '2rem' } }}>🎫</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: { xs: '12px', sm: '16px' }, bgcolor: alpha(colors.success, 0.1), height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>Active Coupons</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: colors.success, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                  {stats.active}
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ opacity: 0.5, fontSize: { xs: '1.5rem', sm: '2rem' } }}>✅</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: { xs: '12px', sm: '16px' }, bgcolor: alpha(colors.warning, 0.1), height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>Expired</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: colors.warning, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                  {stats.expired}
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ opacity: 0.5, fontSize: { xs: '1.5rem', sm: '2rem' } }}>⏰</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: { xs: '12px', sm: '16px' }, bgcolor: alpha(colors.secondary, 0.1), height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>Times Used</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: colors.secondary, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                  {stats.totalUsed}
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ opacity: 0.5, fontSize: { xs: '1.5rem', sm: '2rem' } }}>🔄</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Coupons List - Mobile Cards or Desktop Table */}
      {isMobile ? (
        // Mobile Card View
        <Box>
          {paginatedCoupons.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '12px' }}>
              <Typography variant="body2" color="text.secondary">No coupons found</Typography>
            </Paper>
          ) : (
            paginatedCoupons.map((coupon) => (
              <MobileCouponCard key={coupon._id} coupon={coupon} />
            ))
          )}
          
          {/* Mobile Pagination */}
          {coupons.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
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
                  '& .MuiTablePagination-toolbar': {
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: 1,
                  },
                  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                    fontSize: '0.75rem',
                    margin: 0,
                  },
                  '& .MuiTablePagination-select': {
                    fontSize: '0.75rem',
                  },
                }}
              />
            </Box>
          )}
        </Box>
      ) : (
        // Desktop Table View
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: '16px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            overflowX: 'auto',
          }}
        >
          <Table size={isTablet ? "small" : "medium"}>
            <TableHead sx={{ bgcolor: alpha(colors.primary, 0.05) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Discount</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Min Purchase</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Used / Limit</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Valid Period</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCoupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">No coupons found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCoupons.map((coupon) => (
                  <TableRow key={coupon._id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                          {coupon.code}
                        </Typography>
                        <Tooltip title="Copy code">
                          <IconButton size="small" onClick={() => copyToClipboard(coupon.code)}>
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Chip 
                        label={`${coupon.discountPercentage}% OFF`} 
                        size="small" 
                        sx={{ bgcolor: colors.secondary, color: colors.navyDark, fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          maxWidth: 200, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {coupon.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {coupon.minPurchase > 0 ? `${coupon.minPurchase} TND` : 'No minimum'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {coupon.usedCount} / {coupon.usageLimit || '∞'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{getStatusChip(coupon)}</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title={coupon.isActive ? 'Deactivate' : 'Activate'}>
                          <IconButton size="small" onClick={() => handleToggleStatus(coupon)}>
                            {coupon.isActive ? 
                              <ToggleOnIcon sx={{ color: colors.success }} /> : 
                              <ToggleOffIcon sx={{ color: '#999' }} />
                            }
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
          />
        </TableContainer>
      )}

      {/* Create/Edit Coupon Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : '16px',
          },
        }}
      >
        <DialogTitle sx={{ bgcolor: colors.primary, color: colors.white, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={{ xs: 2, sm: 3 }} sx={{ mt: { xs: 2, sm: 3 } }}>
            <FormControl fullWidth size="small">
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
              size="small"
              placeholder="e.g., Summer Sale 2024"
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
                startAdornment: <InputAdornment position="start">TND</InputAdornment>,
              }}
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
            />

            <TextField
              fullWidth
              type="datetime-local"
              label="Valid From"
              name="validFrom"
              value={formData.validFrom}
              onChange={handleFormChange}
              size="small"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              type="datetime-local"
              label="Valid Until"
              name="validUntil"
              value={formData.validUntil}
              onChange={handleFormChange}
              size="small"
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
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 0, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
          <Button 
            onClick={handleCloseDialog}
            fullWidth={isMobile}
            sx={{ order: { xs: 2, sm: 1 } }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={formLoading}
            fullWidth={isMobile}
            sx={{ 
              bgcolor: colors.primary, 
              '&:hover': { bgcolor: colors.primaryLight },
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
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: '12px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CouponCode;