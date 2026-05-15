import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Pagination,
  Button,
  alpha,
  Divider,
  IconButton,
  Fade,
  Zoom,
  Container,
  Drawer,
  Badge,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Breadcrumbs,
  Link,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  TablePagination,
  Tooltip,
  CardActionArea,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  People as PeopleIcon,
  Close as CloseIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
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
};

const Category = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('table');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0,
    lowStockCount: 0,
  });

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    gender: '',
    status: '',
    minPrice: '',
    maxPrice: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      const allProducts = response.data.products;
      setProducts(allProducts);
      setFilteredProducts(allProducts);
      
      // Calculate stats
      const totalStock = allProducts.reduce((sum, p) => 
        sum + (p.sizes?.reduce((s, size) => s + (size.stock || 0), 0) || 0), 0);
      const totalValue = allProducts.reduce((sum, p) => 
        sum + (p.sizes?.reduce((s, size) => s + ((size.price || 0) * (size.stock || 0)), 0) || 0), 0);
      const lowStockCount = allProducts.filter(p => 
        p.sizes?.some(size => size.stock <= 5 && size.stock > 0)).length;
      
      setStats({
        totalProducts: allProducts.length,
        totalStock,
        totalValue,
        lowStockCount,
      });
      
      const uniqueCategories = [...new Set(allProducts.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];
    
    if (filters.search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    
    if (filters.gender) {
      filtered = filtered.filter(p => p.gender === filters.gender);
    }
    
    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    
    if (filters.minPrice) {
      filtered = filtered.filter(p => 
        Math.min(...p.sizes.map(s => s.price)) >= parseFloat(filters.minPrice)
      );
    }
    
    if (filters.maxPrice) {
      filtered = filtered.filter(p => 
        Math.max(...p.sizes.map(s => s.price)) <= parseFloat(filters.maxPrice)
      );
    }
    
    setFilteredProducts(filtered);
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      gender: '',
      status: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const getGenderIcon = (gender) => {
    switch(gender) {
      case 'Men': return <MaleIcon sx={{ fontSize: 16 }} />;
      case 'Women': return <FemaleIcon sx={{ fontSize: 16 }} />;
      default: return <PeopleIcon sx={{ fontSize: 16 }} />;
    }
  };

  const getStockStatus = (product) => {
    const totalStock = product.sizes?.reduce((sum, size) => sum + (size.stock || 0), 0) || 0;
    if (totalStock === 0) return { label: 'Out of Stock', color: '#f44336', icon: '🔴' };
    if (totalStock <= 10) return { label: 'Low Stock', color: colors.secondary, icon: '🟡' };
    return { label: 'In Stock', color: '#4caf50', icon: '🟢' };
  };

  const getCategoryStats = (category) => {
    const categoryProducts = products.filter(p => p.category === category);
    const totalStock = categoryProducts.reduce((sum, p) => 
      sum + (p.sizes?.reduce((s, size) => s + (size.stock || 0), 0) || 0), 0);
    return { count: categoryProducts.length, stock: totalStock };
  };

  const paginatedProducts = filteredProducts.slice(
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
      {/* Header Section */}
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
          Category Management
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Manage and organize products by categories
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.primary, 0.05) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Total Categories</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.primary }}>
                  {categories.length}
                </Typography>
              </Box>
              <CategoryIcon sx={{ fontSize: 40, color: colors.primary, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.secondary, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Total Products</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.primary }}>
                  {stats.totalProducts}
                </Typography>
              </Box>
              <InventoryIcon sx={{ fontSize: 40, color: colors.secondary, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.accentGold, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Inventory Value</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.primary }}>
                  {stats.totalValue.toLocaleString()} TND
                </Typography>
              </Box>
              <MoneyIcon sx={{ fontSize: 40, color: colors.accentGold, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.primaryLight, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Low Stock Items</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#f44336' }}>
                  {stats.lowStockCount}
                </Typography>
              </Box>
              <TrendingUpIcon sx={{ fontSize: 40, color: colors.primaryLight, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Categories Grid */}
      <Typography variant="h5" sx={{ fontWeight: 700, color: colors.primary, mb: 3 }}>
        Product Categories
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {/* All Categories Card */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card
            sx={{
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: selectedCategory === 'all' ? 'scale(1.02)' : 'scale(1)',
              boxShadow: selectedCategory === 'all' ? `0 4px 20px ${alpha(colors.primary, 0.3)}` : '0 2px 8px rgba(0,0,0,0.05)',
              border: selectedCategory === 'all' ? `2px solid ${colors.primary}` : `1px solid ${alpha(colors.primary, 0.1)}`,
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' },
            }}
            onClick={() => {
              setSelectedCategory('all');
              handleFilterChange('category', '');
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <CategoryIcon sx={{ fontSize: 48, color: colors.primary, mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary }}>All Products</Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>{stats.totalProducts} products</Typography>
              <Chip 
                label={`${stats.totalStock} units`} 
                size="small" 
                sx={{ mt: 1, bgcolor: alpha(colors.primary, 0.1), color: colors.primary }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Individual Category Cards */}
        {categories.map((category) => {
          const stats = getCategoryStats(category);
          return (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={category}>
              <Card
                sx={{
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: selectedCategory === category ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: selectedCategory === category ? `0 4px 20px ${alpha(colors.secondary, 0.3)}` : '0 2px 8px rgba(0,0,0,0.05)',
                  border: selectedCategory === category ? `2px solid ${colors.secondary}` : `1px solid ${alpha(colors.primary, 0.1)}`,
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' },
                }}
                onClick={() => {
                  setSelectedCategory(category);
                  handleFilterChange('category', category);
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: alpha(colors.secondary, 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1,
                    }}
                  >
                    <CategoryIcon sx={{ fontSize: 32, color: colors.secondaryDark }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary }}>{category}</Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>{stats.count} products</Typography>
                  <Chip 
                    label={`${stats.stock} units`} 
                    size="small" 
                    sx={{ mt: 1, bgcolor: alpha(colors.secondary, 0.2), color: colors.primary }}
                  />
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Products Table */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: colors.primary }}>
          Products in {filters.category || 'All Categories'}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            sx={{ width: 250 }}
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
        </Box>
      </Box>

      {/* Advanced Filters Panel */}
      <Collapse in={showFilters}>
        <Paper sx={{ p: 2, mb: 3, borderRadius: '12px', bgcolor: colors.grayLight }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2.4}>
              <FormControl fullWidth size="small">
                <InputLabel>Gender</InputLabel>
                <Select
                  value={filters.gender}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                  label="Gender"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Men">Men</MenuItem>
                  <MenuItem value="Women">Women</MenuItem>
                  <MenuItem value="Unisex">Unisex</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="coming-soon">Coming Soon</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                fullWidth
                type="number"
                label="Min Price"
                size="small"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">TND</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                fullWidth
                type="number"
                label="Max Price"
                size="small"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">TND</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Button
                fullWidth
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                sx={{ color: colors.primary, height: 40 }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {/* Products Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: alpha(colors.primary, 0.05) }}>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Sizes</TableCell>
              <TableCell>Price Range</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProducts.map((product) => {
              const stockStatus = getStockStatus(product);
              return (
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
                    <Chip 
                      icon={getGenderIcon(product.gender)}
                      label={product.gender} 
                      size="small" 
                      sx={{ bgcolor: alpha(colors.secondary, 0.2), color: colors.navyDark }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {product.sizes?.map((size, idx) => (
                        <Tooltip key={idx} title={`Stock: ${size.stock}`}>
                          <Chip 
                            label={`${size.size} - ${size.price} TND`} 
                            size="small" 
                            variant="outlined"
                            sx={{ 
                              borderColor: colors.primary, 
                              color: colors.primary,
                              opacity: size.stock === 0 ? 0.5 : 1,
                            }}
                          />
                        </Tooltip>
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: colors.primary }}>
                      {Math.min(...product.sizes.map(s => s.price))} - {Math.max(...product.sizes.map(s => s.price))} TND
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`${stockStatus.icon} ${stockStatus.label}`}
                      size="small"
                      sx={{ bgcolor: alpha(stockStatus.color, 0.1), color: stockStatus.color, fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={product.status} 
                      size="small" 
                      sx={{ 
                        bgcolor: product.status === 'active' ? alpha('#4caf50', 0.1) : alpha('#9e9e9e', 0.1),
                        color: product.status === 'active' ? '#4caf50' : '#9e9e9e',
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
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

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '16px', mt: 3 }}>
          <Typography variant="h6" sx={{ color: colors.primary, mb: 1 }}>
            No products found
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Try adjusting your filters or add new products
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

// Collapse component for animations
const Collapse = ({ in: inProp, children }) => {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={inProp ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ overflow: 'hidden' }}
    >
      {children}
    </motion.div>
  );
};

export default Category;