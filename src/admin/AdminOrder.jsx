import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Stack,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Button,
  alpha,
  Divider,
  IconButton,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Tabs,
  Tab,
  LinearProgress,
  Snackbar,
  Alert,
  Zoom,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  ShoppingBag as BagIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
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
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
};

const orderStatuses = [
  { value: 'pending', label: 'Pending', color: colors.warning, icon: <ScheduleIcon /> },
  { value: 'confirmed', label: 'Confirmed', color: colors.info, icon: <CheckCircleIcon /> },
  { value: 'processing', label: 'Processing', color: colors.primary, icon: <InventoryIcon /> },
  { value: 'shipped', label: 'Shipped', color: colors.secondary, icon: <ShippingIcon /> },
  { value: 'delivered', label: 'Delivered', color: colors.success, icon: <CheckCircleIcon /> },
  { value: 'cancelled', label: 'Cancelled', color: colors.error, icon: <ErrorIcon /> },
];

const AdminOrder = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentTab, setCurrentTab] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filters, currentTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      setOrders(response.data.orders);
      setStats(response.data.stats);
      setFilteredOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to load orders',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/orders/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];
    
    // Tab filter
    if (currentTab === 1) filtered = filtered.filter(o => o.orderStatus === 'pending');
    if (currentTab === 2) filtered = filtered.filter(o => o.orderStatus === 'processing');
    if (currentTab === 3) filtered = filtered.filter(o => o.orderStatus === 'shipped');
    if (currentTab === 4) filtered = filtered.filter(o => o.orderStatus === 'delivered');
    
    // Search filter
    if (filters.search) {
      filtered = filtered.filter(o => 
        o.orderNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
        o.customer?.fullName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        o.customer?.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        o.customer?.phone?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(o => o.orderStatus === filters.status);
    }
    
    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(o => new Date(o.createdAt) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(o => new Date(o.createdAt) <= new Date(filters.dateTo));
    }
    
    setFilteredOrders(filtered);
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      dateFrom: '',
      dateTo: '',
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    
    try {
      setActionLoading(true);
      await api.put(`/orders/${selectedOrder._id}/status`, { status: newStatus });
      await fetchOrders();
      await fetchStats();
      setStatusDialogOpen(false);
      setSnackbar({
        open: true,
        message: `Order status updated to ${newStatus}`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update status',
        severity: 'error',
      });
    } finally {
      setActionLoading(false);
      setNewStatus('');
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const getStatusChip = (status) => {
    const statusConfig = orderStatuses.find(s => s.value === status);
    if (!statusConfig) return <Chip label={status} size="small" />;
    
    return (
      <Chip
        icon={statusConfig.icon}
        label={statusConfig.label}
        size="small"
        sx={{ bgcolor: alpha(statusConfig.color, 0.1), color: statusConfig.color, fontWeight: 600 }}
      />
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatCurrency = (amount) => `${amount?.toLocaleString()} TND`;

  const getStatusColor = (status) => {
    const statusConfig = orderStatuses.find(s => s.value === status);
    return statusConfig?.color || colors.grayLight;
  };

  const paginatedOrders = filteredOrders.slice(
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
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            color: colors.primary, 
            fontFamily: "'Assistant', sans-serif",
            mb: 1,
          }}
        >
          Order Management
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Track and manage customer orders
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.primary, 0.05) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Total Orders</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.primary }}>
                  {stats.total}
                </Typography>
              </Box>
              <ReceiptIcon sx={{ fontSize: 40, color: colors.primary, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.warning, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Pending</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.warning }}>
                  {stats.pending}
                </Typography>
              </Box>
              <ScheduleIcon sx={{ fontSize: 40, color: colors.warning, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.primary, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Processing</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.primary }}>
                  {stats.processing}
                </Typography>
              </Box>
              <InventoryIcon sx={{ fontSize: 40, color: colors.primary, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.navyDark, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Shipped</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.secondary }}>
                  {stats.shipped}
                </Typography>
              </Box>
              <ShippingIcon sx={{ fontSize: 40, color: colors.secondary, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.success, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Revenue</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.navyLight }}>
                  {formatCurrency(stats.totalRevenue)}
                </Typography>
              </Box>
              <MoneyIcon sx={{ fontSize: 40, color: colors.success, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs 
        value={currentTab} 
        onChange={(e, v) => setCurrentTab(v)}
        sx={{ mb: 3, borderBottom: `1px solid ${alpha(colors.primary, 0.1)}` }}
      >
        <Tab label="All Orders" />
        <Tab label="Pending" icon={<Badge badgeContent={stats.pending} color="warning" />} />
        <Tab label="Processing" />
        <Tab label="Shipped" />
        <Tab label="Delivered" />
      </Tabs>

      {/* Toolbar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search by order #, name, email..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            sx={{ flex: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: colors.primary }} />
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            variant="outlined"
            size="small"
            sx={{ borderColor: colors.primary, color: colors.primary }}
          >
            Filters
          </Button>
          
          <Tooltip title="Refresh">
            <IconButton onClick={fetchOrders} sx={{ color: colors.primary }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Advanced Filters */}
        {showFilters && (
          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(colors.primary, 0.1)}` }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All</MenuItem>
                    {orderStatuses.map(status => (
                      <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="From Date"
                  size="small"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="To Date"
                  size="small"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  sx={{ color: colors.primary }}
                >
                  Clear All Filters
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Orders Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: alpha(colors.primary, 0.05) }}>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.map((order) => (
              <TableRow key={order._id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: colors.primary }}>
                    {order.orderNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {formatDate(order.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, bgcolor: colors.primary }}>
                      {order.customer?.fullName?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {order.customer?.fullName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {order.customer?.email}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {order.items?.length} item(s)
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: colors.primary }}>
                    {formatCurrency(order.totalAmount)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {getStatusChip(order.orderStatus)}
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => handleViewOrder(order)} sx={{ color: colors.primary }}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Update Status">
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus(order.orderStatus);
                          setStatusDialogOpen(true);
                        }}
                        sx={{ color: colors.secondary }}
                      >
                        <ShippingIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Order Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
        maxWidth="md" 
        fullWidth
        TransitionComponent={Zoom}
      >
        {selectedOrder && (
          <>
            <DialogTitle sx={{ bgcolor: colors.primary, color: colors.white }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Order Details - {selectedOrder.orderNumber}</Typography>
                <IconButton onClick={() => setDetailsOpen(false)} sx={{ color: colors.white }}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Order Status Timeline */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: colors.grayLight, borderRadius: '12px' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: colors.primary }}>
                      Order Status
                    </Typography>
                    <Stepper activeStep={orderStatuses.findIndex(s => s.value === selectedOrder.orderStatus)}>
                      {orderStatuses.slice(0, 5).map((status) => (
                        <Step key={status.value}>
                          <StepLabel StepIconProps={{ sx: { color: getStatusColor(status.value) } }}>
                            <Typography variant="caption">{status.label}</Typography>
                          </StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  </Paper>
                </Grid>

                {/* Customer Information */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, borderRadius: '12px' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: colors.primary }}>
                      <PersonIcon sx={{ fontSize: 16, mr: 0.5 }} /> Customer Information
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        <strong>Name:</strong> {selectedOrder.customer?.fullName}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong> {selectedOrder.customer?.email}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Phone:</strong> {selectedOrder.customer?.phone}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Address:</strong> {selectedOrder.customer?.address}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>

                {/* Order Information */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, borderRadius: '12px' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: colors.primary }}>
                      <ReceiptIcon sx={{ fontSize: 16, mr: 0.5 }} /> Order Information
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        <strong>Order Date:</strong> {formatDate(selectedOrder.createdAt)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Payment Method:</strong> Cash on Delivery
                      </Typography>
                      <Typography variant="body2">
                        <strong>Payment Status:</strong> {selectedOrder.paymentStatus || 'Pending'}
                      </Typography>
                      {selectedOrder.notes && (
                        <Typography variant="body2">
                          <strong>Notes:</strong> {selectedOrder.notes}
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                </Grid>

                {/* Order Items */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, borderRadius: '12px' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: colors.primary }}>
                      <BagIcon sx={{ fontSize: 16, mr: 0.5 }} /> Order Items
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell>Size</TableCell>
                            <TableCell align="center">Quantity</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="right">Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedOrder.items?.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Avatar src={item.image} sx={{ width: 40, height: 40 }} />
                                  <Typography variant="body2">{item.name}</Typography>
                                </Stack>
                              </TableCell>
                              <TableCell>{item.size}</TableCell>
                              <TableCell align="center">{item.quantity}</TableCell>
                              <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                              <TableCell align="right">{formatCurrency(item.price * item.quantity)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={1} alignItems="flex-end">
                      <Stack direction="row" justifyContent="space-between" sx={{ width: 250 }}>
                        <Typography variant="body2">Subtotal:</Typography>
                        <Typography variant="body2">{formatCurrency(selectedOrder.subtotal)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" sx={{ width: 250 }}>
                        <Typography variant="body2">Shipping:</Typography>
                        <Typography variant="body2">{formatCurrency(selectedOrder.shippingFee || 0)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" sx={{ width: 250 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Total:</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: colors.accentGold }}>
                          {formatCurrency(selectedOrder.totalAmount)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              <Button
                variant="contained"
                startIcon={<ShippingIcon />}
                onClick={() => {
                  setStatusDialogOpen(true);
                  setDetailsOpen(false);
                }}
                sx={{ bgcolor: colors.primary }}
              >
                Update Status
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: colors.primary, color: colors.white }}>
          Update Order Status
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
            Order: <strong>{selectedOrder?.orderNumber}</strong>
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Status"
            >
              {orderStatuses.map(status => (
                <MenuItem key={status.value} value={status.value}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {status.icon}
                    <span>{status.label}</span>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateStatus}
            disabled={actionLoading || !newStatus || newStatus === selectedOrder?.orderStatus}
            sx={{ bgcolor: colors.primary }}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Update Status'}
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

export default AdminOrder;