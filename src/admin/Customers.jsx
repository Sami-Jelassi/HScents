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
  Snackbar,
  Alert,
  Zoom,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  ShoppingBag as BagIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon,
  Diamond as DiamondIcon,
  Verified as VerifiedIcon,
  Edit as EditIcon,
  Note as NoteIcon,
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
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  diamond: '#9c27b0',
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentTab, setCurrentTab] = useState(0);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [selectedActionCustomer, setSelectedActionCustomer] = useState(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [customFlags, setCustomFlags] = useState({});
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    returningCustomers: 0,
    newCustomers: 0,
    vipCustomers: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    minOrders: '',
    minSpent: '',
    dateFrom: '',
    dateTo: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Load custom flags from localStorage
  useEffect(() => {
    const savedFlags = localStorage.getItem('customerFlags');
    if (savedFlags) {
      setCustomFlags(JSON.parse(savedFlags));
    }
  }, []);

  // Save custom flags to localStorage
  const saveCustomFlags = (flags) => {
    localStorage.setItem('customerFlags', JSON.stringify(flags));
    setCustomFlags(flags);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [customers, filters, currentTab, customFlags]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      const orders = response.data.orders;
      
      // Process customers from orders
      const customerMap = new Map();
      
      orders.forEach(order => {
        const email = order.customer?.email;
        if (!email) return;
        
        if (!customerMap.has(email)) {
          customerMap.set(email, {
            id: email,
            name: order.customer?.fullName || 'Unknown',
            email: email,
            phone: order.customer?.phone || 'N/A',
            address: order.customer?.address || 'N/A',
            firstOrder: order.createdAt,
            lastOrder: order.createdAt,
            totalOrders: 1,
            totalSpent: order.totalAmount || 0,
            orders: [order],
            lastOrderDate: order.createdAt,
          });
        } else {
          const existing = customerMap.get(email);
          existing.totalOrders++;
          existing.totalSpent += order.totalAmount || 0;
          existing.orders.push(order);
          if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
            existing.lastOrderDate = order.createdAt;
          }
          if (new Date(order.createdAt) < new Date(existing.firstOrder)) {
            existing.firstOrder = order.createdAt;
          }
        }
      });
      
      const customersList = Array.from(customerMap.values());
      
      // Sort by total spent (highest first)
      customersList.sort((a, b) => b.totalSpent - a.totalSpent);
      
      setCustomers(customersList);
      setFilteredCustomers(customersList);
      
      // Calculate stats
      const totalCustomers = customersList.length;
      const totalOrders = customersList.reduce((sum, c) => sum + c.totalOrders, 0);
      const totalRevenue = customersList.reduce((sum, c) => sum + c.totalSpent, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Returning customers based on custom flags OR multiple orders
      const returningCustomers = customersList.filter(c => 
        customFlags[c.email]?.isReturning || c.totalOrders > 1
      ).length;
      
      const newCustomers = customersList.filter(c => {
        const firstOrderDate = new Date(c.firstOrder);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return firstOrderDate >= thirtyDaysAgo;
      }).length;
      
      // VIP customers (manually marked or auto based on spending)
      const vipCustomers = customersList.filter(c => 
        customFlags[c.email]?.isVip || c.totalSpent >= 1000
      ).length;
      
      setStats({
        totalCustomers,
        totalOrders,
        totalRevenue,
        averageOrderValue,
        returningCustomers,
        newCustomers,
        vipCustomers,
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to load customers',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...customers];
    
    // Tab filter
    if (currentTab === 1) {
      // Returning customers based on custom flags OR multiple orders
      filtered = filtered.filter(c => customFlags[c.email]?.isReturning || c.totalOrders > 1);
    } else if (currentTab === 2) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(c => new Date(c.firstOrder) >= thirtyDaysAgo);
    } else if (currentTab === 3) {
      filtered = filtered.filter(c => customFlags[c.email]?.isVip || c.totalSpent >= 1000);
    }
    
    // Search filter
    if (filters.search) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        c.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        c.phone.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    // Min orders filter
    if (filters.minOrders) {
      filtered = filtered.filter(c => c.totalOrders >= parseInt(filters.minOrders));
    }
    
    // Min spent filter
    if (filters.minSpent) {
      filtered = filtered.filter(c => c.totalSpent >= parseFloat(filters.minSpent));
    }
    
    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(c => new Date(c.firstOrder) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(c => new Date(c.firstOrder) <= new Date(filters.dateTo));
    }
    
    setFilteredCustomers(filtered);
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      minOrders: '',
      minSpent: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);
  };

  const handleActionClick = (event, customer) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedActionCustomer(customer);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
    setSelectedActionCustomer(null);
  };

  const handleMarkAsReturning = () => {
    if (!selectedActionCustomer) return;
    
    const updatedFlags = {
      ...customFlags,
      [selectedActionCustomer.email]: {
        ...customFlags[selectedActionCustomer.email],
        isReturning: true,
        returningMarkedAt: new Date().toISOString(),
        returningMarkedBy: 'admin',
      }
    };
    
    saveCustomFlags(updatedFlags);
    
    setSnackbar({
      open: true,
      message: `${selectedActionCustomer.name} has been marked as a returning customer!`,
      severity: 'success',
    });
    
    // Update stats
    setStats(prev => ({
      ...prev,
      returningCustomers: prev.returningCustomers + 1,
    }));
    
    // Refresh customer list to update UI
    fetchCustomers();
    handleActionClose();
  };

  const handleRemoveReturning = () => {
    if (!selectedActionCustomer) return;
    
    const updatedFlags = { ...customFlags };
    if (updatedFlags[selectedActionCustomer.email]) {
      delete updatedFlags[selectedActionCustomer.email].isReturning;
      if (Object.keys(updatedFlags[selectedActionCustomer.email]).length === 0) {
        delete updatedFlags[selectedActionCustomer.email];
      }
    }
    
    saveCustomFlags(updatedFlags);
    
    setSnackbar({
      open: true,
      message: `${selectedActionCustomer.name} has been removed from returning customers list`,
      severity: 'info',
    });
    
    // Update stats
    setStats(prev => ({
      ...prev,
      returningCustomers: prev.returningCustomers - 1,
    }));
    
    fetchCustomers();
    handleActionClose();
  };

  const handleMarkAsVIP = () => {
    if (!selectedActionCustomer) return;
    
    const updatedFlags = {
      ...customFlags,
      [selectedActionCustomer.email]: {
        ...customFlags[selectedActionCustomer.email],
        isVip: true,
        vipMarkedAt: new Date().toISOString(),
        vipMarkedBy: 'admin',
      }
    };
    
    saveCustomFlags(updatedFlags);
    
    setSnackbar({
      open: true,
      message: `${selectedActionCustomer.name} has been marked as VIP customer!`,
      severity: 'success',
    });
    
    setStats(prev => ({
      ...prev,
      vipCustomers: prev.vipCustomers + 1,
    }));
    
    fetchCustomers();
    handleActionClose();
  };

  const handleRemoveVIP = () => {
    if (!selectedActionCustomer) return;
    
    const updatedFlags = { ...customFlags };
    if (updatedFlags[selectedActionCustomer.email]) {
      delete updatedFlags[selectedActionCustomer.email].isVip;
      if (Object.keys(updatedFlags[selectedActionCustomer.email]).length === 0) {
        delete updatedFlags[selectedActionCustomer.email];
      }
    }
    
    saveCustomFlags(updatedFlags);
    
    setSnackbar({
      open: true,
      message: `${selectedActionCustomer.name} has been removed from VIP list`,
      severity: 'info',
    });
    
    setStats(prev => ({
      ...prev,
      vipCustomers: prev.vipCustomers - 1,
    }));
    
    fetchCustomers();
    handleActionClose();
  };

  const handleOpenNoteDialog = () => {
    const existingNote = customFlags[selectedActionCustomer?.email]?.note || '';
    setNoteText(existingNote);
    setNoteDialogOpen(true);
    handleActionClose();
  };

  const handleSaveNote = () => {
    if (!selectedActionCustomer) return;
    
    const updatedFlags = {
      ...customFlags,
      [selectedActionCustomer.email]: {
        ...customFlags[selectedActionCustomer.email],
        note: noteText,
        noteUpdatedAt: new Date().toISOString(),
      }
    };
    
    saveCustomFlags(updatedFlags);
    
    setSnackbar({
      open: true,
      message: `Note added to ${selectedActionCustomer.name}`,
      severity: 'success',
    });
    
    setNoteDialogOpen(false);
    setNoteText('');
  };

  const getCustomerTier = (customer, flags = null) => {
    const customerFlags = flags || customFlags[customer.email];
    const isVip = customerFlags?.isVip || customer.totalSpent >= 1000;
    
    if (isVip) return { label: 'VIP', color: colors.diamond, icon: '💎' };
    if (customer.totalSpent >= 5000) return { label: 'Diamond', color: colors.diamond, icon: '💎' };
    if (customer.totalSpent >= 2000) return { label: 'Gold', color: '#ff9800', icon: '🥇' };
    if (customer.totalSpent >= 1000) return { label: 'Silver', color: '#9e9e9e', icon: '🥈' };
    if (customer.totalOrders >= 5) return { label: 'Bronze', color: '#cd7f32', icon: '🥉' };
    return { label: 'Regular', color: colors.primary, icon: '👤' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  const formatCurrency = (amount) => `${amount?.toLocaleString()} TND`;

  const paginatedCustomers = filteredCustomers.slice(
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
            fontFamily: "'Amaranth', sans-serif",
            mb: 1,
          }}
        >
          Customer Management
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          View and manage your customer base
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.primary, 0.05) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Total Customers</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.primary }}>
                  {stats.totalCustomers}
                </Typography>
              </Box>
              <PersonIcon sx={{ fontSize: 40, color: colors.primary, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.info, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Total Orders</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.info }}>
                  {stats.totalOrders}
                </Typography>
              </Box>
              <BagIcon sx={{ fontSize: 40, color: colors.info, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.success, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Total Revenue</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.success }}>
                  {formatCurrency(stats.totalRevenue)}
                </Typography>
              </Box>
              <MoneyIcon sx={{ fontSize: 40, color: colors.success, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.warning, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Avg Order Value</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.warning }}>
                  {formatCurrency(stats.averageOrderValue)}
                </Typography>
              </Box>
              <TrendingUpIcon sx={{ fontSize: 40, color: colors.warning, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.diamond, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>VIP Customers</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.diamond }}>
                  {stats.vipCustomers}
                </Typography>
              </Box>
              <DiamondIcon sx={{ fontSize: 40, color: colors.diamond, opacity: 0.5 }} />
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
        <Tab label="All Customers" />
        <Tab label="Returning" />
        <Tab label="New (30 days)" />
        <Tab label="VIP" />
      </Tabs>

      {/* Toolbar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search by name, email, phone..."
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
            <IconButton onClick={fetchCustomers} sx={{ color: colors.primary }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Advanced Filters */}
        {showFilters && (
          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(colors.primary, 0.1)}` }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Min Orders"
                  size="small"
                  value={filters.minOrders}
                  onChange={(e) => handleFilterChange('minOrders', e.target.value)}
                  placeholder="At least X orders"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Min Spent (TND)"
                  size="small"
                  value={filters.minSpent}
                  onChange={(e) => handleFilterChange('minSpent', e.target.value)}
                  placeholder="Minimum amount spent"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="date"
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

      {/* Customers Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: alpha(colors.primary, 0.05) }}>
            <TableRow>
              <TableCell>Customer</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Orders</TableCell>
              <TableCell>Total Spent</TableCell>
              <TableCell>First Order</TableCell>
              <TableCell>Last Order</TableCell>
              <TableCell>Tier</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCustomers.map((customer) => {
              const customerFlags = customFlags[customer.email];
              const tier = getCustomerTier(customer, customerFlags);
              const isVIP = customerFlags?.isVip || customer.totalSpent >= 1000;
              const isReturning = customerFlags?.isReturning || customer.totalOrders > 1;
              
              return (
                <TableRow key={customer.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ bgcolor: isVIP ? colors.diamond : colors.primary }}>
                        {customer.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {customer.name}
                        </Typography>
                        {isVIP && (
                          <Chip
                            label="VIP"
                            size="small"
                            sx={{ height: 16, fontSize: '0.6rem', bgcolor: colors.diamond, color: 'white' }}
                          />
                        )}
                        {isReturning && !isVIP && (
                          <Chip
                            label="Returning"
                            size="small"
                            sx={{ height: 16, fontSize: '0.6rem', bgcolor: colors.success, color: 'white' }}
                          />
                        )}
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                      {customer.email}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {customer.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Badge badgeContent={customer.totalOrders} color="primary" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: colors.primary }}>
                      {formatCurrency(customer.totalSpent)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {new Date(customer.firstOrder).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {new Date(customer.lastOrderDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<span>{tier.icon}</span>}
                      label={tier.label}
                      size="small"
                      sx={{ bgcolor: alpha(tier.color, 0.1), color: tier.color, fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewCustomer(customer)} sx={{ color: colors.primary }}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Actions">
                        <IconButton size="small" onClick={(e) => handleActionClick(e, customer)} sx={{ color: colors.secondary }}>
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredCustomers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleActionClose}
        slotProps={{
          paper: {
            sx: {
              minWidth: 200,
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }
          }
        }}
      >
        {selectedActionCustomer && (customFlags[selectedActionCustomer.email]?.isReturning || selectedActionCustomer.totalOrders > 1) ? (
          <MenuItem onClick={handleRemoveReturning}>
            <ListItemIcon>
              <VerifiedIcon sx={{ color: colors.error }} />
            </ListItemIcon>
            <ListItemText primary="Remove from Returning" />
          </MenuItem>
        ) : (
          <MenuItem onClick={handleMarkAsReturning}>
            <ListItemIcon>
              <VerifiedIcon sx={{ color: colors.success }} />
            </ListItemIcon>
            <ListItemText primary="Mark as Returning Customer" />
          </MenuItem>
        )}
        
        {selectedActionCustomer && (customFlags[selectedActionCustomer.email]?.isVip || selectedActionCustomer.totalSpent >= 1000) ? (
          <MenuItem onClick={handleRemoveVIP}>
            <ListItemIcon>
              <DiamondIcon sx={{ color: colors.error }} />
            </ListItemIcon>
            <ListItemText primary="Remove from VIP" />
          </MenuItem>
        ) : (
          <MenuItem onClick={handleMarkAsVIP}>
            <ListItemIcon>
              <DiamondIcon sx={{ color: colors.diamond }} />
            </ListItemIcon>
            <ListItemText primary="Mark as VIP Customer" />
          </MenuItem>
        )}
        
        <Divider />
        
        <MenuItem onClick={handleOpenNoteDialog}>
          <ListItemIcon>
            <NoteIcon sx={{ color: colors.info }} />
          </ListItemIcon>
          <ListItemText primary="Add/Edit Note" />
        </MenuItem>
      </Menu>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: colors.primary, color: colors.white }}>
          Add Note for {selectedActionCustomer?.name}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Customer Note"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add any important information about this customer..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveNote}
            sx={{ bgcolor: colors.primary }}
          >
            Save Note
          </Button>
        </DialogActions>
      </Dialog>

      {/* Customer Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
        maxWidth="md" 
        fullWidth
        TransitionComponent={Zoom}
      >
        {selectedCustomer && (
          <>
            <DialogTitle sx={{ bgcolor: colors.primary, color: colors.white }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Customer Details - {selectedCustomer.name}</Typography>
                <IconButton onClick={() => setDetailsOpen(false)} sx={{ color: colors.white }}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Customer Info */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: colors.grayLight }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: colors.primary }}>
                      <PersonIcon sx={{ fontSize: 16, mr: 0.5 }} /> Customer Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2"><strong>Name:</strong> {selectedCustomer.name}</Typography>
                        <Typography variant="body2"><strong>Email:</strong> {selectedCustomer.email}</Typography>
                        <Typography variant="body2"><strong>Phone:</strong> {selectedCustomer.phone}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2"><strong>Address:</strong> {selectedCustomer.address}</Typography>
                        <Typography variant="body2"><strong>First Order:</strong> {formatDate(selectedCustomer.firstOrder)}</Typography>
                        <Typography variant="body2"><strong>Last Order:</strong> {formatDate(selectedCustomer.lastOrderDate)}</Typography>
                      </Grid>
                    </Grid>
                    {customFlags[selectedCustomer.email]?.note && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: alpha(colors.info, 0.1), borderRadius: '8px' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.info }}>
                          <NoteIcon sx={{ fontSize: 14, mr: 0.5 }} /> Admin Note
                        </Typography>
                        <Typography variant="body2">{customFlags[selectedCustomer.email].note}</Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Order Stats */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, borderRadius: '12px' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: colors.primary }}>
                      <BagIcon sx={{ fontSize: 16, mr: 0.5 }} /> Order Statistics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4} textAlign="center">
                        <Typography variant="h4" sx={{ fontWeight: 800, color: colors.primary }}>
                          {selectedCustomer.totalOrders}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>Total Orders</Typography>
                      </Grid>
                      <Grid item xs={4} textAlign="center">
                        <Typography variant="h4" sx={{ fontWeight: 800, color: colors.success }}>
                          {formatCurrency(selectedCustomer.totalSpent)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>Total Spent</Typography>
                      </Grid>
                      <Grid item xs={4} textAlign="center">
                        <Typography variant="h4" sx={{ fontWeight: 800, color: colors.warning }}>
                          {formatCurrency(selectedCustomer.totalSpent / selectedCustomer.totalOrders)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>Avg Order Value</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Order History */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: colors.primary }}>
                    Order History
                  </Typography>
                  <TableContainer component={Paper} sx={{ borderRadius: '12px' }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: alpha(colors.primary, 0.05) }}>
                        <TableRow>
                          <TableCell>Order #</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Items</TableCell>
                          <TableCell>Total</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedCustomer.orders.map((order) => (
                          <TableRow key={order._id} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: colors.primary }}>
                                {order.orderNumber}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">
                                {order.items?.length} item(s)
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: colors.success }}>
                                {formatCurrency(order.totalAmount)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={order.orderStatus}
                                size="small"
                                sx={{
                                  bgcolor: order.orderStatus === 'delivered' ? alpha(colors.success, 0.1) : alpha(colors.warning, 0.1),
                                  color: order.orderStatus === 'delivered' ? colors.success : colors.warning,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              {customFlags[selectedCustomer.email]?.isVip || selectedCustomer.totalSpent >= 1000 ? (
                <Button
                  variant="contained"
                  onClick={() => {
                    handleRemoveVIP();
                    setDetailsOpen(false);
                  }}
                  sx={{ bgcolor: colors.error }}
                >
                  Remove VIP
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => {
                    handleMarkAsVIP();
                    setDetailsOpen(false);
                  }}
                  sx={{ bgcolor: colors.diamond }}
                >
                  Mark as VIP
                </Button>
              )}
            </DialogActions>
          </>
        )}
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

export default Customers;