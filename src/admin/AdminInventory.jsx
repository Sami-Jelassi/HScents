import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  TextField,
  InputAdornment,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  LinearProgress,
  alpha,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  RemoveRedEye as EyeIcon,
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
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
};

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingSizes, setEditingSizes] = useState([]);
  const [updatingStock, setUpdatingStock] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showOutOfStockOnly, setShowOutOfStockOnly] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, selectedCategory, selectedStatus, showLowStockOnly, showOutOfStockOnly]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data.products);
      calculateStats(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load inventory',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (productsData) => {
    let totalStock = 0;
    let totalValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    productsData.forEach(product => {
      product.sizes?.forEach(size => {
        totalStock += size.stock || 0;
        totalValue += (size.price || 0) * (size.stock || 0);
        if ((size.stock || 0) <= 5 && (size.stock || 0) > 0) {
          lowStockCount++;
        }
        if ((size.stock || 0) === 0) {
          outOfStockCount++;
        }
      });
    });

    setStats({
      totalProducts: productsData.length,
      totalStock,
      totalValue,
      lowStockCount,
      outOfStockCount,
    });
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }

    // Low stock filter
    if (showLowStockOnly) {
      filtered = filtered.filter(p => 
        p.sizes?.some(size => size.stock <= 5 && size.stock > 0)
      );
    }

    // Out of stock filter
    if (showOutOfStockOnly) {
      filtered = filtered.filter(p => 
        p.sizes?.some(size => size.stock === 0)
      );
    }

    setFilteredProducts(filtered);
    setPage(0);
  };

  const handleOpenEditDialog = (product) => {
    setEditingProduct(product);
    setEditingSizes(JSON.parse(JSON.stringify(product.sizes)));
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingProduct(null);
    setEditingSizes([]);
  };

  const handleSizeStockChange = (index, newStock) => {
    const updatedSizes = [...editingSizes];
    updatedSizes[index].stock = parseInt(newStock) || 0;
    setEditingSizes(updatedSizes);
  };

  const handleSaveStock = async () => {
    try {
      setUpdatingStock(true);
      
      // Update each size stock individually
      for (const size of editingSizes) {
        const originalSize = editingProduct.sizes.find(s => s.size === size.size);
        if (originalSize && originalSize.stock !== size.stock) {
          const difference = size.stock - originalSize.stock;
          await api.put(`/products/${editingProduct._id}/stock`, {
            size: size.size,
            quantity: difference > 0 ? difference : Math.abs(difference)
          });
        }
      }
      
      setSnackbar({
        open: true,
        message: 'Inventory updated successfully!',
        severity: 'success',
      });
      
      fetchProducts();
      handleCloseEditDialog();
    } catch (error) {
      console.error('Error updating stock:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update inventory',
        severity: 'error',
      });
    } finally {
      setUpdatingStock(false);
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) {
      return { label: 'Out of Stock', color: colors.error, icon: '🔴' };
    }
    if (stock <= 5) {
      return { label: 'Low Stock', color: colors.warning, icon: '🟡' };
    }
    return { label: 'In Stock', color: colors.success, icon: '🟢' };
  };

  const getTotalStock = (product) => {
    return product.sizes?.reduce((sum, size) => sum + (size.stock || 0), 0) || 0;
  };

  const getTotalValue = (product) => {
    return product.sizes?.reduce((sum, size) => sum + ((size.price || 0) * (size.stock || 0)), 0) || 0;
  };

  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const uniqueCategories = [...new Set(products.map(p => p.category))];

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
            fontFamily: "'Montserrat', sans-serif",
            mb: 1,
          }}
        >
          Inventory Management
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Track and manage product stock levels across all sizes
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.primary, 0.05) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Total Products</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.primary }}>
                  {stats.totalProducts}
                </Typography>
              </Box>
              <InventoryIcon sx={{ fontSize: 40, color: colors.primary, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.info, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Total Units</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.info }}>
                  {stats.totalStock}
                </Typography>
              </Box>
              <TrendingUpIcon sx={{ fontSize: 40, color: colors.info, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.secondary, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Inventory Value</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.secondary }}>
                  {stats.totalValue.toLocaleString()} TND
                </Typography>
              </Box>
              <Typography variant="h2" sx={{ opacity: 0.5 }}>💰</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.warning, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Low Stock Items</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.warning }}>
                  {stats.lowStockCount}
                </Typography>
              </Box>
              <WarningIcon sx={{ fontSize: 40, color: colors.warning, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.error, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Out of Stock</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.error }}>
                  {stats.outOfStockCount}
                </Typography>
              </Box>
              <CancelIcon sx={{ fontSize: 40, color: colors.error, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: colors.primary }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {uniqueCategories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="coming-soon">Coming Soon</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={showLowStockOnly}
                  onChange={(e) => setShowLowStockOnly(e.target.checked)}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: colors.warning } }}
                />
              }
              label="Low Stock Only"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={showOutOfStockOnly}
                  onChange={(e) => setShowOutOfStockOnly(e.target.checked)}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: colors.error } }}
                />
              }
              label="Out of Stock Only"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={1}>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchProducts} sx={{ color: colors.primary }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* Inventory Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: alpha(colors.primary, 0.05) }}>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Sizes & Stock</TableCell>
              <TableCell>Total Stock</TableCell>
              <TableCell>Inventory Value</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProducts.map((product) => (
              <TableRow key={product._id} hover>
                <TableCell>
                  <Avatar src={product.mainImage} sx={{ width: 50, height: 50, borderRadius: '8px' }} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{product.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>{product.slug}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={product.category} size="small" sx={{ bgcolor: alpha(colors.primary, 0.1), color: colors.primary }} />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                    {product.sizes?.map((size, idx) => {
                      const status = getStockStatus(size.stock);
                      return (
                        <Tooltip key={idx} title={`${size.size}: ${size.stock} units`}>
                          <Chip
                            label={`${size.size}: ${size.stock}`}
                            size="small"
                            sx={{
                              bgcolor: alpha(status.color, 0.1),
                              color: status.color,
                              border: `1px solid ${alpha(status.color, 0.3)}`,
                              fontWeight: 600,
                            }}
                          />
                        </Tooltip>
                      );
                    })}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Badge
                    badgeContent={getTotalStock(product)}
                    color={getTotalStock(product) === 0 ? "error" : getTotalStock(product) <= 10 ? "warning" : "success"}
                    sx={{ '& .MuiBadge-badge': { fontSize: '0.8rem', height: 20, minWidth: 20 } }}
                  >
                    <InventoryIcon sx={{ color: '#666' }} />
                  </Badge>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: colors.primary }}>
                    {getTotalValue(product).toLocaleString()} TND
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Update Stock">
                    <IconButton size="small" onClick={() => handleOpenEditDialog(product)} sx={{ color: colors.primary }}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Edit Stock Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: colors.primary, color: colors.white }}>
          Update Inventory - {editingProduct?.name}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Alert severity="info" sx={{ borderRadius: '12px' }}>
              Update stock quantities for each size. Changes will be reflected immediately.
            </Alert>
            
            {editingSizes.map((size, index) => {
              const status = getStockStatus(size.stock);
              return (
                <Card key={index} sx={{ p: 2, bgcolor: colors.grayLight }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={3}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary }}>
                        {size.size}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        Price: {size.price} TND
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Stock Quantity"
                        value={size.stock}
                        onChange={(e) => handleSizeStockChange(index, e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">📦</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Chip
                        label={status.label}
                        sx={{
                          bgcolor: alpha(status.color, 0.1),
                          color: status.color,
                          fontWeight: 600,
                        }}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Value: {(size.price * size.stock).toLocaleString()} TND
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>
              );
            })}

            <Paper sx={{ p: 2, bgcolor: alpha(colors.secondary, 0.1), borderRadius: '12px' }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#666' }}>Total Units:</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: colors.primary }}>
                    {editingSizes.reduce((sum, s) => sum + s.stock, 0)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#666' }}>Total Value:</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: colors.secondary }}>
                    {editingSizes.reduce((sum, s) => sum + (s.price * s.stock), 0).toLocaleString()} TND
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={updatingStock ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={handleSaveStock}
            disabled={updatingStock}
            sx={{ bgcolor: colors.primary, '&:hover': { bgcolor: colors.primaryLight } }}
          >
            {updatingStock ? 'Updating...' : 'Update Stock'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Low Stock Alert Banner */}
      {stats.lowStockCount > 0 && (
        <Alert 
          severity="warning" 
          sx={{ 
            mt: 3, 
            borderRadius: '12px',
            '& .MuiAlert-icon': { color: colors.warning }
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography>
              ⚠️ You have {stats.lowStockCount} product size(s) with low stock (5 or fewer units remaining).
              Please restock soon!
            </Typography>
            <Button 
              size="small" 
              onClick={() => setShowLowStockOnly(true)}
              sx={{ color: colors.warning }}
            >
              View Low Stock Items
            </Button>
          </Stack>
        </Alert>
      )}

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

export default AdminInventory;