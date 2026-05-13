import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Link,
  Stack,
  Paper,
} from '@mui/material';
import {
  Instagram,
  Facebook,
  Send,
  Copyright,
} from '@mui/icons-material';
import logo from '../assets/Logo-Navi-Bg.png';

// ======================
// THEME COLORS (Matching Navbar)
// ======================
const colors = {
  primary: '#101B4B',
  secondary: '#545E85',
  accent: '#F6D673',
  grayMedium: '#A3A8B2',
  grayLight: '#E7E7E7',
  white: '#FFFFFF',
  navyBlue: '#0a1928',
  navyGlow: '#1e3a5f',
};

// TikTok icon as a custom component
const TikTokIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const socialLinks = [
  { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/navi' },
  { name: 'TikTok', icon: TikTokIcon, url: 'https://tiktok.com/@navi' },
  { name: 'Facebook', icon: Facebook, url: 'https://facebook.com/navi' },
];

const quickLinks = [
  { name: 'Home', url: '/' },
  { name: 'All Samples', url: '/samples' },
  { name: 'Limited Stock', url: '/limited-stock' },
  { name: 'Fragrances', url: '/fragrances' },
  { name: 'Contact', url: '/contact' },
  { name: 'Privacy Policy', url: '/privacy' },
];

const Footer = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (!email) {
      setEmailError('Please enter your email');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      return;
    }
    setEmailError('');
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: colors.white,
        color: colors.navyBlue,
        mt: 'auto',
        borderTop: `2px solid ${colors.accent}`,
        fontFamily: "'Amaranth', sans-serif",
      }}
    >
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Logo & Social Section */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                component="img"
                src={logo}
                alt="Navi Logo"
                sx={{ height: 45, width: 'auto' }}
              />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 900,
                  color: colors.navyBlue,
                  fontFamily: "'Amaranth', sans-serif",
                  letterSpacing: '1px',
                }}
              >
                H SCENTS
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                color: colors.grayMedium,
                mb: 2,
                fontFamily: "'Amaranth', sans-serif",
                lineHeight: 1.6,
              }}
            >
              Premium fragrance samples and niche perfumes. Discover your signature scent with our curated collection.
            </Typography>
            <Stack direction="row" spacing={1.5}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.name}
                  component="a"
                  href={social.url}
                  target="_blank"
                  sx={{
                    color: colors.grayMedium,
                    backgroundColor: colors.grayLight,
                    '&:hover': { 
                      color: colors.accent,
                      backgroundColor: colors.navyBlue,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <social.icon />
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '1.1rem',
                mb: 2,
                color: colors.navyBlue,
                fontFamily: "'Amaranth', sans-serif",
                letterSpacing: '0.5px',
              }}
            >
              Quick Links
            </Typography>
            <Grid container spacing={1}>
              {quickLinks.map((link) => (
                <Grid size={{ xs: 6 }} key={link.name}>
                  <Link
                    href={link.url}
                    underline="none"
                    sx={{
                      color: colors.grayMedium,
                      fontSize: '0.875rem',
                      display: 'block',
                      mb: 1,
                      fontFamily: "'Amaranth', sans-serif",
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        color: colors.accent,
                        transform: 'translateX(3px)',
                      },
                    }}
                  >
                    {link.name}
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Newsletter Section */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                backgroundColor: colors.navyBlue,
                borderRadius: '16px',
                border: `1px solid ${colors.navyBlue}`,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  mb: 1,
                  color: colors.accent,
                  fontFamily: "'Amaranth', sans-serif",
                }}
              >
                Stay Updated
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: colors.grayMedium,
                  mb: 2.5,
                  fontFamily: "'Amaranth', sans-serif",
                }}
              >
                Subscribe to get special offers, new arrivals, and exclusive deals.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!emailError}
                  helperText={emailError}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: colors.white,
                      borderRadius: '12px',
                      '&:hover fieldset': { 
                        borderColor: colors.accent,
                      },
                      '&.Mui-focused fieldset': { 
                        borderColor: colors.accent,
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputBase-input': { 
                      color: colors.navyBlue,
                      fontFamily: "'Amaranth', sans-serif",
                    },
                    '& .MuiFormHelperText-root': {
                      fontFamily: "'Amaranth', sans-serif",
                    },
                    flex: 1,
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSubscribe}
                  disabled={subscribed}
                  sx={{
                    backgroundColor: colors.accent,
                    color: colors.navyBlue,
                    borderRadius: '12px',
                    padding: '8px 24px',
                    textTransform: 'none',
                    fontFamily: "'Amaranth', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    minWidth: '120px',
                    '&:hover': { 
                      backgroundColor: colors.accent,
                      color: colors.navyBlue,
                      transform: 'translateY(-2px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {subscribed ? (
                    'Subscribed! ✓'
                  ) : (
                    <>
                      Subscribe <Send sx={{ ml: 1, fontSize: 18 }} />
                    </>
                  )}
                </Button>
              </Box>
              
              {subscribed && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    mt: 1.5, 
                    display: 'block', 
                    color: '#4caf50',
                    fontFamily: "'Amaranth', sans-serif",
                    textAlign: 'center',
                    fontWeight: 600,
                  }}
                >
                  Thank you for subscribing! 🎉
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: colors.grayLight }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Copyright sx={{ fontSize: 14, color: colors.grayMedium }} />
            <Typography 
              variant="caption" 
              sx={{ 
                color: colors.navyBlue,
                fontFamily: "'Amaranth', sans-serif",
                fontWeight: 500,
              }}
            >
              {currentYear} H SCENTS Fragrances. All rights reserved.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link 
              href="/privacy" 
              underline="none" 
              sx={{ 
                color: colors.navyBlue,
                fontSize: '0.7rem',
                fontFamily: "'Amaranth', sans-serif",
                fontWeight: 500,
                transition: 'all 0.3s ease',
                '&:hover': { 
                  color: colors.accent,
                },
              }}
            >
              Privacy
            </Link>
            <Link 
              href="/terms" 
              underline="none" 
              sx={{ 
                color: colors.navyBlue,
                fontSize: '0.7rem',
                fontFamily: "'Amaranth', sans-serif",
                fontWeight: 500,
                transition: 'all 0.3s ease',
                '&:hover': { 
                  color: colors.accent,
                },
              }}
            >
              Terms
            </Link>
            <Link 
              href="/contact" 
              underline="none" 
              sx={{ 
                color: colors.navyBlue,
                fontSize: '0.7rem',
                fontFamily: "'Amaranth', sans-serif",
                fontWeight: 500,
                transition: 'all 0.3s ease',
                '&:hover': { 
                  color: colors.accent,
                },
              }}
            >
              Contact
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;