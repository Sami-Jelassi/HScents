import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Grid, Typography, Button, Container, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowForward, AutoAwesome, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import NB from '../assets/Frag.png';
import Poster from '../assets/Frag2.png';
import Jar from '../assets/Frag3.png';
import BM from '../assets/Frag4.png';
import Sticker from '../assets/Frag5.png';
import hangingImage from '../assets/Frag.png';

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
  accentGold: '#F6D673',
};

// Stickers data for slider
const stickers = [
  { id: 0, image: NB, title: "All Samples", path: "/all", tagline: "Discover New Scents" },
  { id: 1, image: Poster, title: "Niche Fragrances", path: "/niche", tagline: "Exclusive Drops" },
  { id: 2, image: Jar, title: "DesignerFragrances", path: "/designer", tagline: "Luxury Perfumes" },
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
        height: { xs: '100vh', sm: '80vh', md: '90vh' },
        overflow: 'hidden',
        mt: { xs: -12, md: -18, lg:-14 },
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
                      fontFamily: "'Amaranth', sans-serif",
                      fontWeight: 900,
                      fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
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
                      fontFamily: "'Amaranth', sans-serif",
                      fontWeight: 700,
                      fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
                      color: colors.accentGold,
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
                      fontFamily: "'Amaranth', sans-serif",
                      fontWeight: 800,
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      bgcolor: colors.accentGold,
                      color: colors.navyDark,
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
                    <ArrowForward sx={{ ml: 1, fontSize: '1.1rem' }} />
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
          top: '50%',
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
          top: '50%',
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

// Product Section Component
const ProductSection = ({ title, category, viewAllPath, isLast = false }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products?category=${category}&limit=4`);
      setProducts(response.data.products.slice(0, 4));
    } catch (error) {
      console.error(`Error fetching ${category} products:`, error);
    } finally {
      setLoading(false);
    }
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
          fontFamily: "'Amaranth', sans-serif",
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
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  bgcolor: colors.white,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                }}
                onClick={() => navigate(`/product/${product.slug}`)}
              >
                <Box
                  component="img"
                  src={product.mainImage}
                  alt={product.name}
                  sx={{
                    width: '100%',
                    height: { xs: 180, sm: 200, md: 220 },
                    objectFit: 'cover',
                  }}
                />
                <Box sx={{ p: 1.5 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: colors.navyDark,
                      mb: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color: colors.accentGold,
                      fontSize: '1rem',
                    }}
                  >
                    From {Math.min(...product.sizes.map(s => s.price))} TND
                  </Typography>
                </Box>
              </Box>
            </motion.div>
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
            fontFamily: "'Amaranth', sans-serif",
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