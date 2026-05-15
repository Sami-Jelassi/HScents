import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Divider,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Badge,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Google,
  Facebook,
  Apple,
  PersonAdd,
  Home as HomeIcon,
  CalendarToday,
  CloudUpload,
  PhotoCamera,
  Close as CloseIcon,
  CheckCircle,
  Security,
  Phone,
  AlternateEmail,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/auth';

// ======================
// THEME COLORS (Matching CSS Variables)
// ======================
const colors = {
  navyDark: '#333399',
  navyLight: '#000080',
  navyGlow: '#1a1a8c',
  white: '#ffffff',
  black: '#000000',
  grayLight: '#f5f5f5',
  accentGold: '#000080',
};

// Enhanced Forgot Password Component with Date of Birth and API Integration
const ForgotPasswordDialog = ({ open, onClose, onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resetToken, setResetToken] = useState('');

  const steps = ['Verify Identity', 'Enter OTP', 'Reset Password'];

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const validateIdentity = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    return Object.keys(newErrors).length === 0;
  };

  const validateOTP = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit code' });
      return false;
    }
    return true;
  };

  const validatePasswords = () => {
    const newErrors = {};
    if (!newPassword) newErrors.newPassword = 'New password is required';
    else if (newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyIdentity = async () => {
    if (!validateIdentity()) return;
    setLoading(true);
    setErrors({});
    
    try {
      await authService.verifyIdentity(email, dateOfBirth);
      setActiveStep(1);
      // Start resend timer
      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      setErrors({ 
        general: error.response?.data?.message || 'Identity verification failed. Please check your credentials.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!validateOTP()) return;
    setLoading(true);
    setErrors({});
    
    try {
      const otpString = otp.join('');
      const response = await authService.verifyOTP(email, otpString);
      setResetToken(response.resetToken);
      setActiveStep(2);
    } catch (error) {
      setErrors({ 
        otp: error.response?.data?.message || 'Invalid OTP. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validatePasswords()) return;
    setLoading(true);
    setErrors({});
    
    try {
      await authService.resetPassword(resetToken, newPassword);
      onSuccess();
      onClose();
      // Reset all states
      setActiveStep(0);
      setEmail('');
      setDateOfBirth('');
      setOtp(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      setResetToken('');
    } catch (error) {
      setErrors({ 
        general: error.response?.data?.message || 'Password reset failed. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    try {
      await authService.resendOTP(email);
      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      setErrors({ 
        general: error.response?.data?.message || 'Failed to resend OTP. Please try again.' 
      });
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setActiveStep(0);
      setEmail('');
      setDateOfBirth('');
      setOtp(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      setResendTimer(0);
      setResetToken('');
    }, 300);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            {errors.general && (
              <Alert severity="error" sx={{ borderRadius: '12px' }}>
                {errors.general}
              </Alert>
            )}
            
            <Card sx={{ backgroundColor: colors.grayLight, borderRadius: '16px' }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: colors.navyLight, mb: 2, fontFamily: "'Assistant', sans-serif" }}>
                  For security purposes, please verify your identity using your registered email and date of birth.
                </Typography>
              </CardContent>
            </Card>
            
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              placeholder="hello@navifragrances.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: colors.navyLight }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': { borderColor: colors.accentGold },
                  '&.Mui-focused fieldset': { borderColor: colors.accentGold },
                },
              }}
            />
            
            <TextField
              fullWidth
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              error={!!errors.dateOfBirth}
              helperText={errors.dateOfBirth}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday sx={{ color: colors.navyLight }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': { borderColor: colors.accentGold },
                  '&.Mui-focused fieldset': { borderColor: colors.accentGold },
                },
              }}
            />
          </Stack>
        );
      
      case 1:
        return (
          <Stack spacing={3}>
            <Card sx={{ backgroundColor: colors.grayLight, borderRadius: '16px' }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: colors.navyLight, mb: 1, fontFamily: "'Assistant', sans-serif" }}>
                  We've sent a verification code to:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: colors.navyDark, fontFamily: "'Assistant', sans-serif" }}>
                  {email}
                </Typography>
              </CardContent>
            </Card>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: colors.navyLight, mb: 2, fontFamily: "'Assistant', sans-serif" }}>
                Enter the 6-digit code below
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2 }}>
                {otp.map((digit, index) => (
                  <TextField
                    key={index}
                    id={`otp-input-${index}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    inputProps={{
                      maxLength: 1,
                      style: { textAlign: 'center', fontSize: '1.5rem', padding: '12px 0' }
                    }}
                    sx={{
                      width: '50px',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover fieldset': { borderColor: colors.accentGold },
                        '&.Mui-focused fieldset': { borderColor: colors.accentGold },
                      },
                    }}
                  />
                ))}
              </Box>
              
              {errors.otp && (
                <Typography color="error" variant="caption" sx={{ display: 'block', mb: 2 }}>
                  {errors.otp}
                </Typography>
              )}
              
              <Button
                onClick={handleResendOTP}
                disabled={resendTimer > 0}
                sx={{
                  color: colors.accentGold,
                  fontFamily: "'Assistant', sans-serif",
                  textTransform: 'none',
                  '&:hover': { color: colors.navyDark },
                }}
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
              </Button>
            </Box>
          </Stack>
        );
      
      case 2:
        return (
          <Stack spacing={3}>
            {errors.general && (
              <Alert severity="error" sx={{ borderRadius: '12px' }}>
                {errors.general}
              </Alert>
            )}
            
            <Card sx={{ backgroundColor: colors.grayLight, borderRadius: '16px' }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: colors.navyLight, fontFamily: "'Assistant', sans-serif" }}>
                  Create a strong password for your account. Make sure it's at least 8 characters and includes uppercase, lowercase, and numbers.
                </Typography>
              </CardContent>
            </Card>
            
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={!!errors.newPassword}
              helperText={errors.newPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: colors.navyLight }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': { borderColor: colors.accentGold },
                  '&.Mui-focused fieldset': { borderColor: colors.accentGold },
                },
              }}
            />
            
            <TextField
              fullWidth
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: colors.navyLight }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': { borderColor: colors.accentGold },
                  '&.Mui-focused fieldset': { borderColor: colors.accentGold },
                },
              }}
            />

            {/* Password strength indicator */}
            {newPassword && (
              <Box>
                <LinearProgress
                  variant="determinate"
                  value={
                    newPassword.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)
                      ? 100
                      : newPassword.length >= 6
                      ? 60
                      : 30
                  }
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: colors.grayLight,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 
                        newPassword.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)
                          ? '#4caf50'
                          : newPassword.length >= 6
                          ? colors.accentGold
                          : colors.navyLight,
                    },
                  }}
                />
                <Typography variant="caption" sx={{ color: colors.navyLight, mt: 1, display: 'block', fontFamily: "'Assistant', sans-serif" }}>
                  Password strength: {
                    newPassword.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)
                      ? 'Strong'
                      : newPassword.length >= 6
                      ? 'Medium'
                      : 'Weak'
                  }
                </Typography>
              </Box>
            )}
          </Stack>
        );
      
      default:
        return 'Unknown step';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          backgroundColor: colors.white,
          overflow: 'hidden',
        }
      }}
    >
      {/* Header with Gradient */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${colors.navyDark} 0%, ${colors.navyLight} 100%)`,
          p: 3,
          textAlign: 'center',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box />
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.white, fontFamily: "'Assistant', sans-serif" }}>
            🔐 Reset Password
          </Typography>
          <IconButton onClick={handleClose} size="small" sx={{ color: colors.white }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Stepper */}
      <Box sx={{ p: 3, pb: 0 }}>
        <Stepper activeStep={activeStep} orientation="horizontal">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                StepIconProps={{
                  sx: {
                    '&.Mui-active': { color: colors.accentGold },
                    '&.Mui-completed': { color: colors.accentGold },
                  },
                }}
              >
                <Typography sx={{ fontFamily: "'Assistant', sans-serif", fontWeight: 500 }}>
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: 3 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {getStepContent(activeStep)}
          </motion.div>
        </AnimatePresence>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={
            activeStep === 0
              ? handleVerifyIdentity
              : activeStep === 1
              ? handleVerifyOTP
              : handleResetPassword
          }
          disabled={loading}
          sx={{
            backgroundColor: colors.navyDark,
            borderRadius: '50px',
            py: 1.2,
            fontFamily: "'Assistant', sans-serif",
            fontWeight: 700,
            '&:hover': {
              backgroundColor: colors.accentGold,
              color: colors.navyDark,
            },
          }}
        >
          {loading ? (
            'Please wait...'
          ) : activeStep === 0 ? (
            'Verify Identity'
          ) : activeStep === 1 ? (
            'Verify Code'
          ) : (
            'Reset Password'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Login Component with API Integration
const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    dateOfBirth: '',
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e) => {
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
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateLogin = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const validateSignup = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = isLogin ? validateLogin() : validateSignup();
    
    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      
      try {
        if (isLogin) {
          // Login API call
          const response = await authService.login({
            email: formData.email,
            password: formData.password,
            rememberMe: formData.rememberMe
          });
          
          setSnackbar({
            open: true,
            message: 'Login successful! Redirecting...',
            severity: 'success',
          });
          
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          // Signup API call
          await authService.register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            dateOfBirth: formData.dateOfBirth,
            profileImage: profileImage
          });
          
          setSnackbar({
            open: true,
            message: 'Account created successfully! Please login.',
            severity: 'success',
          });
          
          setTimeout(() => {
            setIsLogin(true);
            setFormData({ 
              email: '', 
              password: '', 
              confirmPassword: '', 
              name: '', 
              dateOfBirth: '',
              rememberMe: false 
            });
            setProfileImage(null);
            setProfilePreview(null);
          }, 1500);
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Something went wrong. Please try again.',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(validationErrors);
      setSnackbar({
        open: true,
        message: 'Please fix the errors in the form.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSocialLogin = (provider) => {
    setSnackbar({
      open: true,
      message: `${provider} login coming soon!`,
      severity: 'info',
    });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      dateOfBirth: '',
      rememberMe: false,
    });
    setProfileImage(null);
    setProfilePreview(null);
  };

  const handleForgotPasswordSuccess = () => {
    setSnackbar({
      open: true,
      message: 'Password reset successfully! Please login with your new password.',
      severity: 'success',
    });
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <>
      <Box
        sx={{
          backgroundColor: colors.white,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          py: { xs: 4, md: 6 },
          mt: { xs: 0, md: -4 },
        }}
      >
        <Container maxWidth="sm">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <Button
              component={Link}
              to="/"
              startIcon={<HomeIcon />}
              sx={{
                color: colors.navyDark,
                mb: 2,
                fontFamily: "'Assistant', sans-serif",
                '&:hover': {
                  color: colors.accentGold,
                  transform: 'translateX(-5px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Back to Home
            </Button>

            <Paper
              elevation={0}
              sx={{
                borderRadius: '24px',
                overflow: 'hidden',
                border: `1px solid ${colors.grayLight}`,
                boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
              }}
            >
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${colors.navyDark} 0%, ${colors.navyLight} 100%)`,
                  p: { xs: 3, md: 4 },
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    fontFamily: "'Assistant', sans-serif",
                    color: colors.white,
                    mb: 1,
                  }}
                >
                  {isLogin ? 'Welcome Back!' : 'Create Account'}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: `${colors.white}CC`,
                    fontFamily: "'Assistant', sans-serif",
                  }}
                >
                  {isLogin
                    ? 'Login to access your account and explore premium fragrances'
                    : 'Join NAVI Fragrances for exclusive offers and personalized recommendations'}
                </Typography>
              </Box>

              <Box sx={{ p: { xs: 3, md: 4 } }}>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    {!isLogin && (
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            <IconButton
                              component="label"
                              sx={{
                                backgroundColor: colors.accentGold,
                                color: colors.navyDark,
                                width: 32,
                                height: 32,
                                '&:hover': {
                                  backgroundColor: colors.navyDark,
                                  color: colors.white,
                                },
                              }}
                            >
                              <PhotoCamera sx={{ fontSize: 18 }} />
                              <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleImageUpload}
                              />
                            </IconButton>
                          }
                        >
                          <Avatar
                            src={profilePreview}
                            sx={{
                              width: 100,
                              height: 100,
                              backgroundColor: colors.grayLight,
                              border: `3px solid ${colors.accentGold}`,
                              cursor: 'pointer',
                            }}
                          >
                            {!profilePreview && <PersonAdd sx={{ fontSize: 50, color: colors.navyLight }} />}
                          </Avatar>
                        </Badge>
                      </Box>
                    )}

                    {!isLogin && (
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={!!errors.name}
                        helperText={errors.name}
                        placeholder="e.g., John Doe"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '&:hover fieldset': { borderColor: colors.accentGold },
                            '&.Mui-focused fieldset': { borderColor: colors.accentGold },
                          },
                          '& .MuiInputLabel-root.Mui-focused': { color: colors.accentGold },
                        }}
                      />
                    )}

                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      placeholder="hello@navifragrances.com"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: colors.navyLight }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': { borderColor: colors.accentGold },
                          '&.Mui-focused fieldset': { borderColor: colors.accentGold },
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: colors.accentGold },
                      }}
                    />

                    {!isLogin && (
                      <TextField
                        fullWidth
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        error={!!errors.dateOfBirth}
                        helperText={errors.dateOfBirth}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarToday sx={{ color: colors.navyLight }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '&:hover fieldset': { borderColor: colors.accentGold },
                            '&.Mui-focused fieldset': { borderColor: colors.accentGold },
                          },
                          '& .MuiInputLabel-root.Mui-focused': { color: colors.accentGold },
                        }}
                      />
                    )}

                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      error={!!errors.password}
                      helperText={errors.password}
                      placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: colors.navyLight }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': { borderColor: colors.accentGold },
                          '&.Mui-focused fieldset': { borderColor: colors.accentGold },
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: colors.accentGold },
                      }}
                    />

                    {!isLogin && (
                      <TextField
                        fullWidth
                        label="Confirm Password"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                        placeholder="Confirm your password"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: colors.navyLight }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '&:hover fieldset': { borderColor: colors.accentGold },
                            '&.Mui-focused fieldset': { borderColor: colors.accentGold },
                          },
                          '& .MuiInputLabel-root.Mui-focused': { color: colors.accentGold },
                        }}
                      />
                    )}

                    {isLogin && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="rememberMe"
                              checked={formData.rememberMe}
                              onChange={handleChange}
                              sx={{
                                color: colors.navyLight,
                                '&.Mui-checked': { color: colors.accentGold },
                              }}
                            />
                          }
                          label="Remember me"
                          sx={{
                            '& .MuiTypography-root': {
                              fontFamily: "'Assistant', sans-serif",
                              fontSize: '0.9rem',
                              color: colors.navyLight,
                            },
                          }}
                        />
                        <Button
                          onClick={() => setForgotPasswordOpen(true)}
                          sx={{
                            color: colors.navyLight,
                            fontFamily: "'Assistant', sans-serif",
                            textTransform: 'none',
                            '&:hover': {
                              color: colors.accentGold,
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          Forgot Password?
                        </Button>
                      </Box>
                    )}

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={loading}
                      sx={{
                        backgroundColor: colors.navyDark,
                        color: colors.white,
                        borderRadius: '50px',
                        py: 1.5,
                        fontFamily: "'Assistant', sans-serif",
                        fontWeight: 700,
                        fontSize: '1rem',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: colors.accentGold,
                          color: colors.navyDark,
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
                    </Button>

                    <Divider sx={{ my: 1 }}>
                      <Typography variant="body2" sx={{ color: colors.navyLight, fontFamily: "'Assistant', sans-serif", px: 2 }}>
                        OR CONTINUE WITH
                      </Typography>
                    </Divider>

                    <Stack direction="row" spacing={2}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Google />}
                        onClick={() => handleSocialLogin('Google')}
                        sx={{
                          borderColor: colors.grayLight,
                          color: colors.navyDark,
                          borderRadius: '50px',
                          py: 1,
                          fontFamily: "'Assistant', sans-serif",
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: colors.accentGold,
                            backgroundColor: `${colors.accentGold}10`,
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        Google
                      </Button>
                    </Stack>

                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: colors.navyLight, fontFamily: "'Assistant', sans-serif" }}>
                        {isLogin ? "" : "Already have an account? "}
                        <Button
                          onClick={toggleMode}
                          sx={{
                            color: colors.accentGold,
                            fontFamily: "'Assistant', sans-serif",
                            fontWeight: 700,
                            textTransform: 'none',
                            '&:hover': {
                              color: colors.navyDark,
                              backgroundColor: 'transparent',
                            },
                          }}
                        >
                          {isLogin ? '' : 'Login'}
                        </Button>
                      </Typography>
                    </Box>

                    {!isLogin && (
                      <Typography variant="caption" sx={{ textAlign: 'center', color: colors.navyLight, fontFamily: "'Assistant', sans-serif" }}>
                        By signing up, you agree to our{' '}
                        <Button
                          component={Link}
                          to="/terms"
                          sx={{
                            color: colors.accentGold,
                            textTransform: 'none',
                            p: 0,
                            minWidth: 'auto',
                            '&:hover': { color: colors.navyDark, backgroundColor: 'transparent' },
                          }}
                        >
                          Terms of Service
                        </Button>{' '}
                        and{' '}
                        <Button
                          component={Link}
                          to="/privacy"
                          sx={{
                            color: colors.accentGold,
                            textTransform: 'none',
                            p: 0,
                            minWidth: 'auto',
                            '&:hover': { color: colors.navyDark, backgroundColor: 'transparent' },
                          }}
                        >
                          Privacy Policy
                        </Button>
                      </Typography>
                    )}
                  </Stack>
                </form>
              </Box>
            </Paper>
          </motion.div>
        </Container>
      </Box>

      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        onSuccess={handleForgotPasswordSuccess}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', fontFamily: "'Assistant', sans-serif", borderRadius: '12px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Login;