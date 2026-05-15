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
  FilterAlt as FilterAltIcon,
  ArrowForward,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const colors = {
  navyDark: '#0a1928',
  navyLight: '#1e3a5f',
  navyGlow: '#1e3a5f',
  white: '#ffffff',
  black: '#000000',
  grayLight: '#f5f5f5',
  accentGold: '#4072bb',
};

const All = () => {
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
    fetchAllProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, filters, priceRange]);

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
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
      console.error('Error fetching all products:', error);
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
    if (currentSize && currentSize.stock > 0) {
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

  // Product Card Component - Exact styling from Home.jsx
  const ProductCard = ({ product, onAddToCart, onViewDetails, selectedSize, onSizeChange }) => {
    const { addToCart } = useCart();
    const [localSelectedSize, setLocalSelectedSize] = useState(selectedSize || product.sizes?.[0]);
    const [imageLoaded, setImageLoaded] = useState(false);

    const getGenderIcon = (gender) => {
      if (gender === 'Men') return <MaleIcon sx={{ fontSize: 14 }} />;
      if (gender === 'Women') return <FemaleIcon sx={{ fontSize: 14 }} />;
      return <PeopleIcon sx={{ fontSize: 14 }} />;
    };

    const getStockStatus = () => {
      const hasStock = product.sizes?.some(size => size.stock > 0);
      if (hasStock) {
        return { label: 'In Stock', icon: <CheckCircleIcon sx={{ fontSize: 12, color: '#4caf50' }} />, color: '#4caf50' };
      }
      return { label: 'Out of Stock', icon: <RemoveCircleIcon sx={{ fontSize: 12, color: '#f44336' }} />, color: '#f44336' };
    };

    const handleSizeChange = (newSize) => {
      setLocalSelectedSize(newSize);
      if (onSizeChange) onSizeChange(product._id, newSize);
    };

    const handleAddToCartClick = (e) => {
      e.stopPropagation();
      if (localSelectedSize && localSelectedSize.stock > 0) {
        addToCart(product, localSelectedSize, 1);
      }
      if (onAddToCart) onAddToCart(product);
    };

    const currentSize = localSelectedSize || product.sizes?.[0];
    const stockStatus = getStockStatus();

    return (
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.320, 1] }}
      >
        <Card sx={{ 
          borderRadius: '12px', 
          overflow: 'hidden', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          background: colors.white,
          border: 'none',
          boxShadow: { xs: 'none', md: '0 2px 8px rgba(10, 25, 40, 0.06)' },
          transition: 'all 0.5s cubic-bezier(0.23, 1, 0.320, 1)',
          '&:hover': {
            boxShadow: { xs: 'none', md: '0 24px 48px rgba(10, 25, 40, 0.12), 0 12px 24px rgba(115, 167, 246, 0.08)' },
            borderColor: alpha(colors.accentGold, 0.3),
          },
        }}>
          {/* Image Container with Overlay Effects */}
          <Box 
            sx={{ 
              position: 'relative', 
              cursor: 'pointer',
              overflow: 'hidden',
              bg: colors.grayLight,
              aspectRatio: '1/1.2',
            }} 
            onClick={() => onViewDetails(product)}
          >
            <motion.div
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.6 }}
              style={{ 
                width: '100%', 
                height: '100%',
                perspective: '1000px',
              }}
            >
              <CardMedia
                component="img"
                image={product.mainImage}
                alt={product.name}
                onLoad={() => setImageLoaded(true)}
                sx={{ 
                  objectFit: 'initial', 
                  width: '100%',
                  height: '100%',
                  transition: 'opacity 0.3s ease',
                  opacity: imageLoaded ? 1 : 0.7,
                  filter: 'drop-shadow(0 20px 40px rgba(10, 25, 40, 0.15))',
                  transform: 'translateZ(20px)',
                }}
              />
            </motion.div>

            {/* Premium Overlay Gradient */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(135deg, ${alpha(colors.navyDark, 0)} 0%, ${alpha(colors.navyDark, 0.15)} 100%)`,
                pointerEvents: 'none',
              }}
            />

            {/* Gender Badge - Subtle Positioning */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.6,
                  bgcolor: alpha(colors.white, 0.55),
                  backdropFilter: 'blur(8px)',
                  px: 1.5,
                  py: 0.6,
                  borderRadius: '4px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                {getGenderIcon(product.gender)}
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: colors.navyDark }}>
                  {product.gender || 'Unisex'}
                </Typography>
              </Box>
            </motion.div>
          </Box>
          
          {/* Content Section - Premium Typography & Spacing */}
          <CardContent sx={{ 
            flexGrow: 1, 
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}>

            {/* Product Name */}
            <Box>
              <Typography 
                variant="body1" 
                title={product.name.length > 41 ? product.name : ''}
                sx={{ 
                  fontWeight: 700, 
                  color: '#333333',
                  fontSize: '0.85rem',
                  lineHeight: 1.2,
                  fontFamily: "'Montserrat', sans-serif",
                  letterSpacing: '0.01em',
                  cursor: product.name.length > 41 ? 'help' : 'default',
                }}
              >
                {product.name.length > 41 ? product.name.substring(0, 31) + '...' : product.name}
              </Typography>
            </Box>

            {/* Size Selection - Horizontal Buttons */}
            <Box>
              <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                {product.sizes?.map((size) => (
                  <Button
                    key={size.size}
                    onClick={() => handleSizeChange(size)}
                    disabled={size.stock === 0}
                    sx={{
                      minWidth: 'auto',
                      px: 1.5,
                      py: 0.6,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      height: 32,
                      border: `2px solid ${localSelectedSize?.size === size.size ? colors.accentGold : alpha(colors.navyDark, 0.2)}`,
                      bgcolor: localSelectedSize?.size === size.size ? alpha(colors.accentGold, 0.1) : 'transparent',
                      color: localSelectedSize?.size === size.size ? colors.accentGold : colors.navyDark,
                      borderRadius: '50px',
                      transition: 'all 0.3s ease',
                      cursor: size.stock === 0 ? 'not-allowed' : 'pointer',
                      opacity: size.stock === 0 ? 0.5 : 1,
                      '&:hover:not(:disabled)': {
                        bgcolor: alpha(colors.accentGold, 0.15),
                        borderColor: colors.accentGold,
                      },
                      '&:disabled': {
                        cursor: 'not-allowed',
                      },
                    }}
                  >
                    {size.size}
                  </Button>
                ))}
              </Stack>
            </Box>

            {/* Price Display */}
            <Box sx={{ textAlign: 'left', mt: { xs: 0.5, md: 0 } }}>
              <Typography 
                sx={{ 
                  fontWeight: 900, 
                  color: colors.black,
                  fontSize: { xs: '1.65rem', sm: '1.65rem', md: '1.4rem' },
                  lineHeight: 1,
                  fontFamily: "'Montserrat', sans-serif",
                  letterSpacing: '0.02em',
                }}
              >
                {currentSize?.price || 0} <span style={{ fontSize: '0.45em', fontWeight: 700, marginLeft: '4px', color: colors.black }}>TND</span>
              </Typography>
            </Box>

            {/* Buy Now Button */}
            <motion.div style={{ width: '100%' }}>
              <Button
                fullWidth
                variant="contained"
                size="small"
                onClick={handleAddToCartClick}
                disabled={!currentSize || currentSize.stock === 0}
                sx={{
                  bgcolor: colors.accentGold,
                  color: colors.white,
                  borderRadius: '50px',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.08em',
                  py: 0.9,
                  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.320, 1)',
                  fontFamily: "'Montserrat', sans-serif",
                  border: `2px solid ${colors.accentGold}`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    bgcolor: colors.navyLight,
                    transition: 'left 0.4s ease',
                    zIndex: -1,
                  },
                  '&:hover:not(.Mui-disabled)': {
                    bgcolor: colors.navyLight,
                    borderColor: colors.navyLight,
                    color: colors.white,
                    boxShadow: '0 8px 20px rgba(115, 167, 246, 0.25)',
                    '&::before': {
                      left: 0,
                    },
                  },
                  '&.Mui-disabled': {
                    bgcolor: alpha(colors.black, 0.25),
                    color: colors.white,
                    borderColor: alpha(colors.black, 0.25),
                    cursor: 'not-allowed',
                  },
                }}
              >
                Buy Now
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: colors.black }}>
            Filter & Sort
          </Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.black, mb: 1.5 }}>
            Search
          </Typography>
          <TextField
            fullWidth
            placeholder="Search fragrances..."
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
              color: filters.bestSeller ? colors.white : colors.accentGold,
            }}
          >
            Best Sellers
          </Button>
        </Box>

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
        <Box sx={{ mb: 4, mt: { xs: 4, md: 2, lg: 2 } }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              fontFamily: "'Montserrat', sans-serif",
              color: colors.navyDark,
              mb: 1,
              fontSize: { xs: '1.8rem', md: '2.5rem' },
            }}
          >
            All Fragrances
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#666',
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            Discover our complete collection of premium fragrances
          </Typography>
        </Box>

        {/* Mobile Filter Bar */}
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
            elevation={0}
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
                placeholder="Search fragrances..."
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
                  color: filters.bestSeller ? colors.white : colors.accentGold,
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

        {/* Results Count */}
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
            <Grid container spacing={3}>
              {paginatedProducts.map((product) => (
                <Grid size={{ xs: 6, sm: 6, md: 4, lg: 3 }} key={product._id}>
                  <ProductCard
                    product={product}
                    onViewDetails={handleViewDetails}
                    selectedSize={selectedCardSize[product._id]}
                    onSizeChange={handleSizeChange}
                  />
                </Grid>
              ))}
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
                bgcolor: colors.accentGold,
                borderRadius: '50px',
                py: 1.5,
                color: colors.white,
                '&:hover': { bgcolor: colors.navyLight, color: colors.white },
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

export default All;