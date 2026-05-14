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
  LocationOn,
  Phone,
  Email,
  AccessTime,
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
  navyDark: '#0a1928',
  navyLight: '#1e3a5f',
  navyGlow: '#1e3a5f',
  white: '#ffffff',
  black: '#000000',
  grayLight: '#f5f5f5',
  accentGold: '#F6D673',
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
    { name: 'TikTok', icon: TikTokIcon, url: 'https://tiktok.com/@hamdiscents', color: '#000000' },
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com/hamdiscents', color: '#1877F2' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com/hamdiscents', color: '#1DA1F2' },
    { name: 'WhatsApp', icon: WhatsApp, url: 'https://wa.me/1234567890', color: '#25D366' },
  ];

  const contactInfo = [
    {
      icon: LocationOn,
      title: 'Visit Us',
      details: ['123 Fragrance Avenue', 'Tunis, Tunisia'],
      color: colors.accentGold,
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+216 70 123 456', '+216 50 123 456'],
      color: colors.accentGold,
    },
    {
      icon: Email,
      title: 'Email Us',
      details: ['hello@hamdiscents.com', 'support@hamdiscents.com'],
      color: colors.accentGold,
    },
    {
      icon: AccessTime,
      title: 'Business Hours',
      details: ['Monday - Friday: 9AM - 8PM', 'Saturday: 10AM - 6PM', 'Sunday: Closed'],
      color: colors.accentGold,
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
        mt: {xs: 2, md: -8},
        mb: {xs: 4, md: 4},
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
                fontFamily: "'Amaranth', sans-serif",
                color: colors.navyDark,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                mb: 2,
              }}
            >
              Contact Us
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: colors.navyLight,
                fontFamily: "'Amaranth', sans-serif",
                maxWidth: 600,
                mx: 'auto',
                fontSize: '1.1rem',
              }}
            >
              Have questions about our <span style={{color:colors.accentGold}}>fragrances?</span> We'd love to hear from you.
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={4}>
          {/* Contact Information Cards */}
          <Grid size={{ xs: 12, md: 5 }}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <Box
                sx={{
                  backgroundColor: colors.navyDark,
                  borderRadius: '24px',
                  p: { xs: 3, md: 4 },
                  color: colors.white,
                  height: '100%',
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    fontFamily: "'Amaranth', sans-serif",
                    color: colors.accentGold,
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
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
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
                          <info.icon sx={{ color: colors.accentGold, fontSize: 28 }} />
                        </Box>
                        <Box>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontFamily: "'Amaranth', sans-serif",
                              mb: 1,
                              fontSize: '1.1rem',
                            }}
                          >
                            {info.title}
                          </Typography>
                          {info.details.map((detail, i) => (
                            <Typography
                              key={i}
                              sx={{
                                color: `${colors.white}CC`,
                                fontFamily: "'Amaranth', sans-serif",
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

                <Divider sx={{ my: 3, borderColor: `${colors.white}20` }} />

                {/* Social Links */}
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontFamily: "'Amaranth', sans-serif",
                      mb: 2,
                      color: colors.accentGold,
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
                        sx={{
                          color: colors.white,
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

          {/* Contact Form */}
          <Grid size={{ xs: 12, md: 7 }}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
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
                    fontFamily: "'Amaranth', sans-serif",
                    color: colors.navyDark,
                    mb: 2,
                  }}
                >
                  Send us a Message
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.navyLight,
                    fontFamily: "'Amaranth', sans-serif",
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
                          fontFamily: "'Amaranth', sans-serif",
                          fontWeight: 700,
                          fontSize: '1rem',
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: colors.accentGold,
                            color: colors.navyDark,
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
        </Grid>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Box sx={{ mt: 6 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: '24px',
                overflow: 'hidden',
                border: `1px solid ${colors.grayLight}`,
              }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3197.123456789012!2d10.1815316!3d36.8064948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd337f5e7e2f0b%3A0x8b5e8e8e8e8e8e8e!2sTunis%2C%20Tunisia!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Hamdi Scents Location"
              ></iframe>
            </Paper>
          </Box>
        </motion.div>

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
            fontFamily: "'Amaranth', sans-serif",
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