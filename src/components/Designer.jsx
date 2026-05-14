import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  Stack,
  CircularProgress,
  TextField,
  InputAdornment,
  Select,
  FormControl,
  MenuItem,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
  alpha,
  Paper,
  Slider,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingBag,
  Close as CloseIcon,
  Sort,
  Male as MaleIcon,
  Female as FemaleIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  FilterList as FilterListIcon,
  FilterAlt as FilterAltIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const colors = {
  black: '#000000',
  navyDark: '#16385a',
  navyBlue: '#416992',
  white: '#ffffff',
  grayLight: '#f5f5f5',
  primary: '#000000',
  accentGold: '#F6D673',
};

const Designer = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeDialogOpen, setSizeDialogOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  
  const [selectedCardSize, setSelectedCardSize] = useState({});
  
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'newest',
    inStock: false,
    bestSeller: false,
  });
  
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const itemsPerPage = isMobile ? 8 : 12;

  useEffect(() => {
    fetchArabProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, filters, priceRange]);

  const fetchArabProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products?category=Designer');
      setProducts(response.data.products);
      setFilteredProducts(response.data.products);
      
      const initialSizes = {};
      response.data.products.forEach(product => {
        if (product.sizes && product.sizes.length > 0) {
          initialSizes[product._id] = product.sizes[0];
        }
      });
      setSelectedCardSize(initialSizes);
      
      const maxProductPrice = Math.max(...response.data.products.flatMap(p => p.sizes.map(s => s.price)));
      setMaxPrice(maxProductPrice);
      setPriceRange([0, maxProductPrice]);
    } catch (error) {
      console.error('Error fetching Designer products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];
    
    if (filters.search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    if (filters.inStock) {
      filtered = filtered.filter(p => p.sizes?.some(size => size.stock > 0));
    }
    
    if (filters.bestSeller) {
      filtered = filtered.filter(p => p.isBestSeller === true);
    }
    
    filtered = filtered.filter(p => {
      const minProductPrice = Math.min(...p.sizes.map(s => s.price));
      return minProductPrice >= priceRange[0] && minProductPrice <= priceRange[1];
    });
    
    switch (filters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => Math.min(...a.sizes.map(s => s.price)) - Math.min(...b.sizes.map(s => s.price)));
        break;
      case 'price-desc':
        filtered.sort((a, b) => Math.max(...b.sizes.map(s => s.price)) - Math.max(...a.sizes.map(s => s.price)));
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'best-selling':
        filtered.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        break;
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    setFilteredProducts(filtered);
    setPage(1);
  };

  const handleSizeChange = (productId, size) => {
    setSelectedCardSize(prev => ({
      ...prev,
      [productId]: size
    }));
  };

  const handleAddToCart = (product) => {
    const currentSize = selectedCardSize[product._id];
    if (currentSize) {
      addToCart(product, currentSize, 1);
    }
  };

  const handleConfirmAddToCart = () => {
    if (selectedProduct && selectedSize) {
      addToCart(selectedProduct, selectedSize, 1);
      setSizeDialogOpen(false);
      setSelectedProduct(null);
      setSelectedSize(null);
    }
  };

  const handleViewDetails = (product) => {
    navigate(`/product/${product.slug}`);
  };

  const getGenderIcon = (gender) => {
    if (gender === 'Men') return <MaleIcon sx={{ fontSize: 14 }} />;
    if (gender === 'Women') return <FemaleIcon sx={{ fontSize: 14 }} />;
    return <PeopleIcon sx={{ fontSize: 14 }} />;
  };

  const getStockStatus = (product) => {
    const hasStock = product.sizes?.some(size => size.stock > 0);
    if (hasStock) {
      return { label: 'In Stock', icon: <CheckCircleIcon sx={{ fontSize: 12, color: '#4caf50' }} />, color: '#4caf50' };
    }
    return { label: 'Out of Stock', icon: <RemoveCircleIcon sx={{ fontSize: 12, color: '#f44336' }} />, color: '#f44336' };
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      sortBy: 'newest',
      inStock: false,
      bestSeller: false,
    });
    setPriceRange([0, maxPrice]);
  };

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Filter Drawer Component for Mobile
  const FilterDrawer = () => (
    <Drawer
      anchor="left"
      open={filterDrawerOpen}
      onClose={() => setFilterDrawerOpen(false)}
      sx={{
        '& .MuiDrawer-paper': {
          width: '85%',
          maxWidth: 320,
          backgroundColor: colors.white,
          borderRadius: '0 20px 20px 0',
        },
      }}
    >
      <Box sx={{ p: 3, backgroundColor:'transparent' }}>
        {/* Drawer Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, backgroundColor:'transparent' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: colors.black }}>
            Filter & Sort
          </Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Search */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.black, mb: 1.5 }}>
            Search
          </Typography>
          <TextField
            fullWidth
            placeholder="Votre prochaine fragrance vous attend..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: colors.black }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Sort By */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.black, mb: 1.5 }}>
            Sort By
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="best-selling">Best Selling</MenuItem>
              <MenuItem value="name-asc">Name A-Z</MenuItem>
              <MenuItem value="name-desc">Name Z-A</MenuItem>
              <MenuItem value="price-asc">Price: Low to High</MenuItem>
              <MenuItem value="price-desc">Price: High to Low</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Availability */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.black, mb: 1.5 }}>
            Availability
          </Typography>
          <Button
            fullWidth
            variant={filters.inStock ? "contained" : "outlined"}
            onClick={() => setFilters({ ...filters, inStock: !filters.inStock })}
            sx={{
              borderRadius: '50px',
              textTransform: 'none',
              mb: 1,
              bgcolor: filters.inStock ? colors.black : 'transparent',
              borderColor: colors.black,
              color: filters.inStock ? colors.white : colors.black,
            }}
          >
            In Stock Only
          </Button>
          <Button
            fullWidth
            variant={filters.bestSeller ? "contained" : "outlined"}
            onClick={() => setFilters({ ...filters, bestSeller: !filters.bestSeller })}
            sx={{
              borderRadius: '50px',
              textTransform: 'none',
              bgcolor: filters.bestSeller ? colors.accentGold : 'transparent',
              borderColor: colors.accentGold,
              color: filters.bestSeller ? colors.black : colors.accentGold,
            }}
          >
            Best Sellers
          </Button>
        </Box>

        {/* Price Range */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.black, mb: 1.5 }}>
            Price Range
          </Typography>
          <Slider
            value={priceRange}
            onChange={(e, val) => setPriceRange(val)}
            max={maxPrice}
            sx={{ color: colors.black }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" sx={{ color: '#666' }}>
              {priceRange[0]} TND
            </Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>
              {priceRange[1]} TND
            </Typography>
          </Box>
        </Box>

        {/* Clear Filters Button */}
        <Button
          fullWidth
          variant="outlined"
          onClick={clearFilters}
          sx={{
            borderRadius: '50px',
            textTransform: 'none',
            borderColor: colors.black,
            color: colors.black,
            mt: 2,
          }}
        >
          Clear All Filters
        </Button>
      </Box>
    </Drawer>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: colors.black }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: colors.white, minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4, mt: { xs: 4, md: -6, lg: -8 } }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              fontFamily: "'Amaranth', sans-serif",
              color: colors.navyDark,
              mb: 1,
              fontSize: { xs: '1.8rem', md: '2.5rem' },
            }}
          >
            Designer Fragrance's
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#666',
              fontFamily: "'Amaranth', sans-serif",
            }}
          >
            Discover the rich heritage of Designer perfumery
          </Typography>
        </Box>

        {/* Mobile Filter Bar - Icon + Text on left, Total on right */}
        {isMobile ? (
          <Paper 
            sx={{ 
              p: 1.5, 
              mb: 3, 
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => setFilterDrawerOpen(true)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterAltIcon sx={{ color: colors.navyDark }} />
              <Typography variant="body1" sx={{ fontWeight: 600, color: colors.navyDark }}>
                Filter & Sort
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: colors.navyDark }}>
              {filteredProducts.length} products
            </Typography>
          </Paper>
        ) : (
          /* Desktop Filters Bar */
          <Paper sx={{ p: 2, mb: 4, borderRadius: '12px', overflow: 'auto' }} elevation={0}>
            <Stack 
              direction="row" 
              spacing={2} 
              alignItems="center"
              sx={{ 
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <TextField
                placeholder="Votre prochaine fragrance vous attend..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                size="small"
                sx={{ minWidth: 180, flex: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: colors.black }} />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl size="small" sx={{ minWidth: 130 }}>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  displayEmpty
                  startAdornment={
                    <InputAdornment position="start">
                      <Sort sx={{ color: colors.black, fontSize: 18 }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="best-selling">Best Selling</MenuItem>
                  <MenuItem value="price-asc">Price: Low to High</MenuItem>
                  <MenuItem value="price-desc">Price: High to Low</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant={filters.inStock ? "contained" : "outlined"}
                onClick={() => setFilters({ ...filters, inStock: !filters.inStock })}
                size="small"
                sx={{
                  borderRadius: '50px',
                  textTransform: 'none',
                  bgcolor: filters.inStock ? colors.black : 'transparent',
                  borderColor: colors.black,
                  color: filters.inStock ? colors.white : colors.black,
                }}
              >
                In Stock Only
              </Button>

              <Button
                variant={filters.bestSeller ? "contained" : "outlined"}
                onClick={() => setFilters({ ...filters, bestSeller: !filters.bestSeller })}
                size="small"
                sx={{
                  borderRadius: '50px',
                  textTransform: 'none',
                  bgcolor: filters.bestSeller ? colors.accentGold : 'transparent',
                  borderColor: colors.accentGold,
                  color: filters.bestSeller ? colors.black : colors.accentGold,
                }}
              >
                Best Sellers
              </Button>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ color: '#666', whiteSpace: 'nowrap' }}>
                  Price:
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: colors.black }}>
                  {priceRange[0]} - {priceRange[1]} TND
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ mt: 2, px: 1 }}>
              <Slider
                value={priceRange}
                onChange={(e, val) => setPriceRange(val)}
                max={maxPrice}
                sx={{ color: colors.black }}
                size="small"
              />
            </Box>
          </Paper>
        )}

        {/* Results Count - Desktop only */}
        {!isMobile && (
          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
            {filteredProducts.length} products found
          </Typography>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '16px' }}>
            <Typography variant="h6" sx={{ color: colors.black, mb: 1 }}>
              No products found
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Try adjusting your filters or search criteria
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={2}>
              {paginatedProducts.map((product, index) => {
                const currentSize = selectedCardSize[product._id] || product.sizes?.[0];
                const stockStatus = getStockStatus(product);
                
                return (
                  <Grid size={{ xs: 6, sm: 6, md: 4, lg: 3 }} key={product._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                    >
                      <Card sx={{ 
                        borderRadius: '16px', 
                        overflow: 'hidden', 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                        },
                      }}>
                        <Box 
                          sx={{ position: 'relative', cursor: 'pointer' }} 
                          onClick={() => handleViewDetails(product)}
                        >
                          <CardMedia
                            component="img"
                            height={isMobile ? 200 : 240}
                            image={product.mainImage}
                            alt={product.name}
                            sx={{ objectFit: 'cover', width: '100%' }}
                          />
                          {product.isBestSeller && (
                            <Chip
                              label="Bestseller"
                              size="small"
                              sx={{ 
                                position: 'absolute', 
                                top: 8, 
                                left: 8, 
                                bgcolor: colors.accentGold, 
                                color: colors.black, 
                                fontWeight: 700,
                                fontSize: '0.65rem',
                                height: 22,
                              }}
                            />
                          )}
                        </Box>
                        
                        <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                            <Chip
                              icon={getGenderIcon(product.gender)}
                              label={product.gender || 'Unisex'}
                              size="small"
                              sx={{ 
                                bgcolor: alpha(colors.black, 0.05), 
                                color: colors.black,
                                fontSize: '0.65rem',
                                height: 22,
                              }}
                            />
                            <Chip
                              icon={stockStatus.icon}
                              label={stockStatus.label}
                              size="small"
                              sx={{ 
                                bgcolor: alpha(stockStatus.color, 0.1), 
                                color: stockStatus.color,
                                fontSize: '0.65rem',
                                height: 22,
                              }}
                            />
                          </Stack>

                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 700, 
                              color: colors.black, 
                              mt: 1,
                              mb: 0.5,
                              fontSize: { xs: '0.9rem', sm: '1rem' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {product.name}
                          </Typography>

                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#666', 
                              display: 'block',
                              mb: 1.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              minHeight: 32,
                            }}
                          >
                            {product.shortDescription || product.description?.substring(0, 80) || 'No description available'}
                          </Typography>

                          <Divider sx={{ my: 1 }} />

                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                            <FormControl size="small" sx={{ minWidth: 80 }}>
                              <Select
                                value={currentSize?.size || ''}
                                onChange={(e) => {
                                  const newSize = product.sizes.find(s => s.size === e.target.value);
                                  if (newSize) handleSizeChange(product._id, newSize);
                                }}
                                sx={{ 
                                  fontSize: '0.75rem',
                                  height: 32,
                                  '& .MuiSelect-select': { py: 0.5 },
                                }}
                              >
                                {product.sizes?.map((size) => (
                                  <MenuItem key={size.size} value={size.size}>
                                    {size.size}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Typography variant="h6" sx={{ fontWeight: 900, color: colors.black, fontSize: { xs: '1rem', sm: '1.4rem' }, ml:2,  }}>
                              {currentSize?.price || 0} TND
                            </Typography>
                          </Stack>

                          <Button
                            fullWidth
                            variant="contained"
                            size="medium"
                            startIcon={<ShoppingBag />}
                            onClick={() => handleAddToCart(product)}
                            disabled={!currentSize || currentSize.stock === 0}
                            sx={{
                              bgcolor: colors.navyBlue,
                              color: colors.white,
                              borderRadius: '50px',
                              textTransform: 'none',
                              fontWeight: 600,
                              py: 0.75,
                              '&:hover': { 
                                bgcolor: colors.accentGold, 
                                color: colors.black,
                              },
                              '&.Mui-disabled': {
                                bgcolor: alpha(colors.black, 0.3),
                                color: colors.white,
                              },
                            }}
                          >
                            Add to Cart
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                );
              })}
            </Grid>

            {/* Pagination */}
            {filteredProducts.length > itemsPerPage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <Pagination
                  count={Math.ceil(filteredProducts.length / itemsPerPage)}
                  page={page}
                  onChange={(e, val) => setPage(val)}
                  sx={{
                    '& .MuiPaginationItem-root.Mui-selected': {
                      backgroundColor: colors.black,
                      color: colors.white,
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}

        {/* Size Selection Dialog */}
        <Dialog open={sizeDialogOpen} onClose={() => setSizeDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ bgcolor: colors.black, color: colors.white }}>
            Select Size
            <IconButton
              sx={{ position: 'absolute', right: 8, top: 8, color: colors.white }}
              onClick={() => setSizeDialogOpen(false)}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body1" sx={{ mb: 2, color: colors.black }}>
              Select size for {selectedProduct?.name}
            </Typography>
            <Grid container spacing={2}>
              {selectedProduct?.sizes.map((size) => (
                <Grid size={{ xs: 6 }} key={size.size}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: selectedSize?.size === size.size ? `2px solid ${colors.accentGold}` : '1px solid #ddd',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: colors.accentGold },
                    }}
                    onClick={() => setSelectedSize(size)}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: colors.black }}>
                        {size.size}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: colors.accentGold }}>
                        {size.price} TND
                      </Typography>
                      <Chip
                        label={size.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        size="small"
                        sx={{ mt: 1, bgcolor: size.stock > 0 ? alpha('#4caf50', 0.1) : alpha('#f44336', 0.1), color: size.stock > 0 ? '#4caf50' : '#f44336' }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Button
              fullWidth
              variant="contained"
              disabled={!selectedSize || selectedSize.stock === 0}
              onClick={handleConfirmAddToCart}
              sx={{
                mt: 3,
                bgcolor: colors.navyBlue,
                borderRadius: '50px',
                py: 1.5,
                '&:hover': { bgcolor: colors.accentGold, color: colors.black },
              }}
            >
              Add to Cart - {selectedSize?.price} TND
            </Button>
          </DialogContent>
        </Dialog>

        {/* Mobile Filter Drawer */}
        <FilterDrawer />
      </Container>
    </Box>
  );
};

export default Designer;