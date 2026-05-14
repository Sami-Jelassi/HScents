import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Stack,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Breadcrumbs,
  Link as MuiLink,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ShoppingBag,
  FavoriteBorder,
  Favorite,
  Share,
  LocalShipping,
  Security,
  Refresh,
  Person,
  Email,
  Phone,
  LocationOn,
  Close as CloseIcon,
  CheckCircle,
  CreditCard,
  Storefront,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const colors = {
  navyDark: '#0a1928',
  navyLight: '#1e3a5f',
  accentGold: '#F6D673',
  white: '#ffffff',
  black: '#1e3a5f',
  grayLight: '#f5f5f5',
  primary: '#000000',
  primaryLight: '#333333',
  secondary: '#F6D673',
  secondaryDark: '#e6c660',
  success: '#4caf50',
  error: '#f44336',
  men: '#2196f3',
  women: '#e91e63',
  unisex: '#9c27b0',
};

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedImage, setSelectedImage] = useState(0);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Order form state
  const [orderForm, setOrderForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/slug/${slug}`);
      setProduct(response.data.product);
      if (response.data.product.sizes && response.data.product.sizes.length > 0) {
        setSelectedSize(response.data.product.sizes[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setSnackbar({
        open: true,
        message: 'Product not found',
        severity: 'error',
      });
      setTimeout(() => navigate('/fragrances'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (selectedSize && selectedSize.stock > 0) {
      addToCart(product, selectedSize, quantity);
      setSnackbar({
        open: true,
        message: `${product.name} (${selectedSize.size}) added to cart!`,
        severity: 'success',
      });
    }
  };

  const handleBuyNow = () => {
    setOrderDialogOpen(true);
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (selectedSize?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  const handleOrderFormChange = (e) => {
    setOrderForm({
      ...orderForm,
      [e.target.name]: e.target.value
    });
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      });
    }
  };

  const validateOrderForm = () => {
    const errors = {};
    if (!orderForm.fullName.trim()) errors.fullName = 'Full name is required';
    if (!orderForm.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(orderForm.email)) errors.email = 'Email is invalid';
    if (!orderForm.phone.trim()) errors.phone = 'Phone number is required';
    if (!orderForm.address.trim()) errors.address = 'Address is required';
    return errors;
  };

// Update the handlePlaceOrder function in ProductDetail.jsx
const handlePlaceOrder = async () => {
  const errors = validateOrderForm();
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }

  setSubmitting(true);
  try {
    const orderData = {
      items: [{
        productId: product._id,
        name: product.name,
        size: selectedSize.size,
        price: selectedSize.price,
        quantity: quantity,
        image: product.mainImage
      }],
      customer: orderForm,
      paymentMethod: 'cash_on_delivery'
    };

    const response = await api.post('/orders', orderData);
    
    setSnackbar({
      open: true,
      message: `Order placed successfully! Order #${response.data.order.orderNumber}`,
      severity: 'success',
    });
    
    setTimeout(() => {
      setOrderDialogOpen(false);
      setOrderForm({
        fullName: '',
        email: '',
        phone: '',
        address: '',
      });
    }, 2000);
  } catch (error) {
    console.error('Error placing order:', error);
    setSnackbar({
      open: true,
      message: error.response?.data?.message || 'Failed to place order. Please try again.',
      severity: 'error',
    });
  } finally {
    setSubmitting(false);
  }
};

  const getGenderColor = (gender) => {
    switch(gender) {
      case 'Men': return colors.men;
      case 'Women': return colors.women;
      default: return colors.unisex;
    }
  };

  const getGenderIcon = (gender) => {
    switch(gender) {
      case 'Men': return '👨';
      case 'Women': return '👩';
      default: return '👥';
    }
  };

  const getStockStatus = () => {
    if (!selectedSize) return { label: 'Out of Stock', color: colors.error };
    if (selectedSize.stock === 0) return { label: 'Out of Stock', color: colors.error };
    if (selectedSize.stock <= 5) return { label: `Low Stock (${selectedSize.stock} left)`, color: colors.secondaryDark };
    return { label: 'In Stock', color: colors.success };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: colors.black }} />
      </Box>
    );
  }

  if (!product) {
    return null;
  }

  const stockStatus = getStockStatus();
  const genderColor = getGenderColor(product.gender);

  return (
    <Box sx={{ bgcolor: colors.white, minHeight: '100vh', pt: 4, pb: 8 }}>
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <MuiLink component={Link} to="/" underline="hover" color="inherit">Home</MuiLink>
          <MuiLink component={Link} to="/arab" underline="hover" color="inherit">Arab Fragrances</MuiLink>
          <Typography color={colors.black}>{product.name}</Typography>
        </Breadcrumbs>

        {/* Product Main Section */}
        <Grid container spacing={4}>
          {/* Product Images - Left Side */}
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper sx={{ borderRadius: '16px', overflow: 'hidden', mb: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <img
                  src={product.moreImages?.[selectedImage] || product.mainImage}
                  alt={product.name}
                  style={{ width: '100%', height: 'auto', cursor: 'pointer' }}
                />
              </Paper>
              
              {product.moreImages && product.moreImages.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                  <Paper
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: selectedImage === -1 ? `2px solid ${colors.accentGold}` : '1px solid #ddd',
                      transition: 'all 0.2s',
                      flexShrink: 0,
                      '&:hover': { borderColor: colors.accentGold },
                    }}
                    onClick={() => setSelectedImage(-1)}
                  >
                    <img src={product.mainImage} alt="main" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Paper>
                  {product.moreImages.map((img, idx) => (
                    <Paper
                      key={idx}
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: selectedImage === idx ? `2px solid ${colors.accentGold}` : '1px solid #ddd',
                        transition: 'all 0.2s',
                        flexShrink: 0,
                        '&:hover': { borderColor: colors.accentGold },
                      }}
                      onClick={() => setSelectedImage(idx)}
                    >
                      <img src={img} alt={`view ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Paper>
                  ))}
                </Stack>
              )}
            </motion.div>
          </Grid>

          {/* Product Info - Right Side */}
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Category and Badges */}
              <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Chip 
                  label={product.category} 
                  sx={{ bgcolor: alpha(colors.black, 0.05), color: colors.black, fontWeight: 500 }} 
                />
                <Chip 
                  icon={<span>{getGenderIcon(product.gender)}</span>}
                  label={product.gender || 'Unisex'} 
                  sx={{ bgcolor: alpha(genderColor, 0.1), color: genderColor, fontWeight: 500 }} 
                />
                {product.isBestSeller && (
                  <Chip 
                    label="⭐ Best Seller" 
                    sx={{ bgcolor: colors.accentGold, color: colors.black, fontWeight: 700 }} 
                  />
                )}
                {product.isFeatured && (
                  <Chip 
                    label="🔥 Featured" 
                    sx={{ bgcolor: colors.black, color: colors.white, fontWeight: 700 }} 
                  />
                )}
              </Stack>

              {/* Title */}
              <Typography variant="h3" sx={{ fontWeight: 800, color: colors.black, mb: 2, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
                {product.name}
              </Typography>

              {/* Short Description */}
              {product.shortDescription && (
                <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
                  {product.shortDescription}
                </Typography>
              )}

              {/* Price */}
              <Typography variant="h3" sx={{ fontWeight: 800, color: colors.primary, mb: 3, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
                {selectedSize?.price || Math.min(...product.sizes.map(s => s.price))} TND
              </Typography>

              {/* Size Selection */}
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.black, mb: 2 }}>
                Select Size
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {product.sizes.map((size) => (
                  <Grid size={{ xs: 4, sm: 3 }} key={size.size}>
                    <Paper
                      sx={{
                        p: 1.5,
                        textAlign: 'center',
                        cursor: size.stock > 0 ? 'pointer' : 'not-allowed',
                        borderRadius: '12px',
                        border: selectedSize?.size === size.size ? `2px solid ${colors.accentGold}` : '1px solid #ddd',
                        opacity: size.stock === 0 ? 0.5 : 1,
                        bgcolor: selectedSize?.size === size.size ? alpha(colors.accentGold, 0.1) : 'transparent',
                        transition: 'all 0.2s',
                        '&:hover': size.stock > 0 && { borderColor: colors.accentGold },
                      }}
                      onClick={() => size.stock > 0 && setSelectedSize(size)}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.primary }}>
                        {size.size}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: colors.primary }}>
                        {size.price} TND
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Stock Status */}
              <Alert 
                severity={stockStatus.color === colors.success ? 'success' : 'warning'} 
                sx={{ mb: 3, borderRadius: '12px' }}
                icon={stockStatus.color === colors.success ? <CheckCircle /> : <CloseIcon />}
              >
                {stockStatus.label}
              </Alert>

              {/* Quantity and Actions - Company Level Buttons */}
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                alignItems="center" 
                sx={{ mb: 4 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', border: `1px solid #ddd`, borderRadius: '50px', width: { xs: '100%', sm: 'auto' }, justifyContent: 'center' }}>
                  <IconButton onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} sx={{ px: 2 }}>
                    -
                  </IconButton>
                  <Typography sx={{ px: 3, minWidth: 40, textAlign: 'center' }}>{quantity}</Typography>
                  <IconButton onClick={() => handleQuantityChange(1)} disabled={quantity >= (selectedSize?.stock || 0)} sx={{ px: 2 }}>
                    +
                  </IconButton>
                </Box>
                
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingBag />}
                  onClick={handleAddToCart}
                  disabled={!selectedSize || selectedSize.stock === 0}
                  fullWidth={isMobile}
                  sx={{
                    bgcolor: colors.black,
                    borderRadius: '50px',
                    px: 4,
                    py: 1.2,
                    flex: 1,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': { bgcolor: colors.accentGold, color: colors.black },
                  }}
                >
                  Add to Cart
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleBuyNow}
                  disabled={!selectedSize || selectedSize.stock === 0}
                  fullWidth={isMobile}
                  sx={{
                    borderColor: colors.black,
                    color: colors.black,
                    borderRadius: '50px',
                    px: 4,
                    py: 1.2,
                    flex: 1,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': { borderColor: colors.accentGold, color: colors.accentGold, bgcolor: alpha(colors.accentGold, 0.05) },
                  }}
                >
                  Buy Now
                </Button>
              </Stack>

              {/* Features */}
              <Paper sx={{ p: 3, borderRadius: '16px', bgcolor: colors.grayLight, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 4 }}>
                    <Stack alignItems="center">
                      <LocalShipping sx={{ color: colors.black, fontSize: 32 }} />
                      <Typography variant="caption" sx={{ textAlign: 'center', mt: 1, fontWeight: 500 }}>Free Shipping<br />Over 150 TND</Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Stack alignItems="center">
                      <Security sx={{ color: colors.black, fontSize: 32 }} />
                      <Typography variant="caption" sx={{ textAlign: 'center', mt: 1, fontWeight: 500 }}>Secure Payment<br />100% Safe</Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Stack alignItems="center">
                      <Refresh sx={{ color: colors.black, fontSize: 32 }} />
                      <Typography variant="caption" sx={{ textAlign: 'center', mt: 1, fontWeight: 500 }}>Easy Returns<br />14 Days Policy</Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>

              {/* Description - Only shown if exists */}
              {product.description && (
                <Paper sx={{ borderRadius: '16px', overflow: 'hidden', mb: 2 }}>
                  <Box sx={{ p: 2, borderBottom: `1px solid ${colors.grayLight}`, bgcolor: alpha(colors.black, 0.02) }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.black }}>Product Description</Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: '#666', lineHeight: 1.6 }}>
                      {product.description}
                    </Typography>
                  </Box>
                </Paper>
              )}

              {/* Notes - Only shown if exists */}
              {product.notes && (
                <Paper sx={{ borderRadius: '16px', overflow: 'hidden' }}>
                  <Box sx={{ p: 2, borderBottom: `1px solid ${colors.grayLight}`, bgcolor: alpha(colors.black, 0.02) }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.black }}>Additional Notes</Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6 }}>{product.notes}</Typography>
                  </Box>
                </Paper>
              )}
            </motion.div>
          </Grid>
        </Grid>

        {/* Order Form Section - Below Product */}
        <Box sx={{ mt: 6 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: colors.black, 
              mb: 3, 
              textAlign: 'center',
              fontFamily: "'Amaranth', sans-serif",
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 60,
                height: 3,
                bgcolor: colors.accentGold,
                borderRadius: 2,
              }
            }}
          >
            Quick Order Form
          </Typography>
          
          <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={orderForm.fullName}
                  onChange={handleOrderFormChange}
                  error={!!formErrors.fullName}
                  helperText={formErrors.fullName}
                  placeholder="John Doe"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: colors.accentGold }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={orderForm.email}
                  onChange={handleOrderFormChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  placeholder="john@example.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: colors.accentGold }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={orderForm.phone}
                  onChange={handleOrderFormChange}
                  error={!!formErrors.phone}
                  helperText={formErrors.phone}
                  placeholder="+216 XX XXX XXX"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: colors.accentGold }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Delivery Address"
                  name="address"
                  multiline
                  rows={1}
                  value={orderForm.address}
                  onChange={handleOrderFormChange}
                  error={!!formErrors.address}
                  helperText={formErrors.address}
                  placeholder="Your complete address"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn sx={{ color: colors.accentGold }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: alpha(colors.accentGold, 0.1), borderRadius: '12px' }}>
                  <CreditCard sx={{ color: colors.accentGold }} />
                  <Typography variant="body2" sx={{ color: colors.black }}>
                    Payment Method: <strong>Cash on Delivery</strong> - Pay when you receive your order
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  sx={{
                    bgcolor: colors.black,
                    borderRadius: '50px',
                    py: 1.5,
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    '&:hover': { bgcolor: colors.accentGold, color: colors.black },
                  }}
                >
                  {submitting ? 'Placing Order...' : 'Place Order (Cash on Delivery 9 TND)'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* Order Confirmation Dialog */}
        <Dialog open={orderDialogOpen} onClose={() => setOrderDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: colors.black, color: colors.white, textAlign: 'center' }}>
            Order Summary
            <IconButton
              sx={{ position: 'absolute', right: 8, top: 8, color: colors.white }}
              onClick={() => setOrderDialogOpen(false)}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Paper sx={{ p: 2, mb: 3, bgcolor: colors.grayLight, borderRadius: '12px' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.black, mb: 2 }}>
                Order Details
              </Typography>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Product</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{product.name} ({selectedSize?.size})</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Quantity</Typography>
                <Typography variant="body2">{quantity}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Unit Price</Typography>
                <Typography variant="body2">{selectedSize?.price} TND</Typography>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body1" sx={{ fontWeight: 700 }}>Total</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: colors.accentGold }}>
                  {selectedSize?.price * quantity} TND
                </Typography>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2, borderRadius: '12px' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.black, mb: 2 }}>
                Customer Information
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Person sx={{ color: colors.accentGold, fontSize: 18 }} />
                  <Typography variant="body2">{orderForm.fullName || 'Not provided'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Email sx={{ color: colors.accentGold, fontSize: 18 }} />
                  <Typography variant="body2">{orderForm.email || 'Not provided'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Phone sx={{ color: colors.accentGold, fontSize: 18 }} />
                  <Typography variant="body2">{orderForm.phone || 'Not provided'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <LocationOn sx={{ color: colors.accentGold, fontSize: 18 }} />
                  <Typography variant="body2">{orderForm.address || 'Not provided'}</Typography>
                </Box>
              </Stack>
            </Paper>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setOrderDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handlePlaceOrder}
              disabled={submitting}
              sx={{
                bgcolor: colors.black,
                '&:hover': { bgcolor: colors.accentGold, color: colors.black },
              }}
            >
              {submitting ? 'Processing...' : 'Confirm Order'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} sx={{ borderRadius: '12px' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

// Helper function for alpha
const alpha = (color, opacity) => {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

export default ProductDetail;