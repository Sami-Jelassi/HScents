import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
  Container,
  useMediaQuery,
  useTheme as useMuiTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Badge,
  Menu,
  MenuItem,
  Stack,
  Paper,
  Collapse,
  Avatar,
  TextField,
  IconButton as MuiIconButton,
  Alert,
} from '@mui/material';
import {
  ShoppingBag,
  Person,
  Menu as MenuIcon,
  Close as CloseIcon,
  Language,
  ExpandMore,
  ExpandLess,
  Add,
  Remove,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

// ======================
// THEME COLORS
// ======================
const colors = {
  primary: '#101B4B',
  secondary: '#545E85',
  accent: '#416992',
  grayMedium: '#A3A8B2',
  grayLight: '#E7E7E7',
  white: '#FFFFFF',
  navyBlue: '#416992',
  navyGlow: '#365d91',
  success: '#4caf50',
  black: '#000000',
};

// ======================
// ANNOUNCEMENT BAR COMPONENT
// ======================
const AnnouncementBar = () => {
  const messages = [
    " NEW ARRIVALS: Summer Collection 2026",
    " Free shipping on orders over 150 TND",
    " Limited Stock: Up to 20% off on Fragrances",
    " New Perfumes added weekly - Check them out!",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [glowIntensity, setGlowIntensity] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIntensity((prev) => (prev + 0.02) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const glowValue = 0.5 + Math.sin(glowIntensity) * 0.3;
  const navyGlowColor = `rgba(30, 58, 95, ${glowValue})`;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: "#416992",
        color: colors.white,
        py: 0.75,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: `0 0 20px ${navyGlowColor}, 0 0 40px ${navyGlowColor}`,
        transition: 'box-shadow 0.1s ease',
        zIndex: 1300,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          animation: 'slide 0.5s ease-in-out',
          '@keyframes slide': {
            '0%': { transform: 'translateY(100%)', opacity: 0 },
            '100%': { transform: 'translateY(0)', opacity: 1 },
          },
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            letterSpacing: '0.5px',
            textAlign: 'center',
            px: 2,
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          {messages[currentIndex]}
        </Typography>
      </Box>
    </Box>
  );
};

// Language options
const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
];

// Category links
const categoryLinks = [
  { name: 'All Samples', path: '/samples' },
  { name: "Niche Fragrance's", path: '/niche' },
  { name: "Designer Fragrance's", path: '/designer' },
  { name: "Arab Fragrance's", path: '/arab' },
];

const Navbar = () => {
  const { 
    cartItems, 
    cartOpen, 
    setCartOpen, 
    removeFromCart, 
    updateQuantity, 
    getCartSubtotal,
    getShippingFee,
    getCartTotal, 
    getCartCount 
  } = useCart();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [languageAnchor, setLanguageAnchor] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
  
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'All Samples', path: '/all' },
    { name: "Niche Fragrance's", path: '/niche' },
    { name: "Designer Fragrance's", path: '/designer' },
    { name: "Arab Fragrance's", path: '/arab' },
    { name: 'Contact', path: '/contact' },
  ];
  
  const handleTabClick = (tabName, path) => {
    if (tabName === 'Category') {
      setCategoryDrawerOpen(true);
    } else {
      setActiveTab(tabName);
      navigate(path);
    }
    setMobileOpen(false);
  };
  
  const handleCategoryItemClick = (path) => {
    navigate(path);
    setCategoryDrawerOpen(false);
  };
  
  const handleLoginClick = () => {
    navigate('/login');
  };
  
  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setLanguageAnchor(null);
  };
  
  useEffect(() => {
    const currentPath = window.location.pathname;
    const active = navItems.find(item => item.path === currentPath);
    if (active) {
      setActiveTab(active.name);
    }
  }, [location]);
  
  // Drawer animation variants
  const drawerVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "tween",
        duration: 0.3,
        staggerChildren: 0.05
      }
    },
    exit: { 
      x: -300, 
      opacity: 0,
      transition: {
        type: "tween",
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "tween",
        duration: 0.3
      }
    },
    hover: {
      x: 15,
      scale: 1.05,
      transition: {
        type: "tween",
        duration: 0.2
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        type: "tween",
        duration: 0.1
      }
    }
  };
  
  return (
    <>
      <AnnouncementBar />
      
      <AppBar 
        position="sticky"
        elevation={scrolled ? 8 : 0}
        sx={{
          backgroundColor: colors.white,
          transition: 'all 0.3s ease',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          borderBottom: scrolled ? 'none' : `1px solid ${colors.grayLight}`,
          top: 0,
          zIndex: 1200,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ 
            py: 1.5,
            minHeight: { xs: 'auto', md: '85px' },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            
            {/* LEFT SECTION */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              flex: { xs: 1, md: 0 },
              minWidth: { xs: 'auto', md: '150px' },
            }}>
              {isMobile && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <IconButton
                    onClick={() => setMobileOpen(true)}
                    sx={{ color: colors.black, p: 0.5 }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.black,
                      fontSize: '0.4rem',
                      fontWeight: 600,
                      letterSpacing: '0.5px',
                      fontFamily: "'Montserrat', sans-serif",
                      mt: 0,
                    }}
                  >
                    MENU
                  </Typography>
                </Box>
              )}
              {!isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 900,
                      color: colors.black,
                      letterSpacing: '1px',
                      fontFamily: "'Montserrat', sans-serif",
                      whiteSpace: 'nowrap',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate('/')}
                  >
                    HAMDI SCENTS 
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* CENTER SECTION */}
            {isMobile && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                flex: 2,
              }}>
                <Typography 
                  sx={{ 
                    fontWeight: 900,
                    color: colors.black,
                    fontSize: '1.2rem',
                    fontFamily: "'Montserrat', sans-serif",
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate('/')}
                >
                  HAMDI SCENTS
                </Typography>
              </Box>
            )}
            
            {/* CENTER SECTION - Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'center',
                flex: 1,
              }}>
                {navItems.map((item) => (
                  <Button
                    key={item.name}
                    onClick={() => handleTabClick(item.name, item.path)}
                    sx={{
                      color: colors.black,
                      fontSize: '0.95rem',
                      fontWeight: activeTab === item.name ? 700 : 500,
                      px: 2,
                      py: 1,
                      position: 'relative',
                      fontFamily: "'Montserrat', sans-serif",
                      textTransform: 'none',
                      transition: 'all 0.3s ease',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: activeTab === item.name ? '30px' : '0',
                        height: '3px',
                        backgroundColor: colors.accent,
                        transition: 'width 0.3s ease',
                        borderRadius: '2px',
                      },
                      '&:hover': {
                        backgroundColor: 'transparent',
                        color: colors.accent,
                        '&::before': {
                          width: '30px',
                        },
                      },
                    }}
                  >
                    {item.name}
                  </Button>
                ))}
              </Box>
            )}
            
            {/* RIGHT SECTION */}
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 1, sm: 1.5 }, 
              alignItems: 'center',
              justifyContent: 'flex-end',
              flex: { xs: 1, md: 0 },
              minWidth: { xs: 'auto', md: '150px' },
            }}>
              {!isMobile && (
                <IconButton
                  onClick={(e) => setLanguageAnchor(e.currentTarget)}
                  sx={{ 
                    color: colors.black,
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      color: colors.accent,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Language />
                </IconButton>
              )}
              
              {!isMobile && (
                <IconButton
                  onClick={handleLoginClick}
                  sx={{ 
                    color: colors.black,
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      color: colors.accent,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Person />
                </IconButton>
              )}
              
              <IconButton
                onClick={() => setCartOpen(true)}
                sx={{ 
                  color: colors.black,
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    color: colors.accent,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Badge 
                  badgeContent={getCartCount()} 
                  sx={{ 
                    '& .MuiBadge-badge': { 
                      backgroundColor: colors.accent,
                      color: colors.black,
                      fontSize: '10px',
                      height: '18px',
                      minWidth: '18px',
                    } 
                  }}
                >
                  <ShoppingBag />
                </Badge>
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Category Drawer */}
      <Drawer
        anchor="left"
        open={categoryDrawerOpen}
        onClose={() => setCategoryDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '70%', sm: 280, md: 280 },
            backgroundColor: colors.navyBlue,
            boxSizing: 'border-box',
            borderRadius: '0 20px 20px 0',
            boxShadow: '10px 0 30px rgba(0,0,0,0.2)',
          },
        }}
      >
        <AnimatePresence mode="wait">
          {categoryDrawerOpen && (
            <motion.div
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <motion.div
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        color: colors.white,
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: '1.1rem',
                      }}
                    >
                      Categories
                    </Typography>
                    <IconButton 
                      onClick={() => setCategoryDrawerOpen(false)}
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
                        width: 28,
                        height: 28,
                      }}
                    >
                      <CloseIcon sx={{ color: colors.white, fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </motion.div>
                
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  <List sx={{ p: 0 }}>
                    {categoryLinks.map((category, index) => (
                      <motion.div
                        key={category.name}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <ListItem
                          onClick={() => handleCategoryItemClick(category.path)}
                          sx={{
                            borderRadius: '12px',
                            mb: 1,
                            cursor: 'pointer',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            transition: 'all 0.3s ease',
                            py: 1,
                            px: 1.5,
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.2)',
                            },
                          }}
                        >
                          <ListItemText 
                            primary={category.name}
                            slotProps={{
                              primary: {
                                sx: {
                                  color: colors.white,
                                  fontWeight: 500,
                                  fontSize: '0.9rem',
                                  fontFamily: "'Montserrat', sans-serif",
                                  textAlign: 'center',
                                }
                              }
                            }}
                            sx={{ textAlign: 'center' }}
                          />
                        </ListItem>
                      </motion.div>
                    ))}
                  </List>
                </Box>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Drawer>
      
      {/* Language Menu */}
      <Menu
        anchorEl={languageAnchor}
        open={Boolean(languageAnchor)}
        onClose={() => setLanguageAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              minWidth: 200,
              backgroundColor: colors.white,
              border: `1px solid ${colors.grayLight}`,
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            },
          },
        }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageSelect(language)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              py: 1.5,
              mx: 1,
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: `rgba(246, 214, 115, 0.1)`,
              },
            }}
          >
            <Typography sx={{ fontSize: '1.3rem' }}>{language.flag}</Typography>
            <Typography sx={{ 
              fontWeight: selectedLanguage.code === language.code ? 700 : 400,
              color: selectedLanguage.code === language.code ? colors.accent : 'inherit',
              fontFamily: "'Montserrat', sans-serif",
            }}>
              {language.nativeName}
            </Typography>
            {selectedLanguage.code === language.code && (
              <Box sx={{ ml: 'auto', width: 8, height: 8, borderRadius: '50%', backgroundColor: colors.accent }} />
            )}
          </MenuItem>
        ))}
      </Menu>
      
      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: '85%',
            maxWidth: 360,
            backgroundColor: colors.white,
            boxSizing: 'border-box',
            borderRadius: '0 20px 20px 0',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <IconButton 
              onClick={() => setMobileOpen(false)}
              sx={{ 
                backgroundColor: `rgba(246, 214, 115, 0.1)`,
                '&:hover': { backgroundColor: `rgba(246, 214, 115, 0.2)` },
              }}
            >
              <CloseIcon sx={{ color: colors.navyBlue }} />
            </IconButton>
          </Box>
          
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 900, 
                color: colors.black,
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              HAMDI SCENTS
            </Typography>
          </Box>
          
          <List>
            {navItems.map((item) => (
              <React.Fragment key={item.name}>
                <ListItem
                  onClick={() => {
                    if (item.name === 'Category') {
                      setMobileCategoryOpen(!mobileCategoryOpen);
                    } else {
                      handleTabClick(item.name, item.path);
                    }
                  }}
                  sx={{
                    borderRadius: 12,
                    mb: 1,
                    cursor: 'pointer',
                    backgroundColor: activeTab === item.name ? `rgba(246, 214, 115, 0.1)` : 'transparent',
                    transition: 'all 0.3s ease',
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: `rgba(246, 214, 115, 0.08)`,
                      transform: 'translateX(5px)',
                    },
                  }}
                >
                  <ListItemText 
                    primary={item.name}
                    slotProps={{
                      primary: {
                        sx: {
                          color: activeTab === item.name ? colors.accent : colors.black,
                          fontWeight: activeTab === item.name ? 700 : 500,
                          fontSize: '1rem',
                          fontFamily: "'Montserrat', sans-serif",
                        }
                      }
                    }}
                  />
                  {item.name === 'Category' && (
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMobileCategoryOpen(!mobileCategoryOpen); }}>
                      {mobileCategoryOpen ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  )}
                </ListItem>
                
                {item.name === 'Category' && (
                  <Collapse in={mobileCategoryOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {categoryLinks.map((category) => (
                        <ListItem
                          key={category.name}
                          onClick={() => {
                            navigate(category.path);
                            setMobileOpen(false);
                          }}
                          sx={{
                            borderRadius: 12,
                            mb: 0.5,
                            ml: 2,
                            cursor: 'pointer',
                            py: 1,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: `rgba(246, 214, 115, 0.08)`,
                              transform: 'translateX(5px)',
                            },
                          }}
                        >
                          <ListItemText 
                            primary={category.name}
                            slotProps={{
                              primary: {
                                sx: {
                                  color: colors.grayMedium,
                                  fontSize: '0.85rem',
                                  fontFamily: "'Montserrat', sans-serif",
                                }
                              }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            ))}
          </List>
          
          <Typography variant="subtitle2" sx={{ mb: 2, color: colors.black, fontWeight: 600, fontFamily: "'Montserrat', sans-serif", textDecoration: 'underline', textUnderlineOffset: 8, textDecorationColor: colors.navyBlue }}>
            Select Language
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            {languages.map((language) => (
              <Button
                key={language.code}
                onClick={() => handleLanguageSelect(language)}
                sx={{
                  flex: 1,
                  flexDirection: 'column',
                  gap: 0.5,
                  py: 1.5,
                  borderRadius: '12px',
                  backgroundColor: selectedLanguage.code === language.code ? `rgba(246, 214, 115, 0.1)` : 'transparent',
                  border: selectedLanguage.code === language.code ? `1px solid ${colors.navyBlue}` : `1px solid ${colors.grayLight}`,
                  '&:hover': {
                    backgroundColor: `rgba(246, 214, 115, 0.05)`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Typography sx={{ fontSize: '1.5rem' }}>{language.flag}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 500, fontFamily: "'Montserrat', sans-serif" }}>
                  {language.nativeName}
                </Typography>
              </Button>
            ))}
          </Stack>
          
          <Divider sx={{ my: 2, backgroundColor: colors.grayLight }} />
          
          <Button
            fullWidth
            variant="contained"
            startIcon={<Person />}
            onClick={handleLoginClick}
            sx={{
              bgcolor: colors.navyBlue,
              color: "#ffffff",
              borderRadius: '12px',
              py: 1.5,
              textTransform: 'none',
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: `0 4px 12px rgba(246, 214, 115, 0.3)`,
              '&:hover': { 
                bgcolor: colors.black,
                color: colors.navyBlue,
                transform: 'translateY(-2px)',
              },
            }}
          >
            Sign In to Account
          </Button>
          
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              textAlign: 'center', 
              fontFamily: "'Montserrat', sans-serif",
              mt: 3,
              color: colors.grayMedium,
            }}
          >
            © 2026 Hamdi Scents. All rights reserved.
          </Typography>
        </Box>
      </Drawer>
      
      {/* Enhanced Cart Drawer with Shipping */}
      <Drawer
        anchor="right"
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 480, md: 550 },
            backgroundColor: colors.white,
            borderRadius: { sm: '20px 0 0 20px' },
          },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Cart Header */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderBottom: `1px solid ${colors.grayLight}`,
              backgroundColor: 'transparent',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: colors.navyBlue, fontFamily: "'Montserrat', sans-serif" }}>
                  Shopping Cart
                </Typography>
                <Typography variant="body2" sx={{ color: colors.grayMedium, mt: 0.5, fontFamily: "'Montserrat', sans-serif" }}>
                  {getCartCount()} items in your cart
                </Typography>
              </Box>
              <IconButton 
                onClick={() => setCartOpen(false)}
                sx={{ 
                  backgroundColor: `rgba(246, 214, 115, 0.1)`,
                  '&:hover': { backgroundColor: `rgba(246, 214, 115, 0.2)` },
                }}
              >
                <CloseIcon sx={{ color: colors.navyBlue }} />
              </IconButton>
            </Box>
          </Paper>
          
          {/* Cart Items */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {cartItems.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <ShoppingBag sx={{ fontSize: 100, color: colors.navyBlue, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" sx={{ color: colors.navyBlue, mb: 1, fontWeight: 600, fontFamily: "'Montserrat', sans-serif" }}>
                  Your cart is empty
                </Typography>
                <Typography variant="body2" sx={{ color: colors.grayMedium, mb: 3, textAlign: 'center', fontFamily: "'Montserrat', sans-serif" }}>
                  Looks like you haven't added any items yet
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setCartOpen(false)}
                  sx={{
                    bgcolor: colors.navyBlue,
                    color: colors.white,
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    '&:hover': { bgcolor: colors.accent, color: colors.navyBlue },
                  }}
                >
                  Continue Shopping
                </Button>
              </Box>
            ) : (
              <Stack spacing={2}>
                {cartItems.map((item) => (
                  <Paper key={item.id} sx={{ p: 2, borderRadius: '16px', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }}>
                    <Stack direction="row" spacing={2}>
                      <Avatar src={item.image} variant="rounded" sx={{ width: 80, height: 80, borderRadius: '12px' }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.navyBlue, mb: 0.5 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.grayMedium, mb: 0.5 }}>
                          Size: {item.size}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: colors.accent }}>
                          {item.price} TND
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <IconButton size="small" onClick={() => removeFromCart(item.id)} sx={{ color: colors.error }}>
                          <DeleteIcon />
                        </IconButton>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: colors.grayLight, borderRadius: '50px', px: 1 }}>
                          <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)} sx={{ color: colors.navyBlue }}>
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 30, textAlign: 'center' }}>{item.quantity}</Typography>
                          <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)} sx={{ color: colors.navyBlue }}>
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
          
          {/* Cart Footer with Shipping */}
          {cartItems.length > 0 && (
            <Box sx={{ p: 3, borderTop: `1px solid ${colors.grayLight}`, bgcolor: colors.white }}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body1" sx={{ color: colors.navyBlue }}>Subtotal</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: colors.navyBlue }}>{getCartSubtotal()} TND</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body1" sx={{ color: colors.navyBlue }}>
                    Shipping
                    {getShippingFee() === 0 && getCartSubtotal() > 0 && (
                      <Typography component="span" variant="caption" sx={{ color: colors.success, ml: 1 }}>(Free)</Typography>
                    )}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: getShippingFee() === 0 ? colors.success : colors.navyBlue }}>
                    {getShippingFee() === 0 ? 'FREE' : `${getShippingFee()} TND`}
                  </Typography>
                </Stack>
                {getCartSubtotal() < 150 && getCartSubtotal() > 0 && (
                  <Alert severity="info" sx={{ borderRadius: '12px', py: 0 }}>
                    <Typography variant="caption">Add {150 - getCartSubtotal()} TND more for FREE shipping!</Typography>
                  </Alert>
                )}
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6" sx={{ fontWeight: 700, color: colors.navyBlue }}>Total</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: colors.accent }}>{getCartTotal()} TND</Typography>
                </Stack>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    bgcolor: colors.navyBlue,
                    color: colors.white,
                    py: 1.5,
                    textTransform: 'none',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    borderRadius: '50px',
                    '&:hover': { bgcolor: colors.accent, color: colors.navyBlue },
                  }}
                  onClick={() => {
                    setCartOpen(false);
                    navigate('/checkout');
                  }}
                >
                  Proceed to Checkout
                </Button>
              </Stack>
            </Box>
          )}
        </Box>
      </Drawer>
      
      <Toolbar sx={{ minHeight: { xs: 'auto', md: '85px' } }} />
    </>
  );
};

export default Navbar;