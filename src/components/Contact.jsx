import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Paper,
  IconButton,
  Stack,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Phone,
  Email,
  Send,
  Instagram,
  Facebook,
  Twitter,
  WhatsApp,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../services/api';

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

// TikTok icon component
const TikTokIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        const response = await api.post('/contact', formData);
        setSnackbar({
          open: true,
          message: response.data.message || 'Thank you! We will get back to you soon.',
          severity: 'success',
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } catch (error) {
        console.error('Error sending message:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to send message. Please try again.',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(newErrors);
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

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/hamdiscents', color: '#E4405F' },
    { name: 'WhatsApp', icon: WhatsApp, url: 'https://wa.me/21695348348', color: '#25D366' },
  ];

  // Simplified contact info - only email and phone
  const contactInfo = [
    {
      icon: Email,
      title: 'Email Us',
      details: ['hamdibensghaier19@gmail.com'],
      action: 'mailto:hamdibensghaier19@gmail.com',
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+216 95 348 348'],
      action: 'tel:+21695348348',
    },
  ];

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  return (
    <Box
      sx={{
        backgroundColor: colors.white,
        minHeight: '100vh',
        mt: { xs: 2, md: -8 },
        mb: { xs: 4, md: 4 },
      }}
    >
      <Container maxWidth="lg">
        {/* Hero Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                fontFamily: "'Assistant', sans-serif",
                color: "#333333",
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                mb: 2,
                textTransform: 'uppercase',
              }}
            >
              Contact Us
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#666666",
                fontFamily: "'Assistant', sans-serif",
                maxWidth: 600,
                mx: 'auto',
                fontSize: '1.1rem',
              }}
            >
              Have questions about our <span style={{ color: colors.accentGold }}>fragrances?</span> We'd love to hear from you.
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={4}>
          {/* Contact Form - FIRST (mobile first) */}
          <Grid size={{ xs: 12, md: 7 }} sx={{ order: { xs: 1, md: 1 } }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: '24px',
                  backgroundColor: colors.white,
                  border: `1px solid ${colors.grayLight}`,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    fontFamily: "'Assistant', sans-serif",
                    color: "#333333",
                    mb: 2,
                  }}
                >
                  Send us a Message
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.navyLight,
                    fontFamily: "'Assistant', sans-serif",
                    mb: 4,
                  }}
                >
                  Fill out the form below and we'll get back to you as soon as possible.
                </Typography>

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Your Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={!!errors.name}
                        helperText={errors.name}
                        disabled={loading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '&:hover fieldset': {
                              borderColor: colors.accentGold,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: colors.accentGold,
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: colors.accentGold,
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={!!errors.email}
                        helperText={errors.email}
                        disabled={loading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '&:hover fieldset': {
                              borderColor: colors.accentGold,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: colors.accentGold,
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: colors.accentGold,
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        error={!!errors.subject}
                        helperText={errors.subject}
                        disabled={loading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '&:hover fieldset': {
                              borderColor: colors.accentGold,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: colors.accentGold,
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: colors.accentGold,
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Message"
                        name="message"
                        multiline
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        error={!!errors.message}
                        helperText={errors.message}
                        disabled={loading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '&:hover fieldset': {
                              borderColor: colors.accentGold,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: colors.accentGold,
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: colors.accentGold,
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
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
                            color: colors.white,
                            transform: 'translateY(-2px)',
                          },
                          '&.Mui-disabled': {
                            backgroundColor: colors.navyDark,
                            opacity: 0.7,
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {loading ? 'Sending...' : 'Send Message'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            </motion.div>
          </Grid>

          {/* Contact Information - SECOND (simplified with email and phone only) */}
          <Grid size={{ xs: 12, md: 5 }} sx={{ order: { xs: 2, md: 2 } }}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <Box
                sx={{
                  backgroundColor:'transparent' ,
                  borderRadius: '24px',
                  p: { xs: 3, md: 4 },
                  color: colors.black,
                  height: '100%',
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    fontFamily: "'Assistant', sans-serif",
                    color: "#333333",
                    mb: 3,
                  }}
                >
                  Get in Touch
                </Typography>

                <Stack spacing={3}>
                  {contactInfo.map((info, index) => (
                    <motion.div
                      key={info.title}
                      variants={fadeInUp}
                      whileHover={{ x: 10 }}
                      transition={{ type: 'tween', duration: 0.2 }}
                    >
                      <Box
                        sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}
                        component="a"
                        href={info.action}
                        target={info.icon === Email ? "_blank" : undefined}
                        rel={info.icon === Email ? "noopener noreferrer" : undefined}
                      >
                        <Box
                          sx={{
                            backgroundColor: `${colors.accentGold}20`,
                            borderRadius: '12px',
                            p: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <info.icon sx={{ color: colors.navyGlow, fontSize: 28 }} />
                        </Box>
                        <Box>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontFamily: "'Assistant', sans-serif",
                              mb: 1,
                              fontSize: '1rem',
                            }}
                          >
                            {info.title}
                          </Typography>
                          {info.details.map((detail, i) => (
                            <Typography
                              key={i}
                              sx={{
                                color: `${colors.black}`,
                                fontFamily: "'Assistant', sans-serif",
                                fontSize: '0.9rem',
                                mb: 0.5,
                              }}
                            >
                              {detail}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </Stack>

                <Divider sx={{ my: 3, borderColor: `${colors.black}20` }} />

                {/* Social Links */}
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontFamily: "'Assistant', sans-serif",
                      mb: 2,
                      color: "#333333",
                    }}
                  >
                    Follow Us
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {socialLinks.map((social) => (
                      <IconButton
                        key={social.name}
                        component="a"
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: colors.black,
                          backgroundColor: `${colors.white}10`,
                          '&:hover': {
                            color: social.color,
                            backgroundColor: `${colors.white}20`,
                            transform: 'translateY(-3px)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <social.icon />
                      </IconButton>
                    ))}
                  </Stack>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>

        {/* Map Section - Removed as requested */}
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            fontFamily: "'Assistant', sans-serif",
            borderRadius: '12px',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Contact;