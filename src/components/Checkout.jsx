import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Stack,
  Divider,
  TextField,
  InputAdornment,
  Alert,
  Snackbar,
  CircularProgress,
  Avatar,
  IconButton,
  Tooltip,
  Fade,
  Dialog,
  DialogContent,
  DialogActions,
  Backdrop,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  ShoppingBag,
  LocalShipping,
  CreditCard,
  CheckCircle,
  Delete,
  Add,
  Remove,
  ArrowBack,
  VerifiedUser,
  SupportAgent,
  Storefront,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const colors = {
  navyDark: '#333399',
  navyLight: '#000080',
  white: '#ffffff',
  black: '#0a0a0a',
  grayLight: '#ffffff',
  primary: '#333399',
  primaryLight: '#000080',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
};

const Checkout = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    getCartSubtotal, 
    getShippingFee, 
    getCartTotal, 
    clearCart,
    updateQuantity,
    removeFromCart 
  } = useCart();
  
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [focusedField, setFocusedField] = useState(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    orderNotes: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    return errors;
  };

  const handlePlaceOrder = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstError = document.querySelector('.Mui-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (!agreeToTerms) {
      setSnackbar({
        open: true,
        message: 'Please agree to the terms and conditions',
        severity: 'warning',
      });
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          size: item.size,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        customer: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: `${formData.address}, ${formData.city}, ${formData.postalCode || ''}`,
        },
        subtotal: getCartSubtotal(),
        shippingFee: getShippingFee(),
        totalAmount: getCartTotal(),
        paymentMethod: 'cash_on_delivery',
        notes: formData.orderNotes,
      };

      const response = await api.post('/orders', orderData);
      setCompletedOrder(response.data.order);
      
      clearCart();
      setSuccessDialogOpen(true);
      
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

  const handleContinueShopping = () => {
    setSuccessDialogOpen(false);
    navigate('/niche');
  };

  const handleQuantityUpdate = (itemId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(itemId, newQuantity);
    }
  };

  if (cartItems.length === 0 && !successDialogOpen) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '24px' }}>
            <ShoppingBag sx={{ fontSize: 100, color: colors.primary, mb: 2, opacity: 0.3 }} />
            <Typography variant="h4" sx={{ color: colors.primary, mb: 2, fontWeight: 700, fontFamily: "'Assistant', sans-serif" }}>
              Your Cart is Empty
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', mb: 4, maxWidth: 400, mx: 'auto' }}>
              Looks like you haven't added any items to your cart yet.
              Explore our collection and find your perfect fragrance.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{
                bgcolor: colors.primary,
                borderRadius: '50px',
                px: 5,
                py: 1.5,
                fontSize: '1rem',
                '&:hover': { bgcolor: colors.primaryLight },
              }}
            >
              Continue Shopping
            </Button>
          </Paper>
        </motion.div>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="xl" sx={{ py: 4, bgcolor: colors.grayLight, minHeight: '100vh' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: colors.primary,
                fontFamily: "'Assistant', sans-serif",
                mb: 1,
                fontSize: { xs: '1.8rem', md: '2.5rem' },
              }}
            >
              Checkout
            </Typography>
            <Typography variant="body1" sx={{ color: '#666' }}>
              Complete your purchase
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={4}>
          {/* Left Column - Order Items */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Paper sx={{ borderRadius: '20px', overflow: 'hidden', mb: 3 }}>
                <Box sx={{ p: 3, bgcolor: colors.primary, color: colors.white }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Your Order
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {cartItems.length} item(s) in your cart
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      onClick={() => navigate('/')}
                      sx={{ color: colors.white, borderColor: 'rgba(255,255,255,0.3)' }}
                      variant="outlined"
                    >
                      Add Items
                    </Button>
                  </Stack>
                </Box>

                <Box sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    {cartItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Paper sx={{ p: 2, borderRadius: '16px', border: `1px solid ${colors.grayLight}` }}>
                          <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
                            <Avatar
                              src={item.image}
                              variant="rounded"
                              sx={{ width: 80, height: 80, borderRadius: '12px' }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.primary }}>
                                {item.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                Size: {item.size}
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primaryLight, mt: 1 }}>
                                {item.price} TND
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: colors.grayLight, borderRadius: '8px', px: 1 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                                  sx={{ color: colors.primary }}
                                >
                                  <Remove fontSize="small" />
                                </IconButton>
                                <Typography sx={{ minWidth: 32, textAlign: 'center', fontWeight: 600 }}>
                                  {item.quantity}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                                  sx={{ color: colors.primary }}
                                >
                                  <Add fontSize="small" />
                                </IconButton>
                              </Box>
                              <IconButton
                                onClick={() => removeFromCart(item.id)}
                                sx={{ color: colors.error }}
                              >
                                <Delete />
                              </IconButton>
                            </Box>
                          </Stack>
                        </Paper>
                      </motion.div>
                    ))}
                  </Stack>
                </Box>
              </Paper>

              {/* Trust Badges - Simplified */}
              <Paper sx={{ p: 3, borderRadius: '20px', textAlign: 'center' }}>
                <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap">
                  <Stack alignItems="center" spacing={1}>
                    <VerifiedUser sx={{ color: colors.success, fontSize: 32 }} />
                    <Typography variant="caption">Secure Checkout</Typography>
                  </Stack>
                  <Stack alignItems="center" spacing={1}>
                    <LocalShipping sx={{ color: colors.primary, fontSize: 32 }} />
                    <Typography variant="caption">Fast Delivery</Typography>
                  </Stack>
                  <Stack alignItems="center" spacing={1}>
                    <SupportAgent sx={{ color: colors.primaryLight, fontSize: 32 }} />
                    <Typography variant="caption">Customer Support</Typography>
                  </Stack>
                </Stack>
              </Paper>
            </motion.div>
          </Grid>

          {/* Right Column - Checkout Form */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Order Summary Card */}
              <Paper sx={{ p: 3, borderRadius: '20px', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary, mb: 2 }}>
                  Order Summary
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: '#666' }}>Subtotal</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: colors.primary }}>{getCartSubtotal()} TND</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: '#666' }}>Shipping</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: colors.primary }}>
                      {getShippingFee() === 0 ? 'FREE' : `${getShippingFee()} TND`}
                    </Typography>
                  </Stack>
                  {getCartSubtotal() < 150 && getCartSubtotal() > 0 && (
                    <Alert severity="info" sx={{ borderRadius: '12px', py: 0.5 }}>
                      <Typography variant="caption">
                        Add <strong>{150 - getCartSubtotal()} TND</strong> more for FREE shipping!
                      </Typography>
                    </Alert>
                  )}
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary }}>Total</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: colors.primaryLight }}>
                      {getCartTotal()} TND
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>

              {/* Shipping Information Card */}
              <Paper sx={{ p: 3, borderRadius: '20px', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary, mb: 2 }}>
                  Shipping Information
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleFormChange}
                    onFocus={() => setFocusedField('fullName')}
                    onBlur={() => setFocusedField(null)}
                    error={!!formErrors.fullName}
                    helperText={formErrors.fullName}
                    placeholder="John Doe"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: focusedField === 'fullName' ? colors.primaryLight : colors.grayMedium }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    placeholder="john@example.com"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: focusedField === 'email' ? colors.primaryLight : colors.grayMedium }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    error={!!formErrors.phone}
                    helperText={formErrors.phone}
                    placeholder="+216 XX XXX XXX"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: focusedField === 'phone' ? colors.primaryLight : colors.grayMedium }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Street Address"
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    onFocus={() => setFocusedField('address')}
                    onBlur={() => setFocusedField(null)}
                    error={!!formErrors.address}
                    helperText={formErrors.address}
                    placeholder="123 Main Street"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn sx={{ color: focusedField === 'address' ? colors.primaryLight : colors.grayMedium }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 7 }}>
                      <TextField
                        fullWidth
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleFormChange}
                        onFocus={() => setFocusedField('city')}
                        onBlur={() => setFocusedField(null)}
                        error={!!formErrors.city}
                        helperText={formErrors.city}
                        placeholder="Tunis"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <TextField
                        fullWidth
                        label="Postal Code (Optional)"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleFormChange}
                        placeholder="1000"
                      />
                    </Grid>
                  </Grid>
                  <TextField
                    fullWidth
                    label="Order Notes (Optional)"
                    name="orderNotes"
                    multiline
                    rows={2}
                    value={formData.orderNotes}
                    onChange={handleFormChange}
                    placeholder="Special delivery instructions or notes..."
                  />
                </Stack>
              </Paper>

              {/* Payment Method Card - Cash on Delivery Only */}
              <Paper sx={{ p: 3, borderRadius: '20px', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary, mb: 2 }}>
                  Payment Method
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: alpha(colors.primaryLight, 0.05),
                    border: `1px solid ${alpha(colors.primaryLight, 0.2)}`,
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <CreditCard sx={{ color: colors.primaryLight, fontSize: 32 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.primary }}>
                        Cash on Delivery
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        Pay when you receive your order
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Paper>

              {/* Terms & Conditions */}
              <Paper sx={{ p: 3, borderRadius: '20px', mb: 3 }}>
                <FormControlLabel
                  control={<Checkbox checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)} />}
                  label={
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      I agree to the{' '}
                      <span style={{ color: colors.primary, fontWeight: 600 }}>Terms & Conditions</span>
                    </Typography>
                  }
                />
              </Paper>

              {/* Place Order Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handlePlaceOrder}
                disabled={submitting || !agreeToTerms}
                sx={{
                  bgcolor: colors.primary,
                  borderRadius: '50px',
                  py: 1.8,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  mb: 1.5,
                  '&:hover': {
                    bgcolor: colors.primaryLight,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {submitting ? (
                  <CircularProgress size={24} sx={{ color: colors.white }} />
                ) : (
                  `Place Order • ${getCartTotal()} TND`
                )}
              </Button>

              {/* Back to Cart Link */}
              <Button
                fullWidth
                startIcon={<ArrowBack />}
                onClick={() => navigate('/cart')}
                sx={{
                  color: '#666',
                  textTransform: 'none',
                  '&:hover': { color: colors.primary },
                }}
              >
                Back to Cart
              </Button>
            </motion.div>
          </Grid>
        </Grid>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          TransitionComponent={Fade}
        >
          <Alert severity={snackbar.severity} sx={{ borderRadius: '12px' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={() => {}}
        maxWidth="sm"
        fullWidth
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
            sx: { backgroundColor: 'rgba(10, 25, 40, 0.8)' }
          }
        }}
      >
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: alpha(colors.success, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <CheckCircle sx={{ fontSize: 60, color: colors.success }} />
            </Box>
            
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: colors.primary,
                fontFamily: "'Assistant', sans-serif",
                mb: 2,
              }}
            >
              Order Confirmed! 🎉
            </Typography>
            
            <Typography variant="body1" sx={{ color: '#666', mb: 1 }}>
              Thank you for your purchase!
            </Typography>
            
            {completedOrder && (
              <Typography variant="body2" sx={{ color: colors.primaryLight, fontWeight: 600, mb: 3 }}>
                Order #{completedOrder.orderNumber}
              </Typography>
            )}
            
            <Box
              sx={{
                bgcolor: alpha(colors.primary, 0.05),
                p: 2,
                borderRadius: '12px',
                mb: 3,
              }}
            >
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  📧 Confirmation email sent to your email
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  📦 You will receive a call within 24 hours
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  💳 Payment: Cash on Delivery
                </Typography>
              </Stack>
            </Box>
          </motion.div>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={handleContinueShopping}
            sx={{
              bgcolor: colors.primary,
              borderRadius: '50px',
              px: 4,
              py: 1.2,
              textTransform: 'none',
              '&:hover': { bgcolor: colors.primaryLight },
            }}
          >
            <Storefront sx={{ mr: 1 }} />
            Continue Shopping
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const alpha = (color, opacity) => {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

export default Checkout;