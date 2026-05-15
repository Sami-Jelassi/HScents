import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Grid, Typography, Button, Container, IconButton, Card, CardMedia, CardContent, Chip, Stack, Divider, FormControl, Select, MenuItem, alpha } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowForward, ChevronLeft, ChevronRight, ShoppingBag, Male as MaleIcon, Female as FemaleIcon, People as PeopleIcon, CheckCircle as CheckCircleIcon, RemoveCircle as RemoveCircleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import NB from '../assets/Frag.png';
import Poster from '../assets/Frag2.png';
import Jar from '../assets/Frag3.png';
import BM from '../assets/Frag4.png';
import Sticker from '../assets/Frag5.png';

// ======================
// THEME COLORS
// ======================
const colors = {
  navyDark: '#0a1928',
  navyLight: '#1e3a5f',
  navyGlow: '#1e3a5f',
  white: '#ffffff',
  black: '#000000',
  grayLight: '#f5f5f5',
  accentGold: '#73a7f6',
};

// Stickers data for slider
const stickers = [
  { id: 0, image: NB, title: "All Samples", path: "/all", tagline: "Discover New Scents" },
  { id: 1, image: Poster, title: "Niche Fragrances", path: "/niche", tagline: "Exclusive Drops" },
  { id: 2, image: Jar, title: "Designer Fragrances", path: "/designer", tagline: "Luxury Perfumes" },
  { id: 3, image: BM, title: "Arab Fragrances", path: "/arab", tagline: "Rare Finds" },
];

