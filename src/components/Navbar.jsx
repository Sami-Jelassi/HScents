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
} from '@mui/material';
import {
  ShoppingBag,
  Person,
  Menu as MenuIcon,
  Close as CloseIcon,
  Language,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/Logo-Navi-Bg.png';
import logoMobile from '../assets/Logo-Navi-Bg.png';

// ======================
// THEME COLORS
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

  // Continuous glow animation
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
        backgroundColor: colors.navyBlue,
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
            fontFamily: "'Amaranth', sans-serif",
          }}
        >
          {messages[currentIndex]}
        </Typography>
      </Box>
    </Box>
  );
};

// Language options with flags and native names
const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
];

// Category links for the drawer - simplified
const categoryLinks = [
  { name: 'All Samples', path: '/samples' },
  { name: 'Limited Stock', path: '/limited-stock' },
  { name: "Niche Fragrance's", path: '/Niche' },
  { name: "Designer Fragrance's", path: '/Designer' },
  { name: "Middle Eastern Fragrance's", path: '/Middle-Eastern' },
];

const Navbar = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [languageAnchor, setLanguageAnchor] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [cartItems, setCartItems] = useState([]);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
  
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
    { name: 'All Samples', path: '/samples' },
    { name: 'Category', path: '/category' },
    { name: 'Fragrances', path: '/fragrances' },
    { name: 'Contact', path: '/contact' },
  ];
  
  const handleTabClick = (tabName) => {
    if (tabName === 'Category') {
      setCategoryDrawerOpen(true);
    } else {
      setActiveTab(tabName);
      window.location.href = navItems.find(item => item.name === tabName)?.path || '/';
    }
    setMobileOpen(false);
  };
  
  const handleCategoryItemClick = (path) => {
    window.location.href = path;
    setCategoryDrawerOpen(false);
  };
  
  const handleLoginClick = () => {
    console.log('Navigating to login page');
  };
  
  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setLanguageAnchor(null);
    console.log(`Language changed to: ${language.name}`);
  };
  
  useEffect(() => {
    const currentPath = window.location.pathname;
    const active = navItems.find(item => item.path === currentPath);
    if (active) {
      setActiveTab(active.name);
    }
  }, []);
  
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
      {/* Announcement Bar - Above Navbar */}
      <AnnouncementBar />
      
      {/* Main Navbar */}
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
            
            {/* LEFT SECTION - Menu Icon (Only on mobile) */}
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
                    sx={{ color: colors.navyBlue, p: 0.5 }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.navyBlue,
                      fontSize: '0.4rem',
                      fontWeight: 600,
                      letterSpacing: '0.5px',
                      fontFamily: "'Amaranth', sans-serif",
                      mt: 0,
                    }}
                  >
                    MENU
                  </Typography>
                </Box>
              )}
              {/* Desktop Logo - Hidden on mobile */}
              {!isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 900,
                      color: colors.navyBlue,
                      letterSpacing: '1px',
                      fontFamily: "'Amaranth', sans-serif",
                      whiteSpace: 'nowrap',
                    }}
                  >
                    HAMDI SCENTS 
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* CENTER SECTION - Mobile Logo (Only on mobile) */}
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
                    color: colors.navyBlue,
                    fontSize: '1.2rem',
                    fontFamily: "'Amaranth', sans-serif",
                  }}
                >
                  HAMDI SCENTS
                </Typography>
              </Box>
            )}
            
            {/* CENTER SECTION - Navigation Tabs (Desktop only) */}
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
                    onClick={() => handleTabClick(item.name)}
                    sx={{
                      color: colors.navyBlue,
                      fontSize: '0.95rem',
                      fontWeight: activeTab === item.name ? 700 : 500,
                      px: 2,
                      py: 1,
                      position: 'relative',
                      fontFamily: "'Amaranth', sans-serif",
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
            
            {/* RIGHT SECTION - Icons */}
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 1, sm: 1.5 }, 
              alignItems: 'center',
              justifyContent: 'flex-end',
              flex: { xs: 1, md: 0 },
              minWidth: { xs: 'auto', md: '150px' },
            }}>
              {/* Language Selector - Desktop only */}
              {!isMobile && (
                <IconButton
                  onClick={(e) => setLanguageAnchor(e.currentTarget)}
                  sx={{ 
                    color: colors.navyBlue,
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
              
              {/* Person Icon - Desktop only */}
              {!isMobile && (
                <IconButton
                  onClick={handleLoginClick}
                  href='/login'
                  sx={{ 
                    color: colors.navyBlue,
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
              
              {/* Cart Icon - Always visible */}
              <IconButton
                onClick={() => setCartOpen(true)}
                sx={{ 
                  color: colors.navyBlue,
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    color: colors.accent,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Badge 
                  badgeContent={cartItems.reduce((sum, item) => sum + item.quantity, 0)} 
                  sx={{ 
                    '& .MuiBadge-badge': { 
                      backgroundColor: colors.accent,
                      color: colors.navyBlue,
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
      
      {/* Category Drawer - Opens from left with navyBlue background */}
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
            overflowX: 'hidden',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
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
                {/* Header with Close Button */}
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
                        fontFamily: "'Amaranth', sans-serif",
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
                
                {/* Category Items */}
                <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
                  <List sx={{ p: 0 }}>
                    {categoryLinks.map((category, index) => (
                      <motion.div
                        key={category.name}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        whileTap="tap"
                        custom={index}
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
                                  fontFamily: "'Amaranth', sans-serif",
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
              direction: language.code === 'ar' ? 'rtl' : 'ltr',
              justifyContent: language.code === 'ar' ? 'flex-end' : 'flex-start',
              py: 1.5,
              mx: 1,
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: `rgba(246, 214, 115, 0.1)`,
              },
            }}
          >
            <Typography sx={{ fontSize: '1.3rem', fontFamily: "'Amaranth', sans-serif" }}>{language.flag}</Typography>
            <Typography sx={{ 
              fontWeight: selectedLanguage.code === language.code ? 700 : 400,
              color: selectedLanguage.code === language.code ? colors.accent : 'inherit',
              fontFamily: "'Amaranth', sans-serif",
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
          {/* Close Button */}
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
          
          {/* Logo Section in Drawer */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 900, 
                color: colors.navyBlue,
                fontFamily: "'Amaranth', sans-serif",
              }}
            >
              HAMDI SCENTS
            </Typography>
          </Box>
          
          {/* Navigation Items with Plus/Minus for Category */}
          <List>
            {navItems.map((item) => (
              <React.Fragment key={item.name}>
                <ListItem
                  onClick={() => {
                    if (item.name === 'Category') {
                      setMobileCategoryOpen(!mobileCategoryOpen);
                    } else {
                      handleTabClick(item.name);
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
                          color: activeTab === item.name ? colors.accent : colors.navyBlue,
                          fontWeight: activeTab === item.name ? 700 : 500,
                          fontSize: '1rem',
                          textAlign: 'left',
                          fontFamily: "'Amaranth', sans-serif",
                        }
                      }
                    }}
                  />
                  {item.name === 'Category' && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMobileCategoryOpen(!mobileCategoryOpen);
                      }}
                      sx={{ color: colors.navyBlue }}
                    >
                      {mobileCategoryOpen ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  )}
                  {activeTab === item.name && item.name !== 'Category' && (
                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: colors.accent }} />
                  )}
                </ListItem>
                
                {/* Category Subitems - Collapsible on Mobile */}
                {item.name === 'Category' && (
                  <Collapse in={mobileCategoryOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {categoryLinks.map((category) => (
                        <ListItem
                          key={category.name}
                          onClick={() => {
                            window.location.href = category.path;
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
                                  fontFamily: "'Amaranth', sans-serif",
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
          
          {/* Language Selection */}
          <Typography variant="subtitle2" sx={{ mb: 2, color: colors.navyBlue, fontWeight: 600, fontFamily: "'Amaranth', sans-serif", textDecoration: 'underline', textUnderlineOffset: 8, textDecorationColor: colors.accent, }}>
            Select Language
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            {languages.map((language) => (
              <Button
                key={language.code}
                onClick={() => {
                  handleLanguageSelect(language);
                }}
                sx={{
                  flex: 1,
                  flexDirection: 'column',
                  gap: 0.5,
                  py: 1.5,
                  borderRadius: '12px',
                  backgroundColor: selectedLanguage.code === language.code ? `rgba(246, 214, 115, 0.1)` : 'transparent',
                  border: selectedLanguage.code === language.code ? `1px solid ${colors.accent}` : `1px solid ${colors.grayLight}`,
                  color: selectedLanguage.code === language.code ? colors.navyBlue : colors.navyBlue,
                  '&:hover': {
                    backgroundColor: `rgba(246, 214, 115, 0.05)`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Typography sx={{ fontSize: '1.5rem', fontFamily: "'Amaranth', sans-serif" }}>{language.flag}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 500, fontFamily: "'Amaranth', sans-serif" }}>
                  {language.nativeName}
                </Typography>
              </Button>
            ))}
          </Stack>
          
          <Divider sx={{ my: 2, backgroundColor: colors.grayLight }} />
          
          {/* Login Button */}
          <Button
            fullWidth
            variant="contained"
            startIcon={<Person />}
            onClick={handleLoginClick}
            sx={{
              bgcolor: colors.navyBlue,
              color: colors.accent,
              borderRadius: '12px',
              py: 1.5,
              textTransform: 'none',
              fontFamily: "'Amaranth', sans-serif",
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: `0 4px 12px rgba(246, 214, 115, 0.3)`,
              '&:hover': { 
                bgcolor: colors.accent,
                color: colors.navyBlue,
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 16px rgba(246, 214, 115, 0.4)`,
              },
            }}
          >
            Sign In to Account
          </Button>
          
          {/* Footer Text */}
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              textAlign: 'center', 
              fontFamily: "'Amaranth', sans-serif",
              mt: 3,
              color: colors.grayMedium,
            }}
          >
            © 2026 NAVI. All rights reserved.
          </Typography>
        </Box>
      </Drawer>
      
      {/* Cart Drawer - Empty Cart */}
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
                <Typography variant="h5" sx={{ fontWeight: 700, color: colors.navyBlue, fontFamily: "'Amaranth', sans-serif" }}>
                  Shopping Cart
                </Typography>
                <Typography variant="body2" sx={{ color: colors.grayMedium, mt: 0.5, fontFamily: "'Amaranth', sans-serif" }}>
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items in your cart
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
          
          {/* Cart Items - Empty State */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4 }}>
            <ShoppingBag sx={{ fontSize: 100, color: colors.navyBlue, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ color: colors.navyBlue, mb: 1, fontWeight: 600, fontFamily: "'Amaranth', sans-serif" }}>
              Your cart is empty
            </Typography>
            <Typography variant="body2" sx={{ color: colors.grayMedium, mb: 3, textAlign: 'center', fontFamily: "'Amaranth', sans-serif" }}>
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
                fontFamily: "'Amaranth', sans-serif",
                fontWeight: 700,
                '&:hover': { bgcolor: colors.accent, color: colors.navyBlue },
              }}
            >
              Continue Shopping
            </Button>
          </Box>
        </Box>
      </Drawer>
      
      {/* Spacer for fixed navbar */}
      <Toolbar sx={{ minHeight: { xs: 'auto', md: '85px' } }} />
    </>
  );
};

export default Navbar;