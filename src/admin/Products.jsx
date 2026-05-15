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
  FormControlLabel,
  Switch,
  Avatar,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  Divider,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Tabs,
  Tab,
  Tooltip,
  Pagination,
  InputBase,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  GridView as GridViewIcon,
  TableRows as TableRowsIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import api from '../services/api';


const alpha = (color, opacity) => {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};


const colors = {
  navyDark: '#0a1928',
  navyLight: '#1e3a5f',
  accentGold: '#73a7f6',
  white: '#ffffff',
  black: '#0a0a0a',
  grayLight: '#f5f5f5',
  primary: '#1e3a5f',
  primaryLight: '#3a5a7f',
  secondary: '#73a7f6',
  secondaryDark: '#60b0e6',
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    gender: '',
    status: '',
    stockStatus: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    category: 'Niche',
    gender: 'Unisex',
    fragranceType: 'Eau de Parfum',
    status: 'active',
    isFeatured: false,
    isBestSeller: false,
    tags: '',
    notes: '',
    sizes: [{ size: '50ml', price: 0, stock: 0 }]
  });
  
  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [moreImages, setMoreImages] = useState([]);
  const [moreImagesPreviews, setMoreImagesPreviews] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

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
      setProducts(response.data.products);
      setFilteredProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load products',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];
    
    if (filters.search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.tags?.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))
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
    
    if (filters.stockStatus) {
      filtered = filtered.filter(p => {
        const totalStock = p.sizes?.reduce((sum, size) => sum + (size.stock || 0), 0) || 0;
        if (filters.stockStatus === 'out') return totalStock === 0;
        if (filters.stockStatus === 'low') return totalStock > 0 && totalStock <= 10;
        if (filters.stockStatus === 'in') return totalStock > 10;
        return true;
      });
    }
    
    setFilteredProducts(filtered);
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      gender: '',
      status: '',
      stockStatus: '',
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        category: product.category || 'Niche',
        gender: product.gender || 'Unisex',
        fragranceType: product.fragranceType || 'Eau de Parfum',
        status: product.status || 'active',
        isFeatured: product.isFeatured || false,
        isBestSeller: product.isBestSeller || false,
        tags: product.tags ? product.tags.join(', ') : '',
        notes: product.notes || '',
        sizes: product.sizes || [{ size: '50ml', price: 0, stock: 0 }]
      });
      setMainImagePreview(product.mainImage);
      setMoreImagesPreviews(product.moreImages || []);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        shortDescription: '',
        category: 'Niche',
        gender: 'Unisex',
        fragranceType: 'Eau de Parfum',
        status: 'active',
        isFeatured: false,
        isBestSeller: false,
        tags: '',
        notes: '',
        sizes: [{ size: '50ml', price: 0, stock: 0 }]
      });
      setMainImagePreview(null);
      setMoreImagesPreviews([]);
      setMainImage(null);
      setMoreImages([]);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
    setFormLoading(false);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSwitchChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked
    });
  };

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...formData.sizes];
    newSizes[index][field] = value;
    setFormData({ ...formData, sizes: newSizes });
  };

  const addSize = () => {
    setFormData({
      ...formData,
      sizes: [...formData.sizes, { size: '50ml', price: 0, stock: 0 }]
    });
  };

  const removeSize = (index) => {
    const newSizes = formData.sizes.filter((_, i) => i !== index);
    setFormData({ ...formData, sizes: newSizes });
  };

  const handleMainImageUpload = (e) => {
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
      setMainImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMoreImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    
    if (validFiles.length !== files.length) {
      setSnackbar({
        open: true,
        message: 'Some images exceed 5MB limit',
        severity: 'error',
      });
    }
    
    setMoreImages([...moreImages, ...validFiles]);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMoreImagesPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMoreImage = (index) => {
    setMoreImages(moreImages.filter((_, i) => i !== index));
    setMoreImagesPreviews(moreImagesPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setFormLoading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('shortDescription', formData.shortDescription);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('fragranceType', formData.fragranceType);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('isFeatured', formData.isFeatured);
      formDataToSend.append('isBestSeller', formData.isBestSeller);
      formDataToSend.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim())));
      formDataToSend.append('notes', formData.notes);
      formDataToSend.append('sizes', JSON.stringify(formData.sizes));
      
      if (mainImage) {
        formDataToSend.append('mainImage', mainImage);
      }
      
      moreImages.forEach(image => {
        formDataToSend.append('moreImages', image);
      });
      
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSnackbar({
          open: true,
          message: 'Product updated successfully!',
          severity: 'success',
        });
      } else {
        await api.post('/products', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSnackbar({
          open: true,
          message: 'Product created successfully!',
          severity: 'success',
        });
      }
      
      fetchProducts();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving product:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save product',
        severity: 'error',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${productId}`);
        setSnackbar({
          open: true,
          message: 'Product deleted successfully!',
          severity: 'success',
        });
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        setSnackbar({
          open: true,
          message: 'Failed to delete product',
          severity: 'error',
        });
      }
    }
  };

  const getGenderIcon = (gender) => {
    switch(gender) {
      case 'Men': return '👨';
      case 'Women': return '👩';
      default: return '👥';
    }
  };

  const getStockStatusChip = (product) => {
    const totalStock = product.sizes?.reduce((sum, size) => sum + (size.stock || 0), 0) || 0;
    if (totalStock === 0) {
      return <Chip label="Out of Stock" size="small" sx={{ bgcolor: '#f44336', color: '#fff' }} />;
    }
    if (totalStock <= 10) {
      return <Chip label="Low Stock" size="small" sx={{ bgcolor: colors.secondary, color: colors.navyDark }} />;
    }
    return <Chip label="In Stock" size="small" sx={{ bgcolor: '#4caf50', color: '#fff' }} />;
  };

  const getStatusChip = (status) => {
    const statusColors = {
      active: { bg: '#4caf50', color: '#fff' },
      inactive: { bg: '#9e9e9e', color: '#fff' },
      'coming-soon': { bg: '#ff9800', color: '#fff' },
      discontinued: { bg: '#f44336', color: '#fff' }
    };
    const color = statusColors[status] || statusColors.inactive;
    return <Chip label={status} size="small" sx={{ bgcolor: color.bg, color: color.color }} />;
  };

  // Pagination
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
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
      {/* Centered Header */}
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
          Products Management
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Manage your fragrance products, track inventory, and update product details
        </Typography>
      </Box>

      {/* Toolbar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '16px' }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ gap: 2 }}>
          {/* Search */}
          <Paper
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              flex: 1,
              minWidth: 200,
              border: `1px solid ${alpha(colors.primary, 0.2)}`,
              borderRadius: '50px',
            }}
          >
            <InputBase
              sx={{ ml: 2, flex: 1 }}
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <IconButton type="button" sx={{ p: '10px', color: colors.primary }}>
              <SearchIcon />
            </IconButton>
          </Paper>

          {/* Filter Button */}
          <Button
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{
              borderColor: colors.primary,
              color: colors.primary,
              borderRadius: '50px',
              textTransform: 'none',
            }}
            variant="outlined"
          >
            Filters {Object.values(filters).some(v => v) && <Badge color="secondary" variant="dot" sx={{ ml: 1 }} />}
          </Button>

          {/* View Mode Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, val) => val && setViewMode(val)}
            sx={{ bgcolor: colors.grayLight, borderRadius: '50px' }}
          >
            <ToggleButton value="table" sx={{ borderRadius: '50px' }}>
              <TableRowsIcon />
            </ToggleButton>
            <ToggleButton value="grid" sx={{ borderRadius: '50px' }}>
              <GridViewIcon />
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Add Product Button */}
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
            Add Product
          </Button>
        </Stack>

        {/* Filters Panel */}
        {showFilters && (
          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(colors.primary, 0.1)}` }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Niche">Niche</MenuItem>
                    <MenuItem value="Designer">Designer</MenuItem>
                    <MenuItem value="Arab">Arab</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
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
                    <MenuItem value="discontinued">Discontinued</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Stock Status</InputLabel>
                  <Select
                    value={filters.stockStatus}
                    onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
                    label="Stock Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="in">In Stock</MenuItem>
                    <MenuItem value="low">Low Stock</MenuItem>
                    <MenuItem value="out">Out of Stock</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Button
                  fullWidth
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  sx={{
                    color: colors.primary,
                    borderRadius: '50px',
                    textTransform: 'none',
                    height: 40,
                  }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Results Count */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Showing {paginatedProducts.length} of {filteredProducts.length} products
        </Typography>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <Select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(e.target.value)}
          >
            <MenuItem value={10}>10 per page</MenuItem>
            <MenuItem value={25}>25 per page</MenuItem>
            <MenuItem value={50}>50 per page</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table View */}
      {viewMode === 'table' && (
        <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Table>
            <TableHead sx={{ bgcolor: alpha(colors.primary, 0.05) }}>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Sizes</TableCell>
                <TableCell>Price Range</TableCell>
                <TableCell>Stock Status</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
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
                    <Chip 
                      label={`${getGenderIcon(product.gender)} ${product.gender}`} 
                      size="small" 
                      sx={{ bgcolor: alpha(colors.secondary, 0.2), color: colors.navyDark }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {product.sizes?.map((size, idx) => (
                        <Chip key={idx} label={size.size} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {product.sizes?.length > 0 && (
                      <Typography variant="body2">
                        {Math.min(...product.sizes.map(s => s.price))} - {Math.max(...product.sizes.map(s => s.price))} TND
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{getStockStatusChip(product)}</TableCell>
                  <TableCell>{getStatusChip(product.status)}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenDialog(product)} sx={{ color: colors.primary }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(product._id)} sx={{ color: '#f44336' }}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <Grid container spacing={3}>
          {paginatedProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Card sx={{ borderRadius: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.mainImage}
                  alt={product.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.primary }}>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {product.shortDescription?.substring(0, 80)}...
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                    <Chip label={product.category} size="small" sx={{ bgcolor: alpha(colors.primary, 0.1), color: colors.primary }} />
                    <Chip label={`${getGenderIcon(product.gender)} ${product.gender}`} size="small" sx={{ bgcolor: alpha(colors.secondary, 0.2), color: colors.navyDark }} />
                  </Stack>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: colors.primary }}>
                    {product.sizes?.length > 0 && `${Math.min(...product.sizes.map(s => s.price))} - ${Math.max(...product.sizes.map(s => s.price))} TND`}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {getStockStatusChip(product)}
                    {getStatusChip(product.status)}
                  </Stack>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenDialog(product)} sx={{ color: colors.primary }}>
                    Edit
                  </Button>
                  <Button size="small" startIcon={<DeleteIcon />} onClick={() => handleDelete(product._id)} sx={{ color: '#f44336' }}>
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {filteredProducts.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={Math.ceil(filteredProducts.length / rowsPerPage)}
            page={page}
            onChange={(e, val) => setPage(val)}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root.Mui-selected': {
                backgroundColor: colors.primary,
                color: colors.white,
              },
            }}
          />
        </Box>
      )}

      {/* Add/Edit Product Dialog - same as before */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: colors.primary, color: colors.white }}>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Tabs value={selectedTab} onChange={(e, v) => setSelectedTab(v)} sx={{ mb: 2 }}>
            <Tab label="Basic Info" />
            <Tab label="Sizes & Pricing" />
            <Tab label="Images" />
          </Tabs>

          {selectedTab === 0 && (
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
              <TextField
                fullWidth
                label="Short Description"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleFormChange}
                multiline
                rows={2}
              />
              <TextField
                fullWidth
                label="Full Description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                multiline
                rows={4}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select name="category" value={formData.category} onChange={handleFormChange}>
                      <MenuItem value="Niche">Niche</MenuItem>
                      <MenuItem value="Designer">Designer</MenuItem>
                      <MenuItem value="Arab">Arab</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select name="gender" value={formData.gender} onChange={handleFormChange}>
                      <MenuItem value="Men">👨 Men</MenuItem>
                      <MenuItem value="Women">👩 Women</MenuItem>
                      <MenuItem value="Unisex">👥 Unisex</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Fragrance Type</InputLabel>
                    <Select name="fragranceType" value={formData.fragranceType} onChange={handleFormChange}>
                      <MenuItem value="Eau de Parfum">Eau de Parfum</MenuItem>
                      <MenuItem value="Eau de Toilette">Eau de Toilette</MenuItem>
                      <MenuItem value="Eau de Cologne">Eau de Cologne</MenuItem>
                      <MenuItem value="Extrait de Parfum">Extrait de Parfum</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select name="status" value={formData.status} onChange={handleFormChange}>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="coming-soon">Coming Soon</MenuItem>
                      <MenuItem value="discontinued">Discontinued</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <TextField
                fullWidth
                label="Tags (comma separated)"
                name="tags"
                value={formData.tags}
                onChange={handleFormChange}
                placeholder="amber, woody, floral"
              />
              <Stack direction="row" spacing={2}>
                <FormControlLabel
                  control={<Switch checked={formData.isFeatured} onChange={handleSwitchChange} name="isFeatured" />}
                  label="Featured Product"
                />
                <FormControlLabel
                  control={<Switch checked={formData.isBestSeller} onChange={handleSwitchChange} name="isBestSeller" />}
                  label="Best Seller"
                />
              </Stack>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                multiline
                rows={2}
              />
            </Stack>
          )}

          {selectedTab === 1 && (
            <Stack spacing={2}>
              {formData.sizes.map((size, index) => (
                <Card key={index} sx={{ p: 2, bgcolor: colors.grayLight }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={3}>
                      <FormControl fullWidth>
                        <InputLabel>Size</InputLabel>
                        <Select
                          value={size.size}
                          onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                        >
                        <MenuItem value="5ml">5ml</MenuItem>
                        <MenuItem value="10ml">10ml</MenuItem>
                          <MenuItem value="30ml">30ml</MenuItem>
                          <MenuItem value="50ml">50ml</MenuItem>
                          <MenuItem value="100ml">100ml</MenuItem>
                          <MenuItem value="200ml">200ml</MenuItem>
                          <MenuItem value="500ml">500ml</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Price (TND)"
                        value={size.price}
                        onChange={(e) => handleSizeChange(index, 'price', parseFloat(e.target.value))}
                        InputProps={{ startAdornment: <InputAdornment position="start">TND</InputAdornment> }}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Stock"
                        value={size.stock}
                        onChange={(e) => handleSizeChange(index, 'stock', parseInt(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <IconButton color="error" onClick={() => removeSize(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Card>
              ))}
              <Button startIcon={<AddIcon />} onClick={addSize} sx={{ alignSelf: 'flex-start' }}>
                Add Size
              </Button>
            </Stack>
          )}

          {selectedTab === 2 && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Main Image</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  {mainImagePreview && (
                    <Box sx={{ position: 'relative' }}>
                      <Avatar src={mainImagePreview} sx={{ width: 100, height: 100, borderRadius: '8px' }} />
                    </Box>
                  )}
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    sx={{ borderColor: colors.primary, color: colors.primary }}
                  >
                    Upload Main Image
                    <input type="file" hidden accept="image/*" onChange={handleMainImageUpload} />
                  </Button>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Additional Images</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                  {moreImagesPreviews.map((preview, index) => (
                    <Box key={index} sx={{ position: 'relative' }}>
                      <Avatar src={preview} sx={{ width: 80, height: 80, borderRadius: '8px' }} />
                      <IconButton
                        size="small"
                        sx={{ position: 'absolute', top: -8, right: -8, bgcolor: '#fff' }}
                        onClick={() => removeMoreImage(index)}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  sx={{ borderColor: colors.primary, color: colors.primary }}
                >
                  Upload More Images
                  <input type="file" hidden accept="image/*" multiple onChange={handleMoreImagesUpload} />
                </Button>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={formLoading}
            sx={{ bgcolor: colors.primary, '&:hover': { bgcolor: colors.primaryLight } }}
          >
            {formLoading ? <CircularProgress size={24} /> : (editingProduct ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

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


export default Products;