// Full Width Image Slider Component
const FullWidthSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayRef = useRef(null);

  const slides = stickers.map(sticker => ({
    image: sticker.image,
    title: sticker.title,
    tagline: sticker.tagline,
    path: sticker.path,
  }));

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!isHovered) {
      autoPlayRef.current = setInterval(goToNext, 4000);
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isHovered, goToNext]);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: '80vh', sm: '80vh', md: '90vh' },
        overflow: 'hidden',
        mt: { xs: -26, md: -24, lg: -14 },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <AnimatePresence initial={false} custom={currentSlide}>
          <motion.div
            key={currentSlide}
            custom={currentSlide}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'tween', duration: 0.5, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.3 },
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          >
            <Box
              onClick={() => window.location.href = slides[currentSlide].path}
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                cursor: 'pointer',
              }}
            >
              <Box
                component="img"
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                sx={{
                  
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />

              {/* Gradient Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(to bottom, ${colors.navyDark}40 0%, ${colors.navyDark}CC 100%)`,
                }}
              />

              {/* Text Content */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: { xs: '20%', md: '25%' },
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100%',
                  px: 4,
                  textAlign: 'center',
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 900,
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '4.5rem' },
                      color: colors.white,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      lineHeight: 1,
                      textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                    }}
                  >
                    {slides[currentSlide].title}
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 700,
                      fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
                      color: colors.white,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                      mt: 1,
                    }}
                  >
                    {slides[currentSlide].tagline}
                  </Typography>

                  <Button
                    variant="contained"
                    size="large"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = slides[currentSlide].path;
                    }}
                    sx={{
                      mt: 3,
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 800,
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      bgcolor: colors.accentGold,
                      color: colors.white,
                      borderRadius: '50px',
                      px: { xs: 3, sm: 5 },
                      py: { xs: 1, sm: 1.5 },
                      minWidth: { xs: 160, sm: 200 },
                      boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'transparent',
                        color: colors.white,
                        border: `2px solid ${colors.white}`,
                        transform: 'translateY(-3px)',
                      },
                    }}
                  >
                    Shop Now
                    <ArrowForward sx={{ ml: 1, fontSize: '1.1rem', }} />
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Navigation Arrows */}
      <IconButton
        onClick={goToPrev}
        sx={{
          position: 'absolute',
          left: 16,
          top: {xs: '70%', sm: '70%', md: '50%', lg: '50%'},
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(255,255,255,0.15)',
          color: colors.white,
          width: 44,
          height: 44,
          backdropFilter: 'blur(10px)',
          border: `1px solid rgba(255,255,255,0.3)`,
          '&:hover': {
            bgcolor: colors.accentGold,
            color: colors.navyDark,
          },
          zIndex: 2,
        }}
      >
        <ChevronLeft sx={{ fontSize: 30 }} />
      </IconButton>

      <IconButton
        onClick={goToNext}
        sx={{
          position: 'absolute',
          right: 16,
          top: {xs: '70%', sm: '70%', md: '50%', lg: '50%'},
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(255,255,255,0.15)',
          color: colors.white,
          width: 44,
          height: 44,
          backdropFilter: 'blur(10px)',
          border: `1px solid rgba(255,255,255,0.3)`,
          '&:hover': {
            bgcolor: colors.accentGold,
            color: colors.navyDark,
          },
          zIndex: 2,
        }}
      >
        <ChevronRight sx={{ fontSize: 30 }} />
      </IconButton>

      {/* Dots Indicator */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1.5,
          zIndex: 2,
        }}
      >
        {slides.map((_, index) => (
          <Box
            key={index}
            onClick={() => goToSlide(index)}
            sx={{
              width: index === currentSlide ? 32 : 10,
              height: 10,
              borderRadius: '5px',
              bgcolor: index === currentSlide ? colors.accentGold : 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

// Enhanced Product Card Component - Professional Luxury Design
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
        border: 'none' ,
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

          {/* Stock Status Badge with Gender - Subtle Positioning */}
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

          {/* Product Name - Gray Color, Elegant Typography with Tooltip */}
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

          {/* Size Selection - Horizontal Buttons on Mobile */}
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

          {/* Price Display - Dynamic - Bigger on Mobile, Under Size */}
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

          {/* Buy Now Button - Premium Action */}
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

// Product Section Component with Enhanced Cards
const ProductSection = ({ title, category, viewAllPath, isLast = false }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCardSize, setSelectedCardSize] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products?category=${category}&limit=4`);
      setProducts(response.data.products.slice(0, 4));
      
      const initialSizes = {};
      response.data.products.slice(0, 4).forEach(product => {
        if (product.sizes && product.sizes.length > 0) {
          initialSizes[product._id] = product.sizes[0];
        }
      });
      setSelectedCardSize(initialSizes);
    } catch (error) {
      console.error(`Error fetching ${category} products:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleSizeChange = (productId, size) => {
    setSelectedCardSize(prev => ({
      ...prev,
      [productId]: size
    }));
  };

  const handleViewDetails = (product) => {
    navigate(`/product/${product.slug}`);
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: isLast ? 4 : 6 }}>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 800,
          fontFamily: "'Montserrat', sans-serif",
          color: colors.navyDark,
          textAlign: 'left',
          mb: 3,
          fontSize: { xs: '1.5rem', md: '2rem' },
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -8,
            left: 0,
            width: 50,
            height: 3,
            bgcolor: colors.accentGold,
            borderRadius: 2,
          },
        }}
      >
        {title}
      </Typography>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid size={{ xs: 6, sm: 6, md: 3 }} key={product._id}>
            <ProductCard
              product={product}
              onViewDetails={handleViewDetails}
              selectedSize={selectedCardSize[product._id]}
              onSizeChange={handleSizeChange}
            />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate(viewAllPath)}
          sx={{
            borderColor: colors.navyDark,
            color: colors.navyDark,
            borderRadius: '50px',
            px: 4,
            py: 1,
            textTransform: 'none',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            '&:hover': {
              borderColor: colors.accentGold,
              bgcolor: colors.accentGold,
              color: colors.navyDark,
            },
          }}
        >
          View All {title}
          <ArrowForward sx={{ ml: 1, fontSize: 18 }} />
        </Button>
      </Box>
    </Box>
  );
};

const Home = () => {
  return (
    <>
      {/* Full Width Slider */}
      <FullWidthSlider />

      {/* Product Sections */}
      <Container maxWidth="xl" sx={{ mt: 6 }}>
        {/* Designer First */}
        <ProductSection title="Designer Fragrances" category="Designer" viewAllPath="/designer" />
        
        {/* Arab Second */}
        <ProductSection title="Arab Fragrances" category="Arab" viewAllPath="/arab" />
        
        {/* Niche Last */}
        <ProductSection title="Niche Fragrances" category="Niche" viewAllPath="/niche" isLast={true} />
      </Container>
    </>
  );
};

export default Home;