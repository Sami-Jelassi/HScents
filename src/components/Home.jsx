import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Grid, Typography, Button, Container, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowForward, AutoAwesome, ChevronLeft, ChevronRight } from '@mui/icons-material';
import NB from '../assets/Frag.png';
import Poster from '../assets/Frag2.png';
import Jar from '../assets/Frag3.png';
import BM from '../assets/Frag4.png';
import Sticker from '../assets/Frag5.png';
import hangingImage from '../assets/Frag.png';

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

// Update stickers data with new colors and paths
const stickers = [
  { id: 0, image: NB, title: "All Samples", path: "/samples", tagline: "Discover New Scents" },
  { id: 1, image: Poster, title: "Limited Stock", path: "/limited-stock", tagline: "Exclusive Drops" },
  { id: 2, image: Jar, title: "Fragrances", path: "/fragrances", tagline: "Luxury Perfumes" },
  { id: 3, image: BM, title: "Niche", path: "/Niche", tagline: "Rare Finds" },
  { id: 4, image: Sticker, title: "Designer", path: "/Designer", tagline: "Iconic Scents" },
];

// Mobile Image Slider Component
const MobileImageSlider = () => {
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
      autoPlayRef.current = setInterval(goToNext, 3000);
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
        display: { xs: 'block', md: 'none' },
        position: 'relative',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        mt: -10,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          maxHeight: '100svh',
          minHeight: { xs: '100vh', sm: '100vh' },
          overflow: 'hidden',
        }}
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
                x: { type: 'tween', duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.25 },
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
                  '&:active': { transform: 'scale(0.98)' },
                  transition: 'transform 0.2s ease',
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

                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(to top, ${colors.navyDark}E6 0%, ${colors.navyDark}66 60%, ${colors.navyDark}26 100%)`,
                  }}
                />

                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%',
                    px: 4,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Amaranth', sans-serif",
                      fontWeight: 900,
                      fontSize: { xs: '3rem', sm: '3.5rem' },
                      color: colors.white,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      lineHeight: 1,
                      textShadow: '0 4px 20px rgba(0,0,0,0.7)',
                    }}
                  >
                    {slides[currentSlide].title}
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: "'Amaranth', sans-serif",
                      fontWeight: 700,
                      fontSize: { xs: '1.1rem', sm: '1.3rem' },
                      color: colors.accentGold,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      textShadow: '0 2px 8px rgba(0,0,0,0.6)',
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
                      mt: 1,
                      fontFamily: "'Amaranth', sans-serif",
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      bgcolor: colors.accentGold,
                      color: colors.navyDark,
                      borderRadius: '50px',
                      px: 4,
                      py: 1.4,
                      minWidth: 180,
                      boxShadow: '0 6px 30px rgba(0,0,0,0.4)',
                      border: `2px solid ${colors.accentGold}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(255,255,255,0.15)',
            color: colors.white,
            width: 44,
            height: 44,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${colors.accentGold}`,
            '&:hover': {
              bgcolor: colors.accentGold,
              color: colors.navyDark,
              transform: 'translateY(-50%) scale(1.1)',
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
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(255,255,255,0.15)',
            color: colors.white,
            width: 44,
            height: 44,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${colors.accentGold}`,
            '&:hover': {
              bgcolor: colors.accentGold,
              color: colors.navyDark,
              transform: 'translateY(-50%) scale(1.1)',
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
            bottom: 40,
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
                bgcolor: index === currentSlide ? colors.accentGold : 'rgba(255,255,255,0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

const Home = () => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  
  const phrases = [
    "Discover Your Signature Scent", 
    "Luxury Fragrance Samples",
    "Curated With Excellence"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Mobile Slider - Only visible on mobile */}
      <MobileImageSlider />

      {/* Hero Section - Hidden on mobile, visible on tablet/desktop */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'visible',
          pt: { xs: 0, md: 6 },
          pb: { xs: 0, md: 4 },
          display: { xs: 'none', md: 'block' },
          backgroundColor: colors.white,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ alignItems: 'center' }}>
            {/* Left Side - Main Hero Content */}
            <Grid size={{ xs: 12, md: 7 }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Main Title */}
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 900,
                      fontFamily: "'Amaranth', sans-serif",
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
                      lineHeight: 1.2,
                      color: colors.navyDark,
                      mb: 0.3,
                    }}
                  >
                    Premium Fragrance
                  </Typography>
                  
                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 900,
                      fontFamily: "'Amaranth', sans-serif",
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
                      lineHeight: 1.2,
                      background: `linear-gradient(135deg, ${colors.accentGold} 0%, ${colors.navyDark} 50%, ${colors.accentGold} 100%)`,
                      backgroundSize: '200% auto',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: 'shine 3s linear infinite',
                      '@keyframes shine': {
                        '0%': { backgroundPosition: '0% center' },
                        '100%': { backgroundPosition: '200% center' },
                      },
                    }}
                  >
                    Samples
                  </Typography>
                </Box>

                {/* Rotating Subtitle */}
                <Box sx={{ mb: 2 }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPhraseIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Typography
                        variant="h2"
                        sx={{
                          fontWeight: 700,
                          fontFamily: "'Amaranth', sans-serif",
                          color: colors.accentGold,
                          fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.6rem' },
                          lineHeight: 1.3,
                        }}
                      >
                        {phrases[currentPhraseIndex]}
                      </Typography>
                    </motion.div>
                  </AnimatePresence>
                </Box>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                      color: colors.navyLight,
                      fontFamily: "'Amaranth', sans-serif",
                      lineHeight: 1.6,
                      maxWidth: 500,
                      mb: 2.5,
                    }}
                  >
                    Explore our curated collection of luxury fragrance samples. 
                    From niche masterpieces to designer icons, discover your next signature scent 
                    without committing to full bottles.
                  </Typography>
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <Button
                    variant="contained"
                    size="medium"
                    endIcon={<AutoAwesome />}
                    href="/samples"
                    sx={{
                      backgroundColor: colors.navyDark,
                      borderRadius: '50px',
                      py: 1.2,
                      px: 4,
                      textTransform: 'none',
                      fontFamily: "'Amaranth', sans-serif",
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: colors.white,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(90deg, transparent, ${colors.accentGold}30, transparent)`,
                        transition: 'left 0.5s ease',
                      },
                      '&:hover': {
                        backgroundColor: colors.accentGold,
                        color: colors.navyDark,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${colors.accentGold}40`,
                        '&::before': {
                          left: '100%',
                        },
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Browse Collections
                  </Button>
                </motion.div>
              </motion.div>
            </Grid>

            {/* Right Side - Hanging Frame Image */}
            <Grid size={{ xs: 12, md: 5 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                style={{ position: 'relative', zIndex: 20 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {/* Hanging string/rope */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -25,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '1.5px',
                      height: '30px',
                      background: `linear-gradient(180deg, ${colors.navyDark} 0%, ${colors.accentGold} 100%)`,
                      zIndex: 1,
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -30,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: colors.accentGold,
                      boxShadow: `0 2px 4px rgba(0,0,0,0.2)`,
                      zIndex: 1,
                    }}
                  />
                  
                  {/* Hanging Frame with Animation */}
                  <motion.div
                    animate={{ 
                      rotate: [-2, 2, -2],
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 4,
                      ease: "easeInOut"
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        maxWidth: '300px',
                        height: '360px',
                        margin: '0 auto',
                        position: 'relative',
                        borderRadius: '12px',
                        boxShadow: `0 15px 30px rgba(0,0,0,0.15), 0 0 0 6px ${colors.white}, 0 0 0 10px ${colors.accentGold}`,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        overflow: 'hidden',
                        backgroundColor: colors.white,
                        '&:hover': {
                          transform: 'scale(1.02)',
                          boxShadow: `0 20px 40px rgba(0,0,0,0.2), 0 0 0 6px ${colors.white}, 0 0 0 10px ${colors.navyDark}`,
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={hangingImage}
                        alt="Featured Fragrance"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </Box>
                  </motion.div>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Products Grid Section */}
      <Box
        sx={{
          mx: { xs: 2, sm: 3, md: 5 },
          backgroundColor: colors.grayLight,
          borderRadius: '20px',
          padding: { xs: 2, sm: 2, md: 4 },
          overflow: 'hidden',
          mt: { xs: 0, md: 2 },
          mb: 4,
          position: 'relative',
          zIndex: 5,
          boxShadow: `0 8px 30px rgba(0,0,0,0.05)`,
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
            {stickers.map((sticker, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={sticker.id}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: '200px',
                      height: 'auto',
                      margin: '0 auto',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      bgcolor: colors.white,
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 12px 24px ${colors.accentGold}20`,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        height: '200px',
                        overflow: 'hidden',
                        position: 'relative',
                        borderRadius: '16px 16px 0 0',
                      }}
                    >
                      <Box
                        component="img"
                        src={sticker.image}
                        alt={sticker.title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease',
                          '&:hover': {
                            transform: 'scale(1.08)',
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ textAlign: 'center', mt: 1.5, mb: 1.5 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 800,
                          fontFamily: "'Amaranth', sans-serif",
                          color: colors.navyDark,
                          fontSize: '0.95rem',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {sticker.title}
                      </Typography>
                      
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 500,
                          fontFamily: "'Amaranth', sans-serif",
                          color: colors.accentGold,
                          fontSize: '0.7rem',
                          display: 'block',
                          mt: 0.5,
                        }}
                      >
                        {sticker.tagline}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                      <Button
                        component="a"
                        href={sticker.path}
                        size="small"
                        endIcon={<ArrowForward sx={{ fontSize: '0.9rem' }} />}
                        sx={{
                          color: colors.accentGold,
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          fontFamily: "'Amaranth', sans-serif",
                          '&:hover': {
                            transform: 'translateX(5px)',
                            color: colors.navyDark,
                            backgroundColor: 'transparent',
                          },
                          transition: 'transform 0.3s ease',
                        }}
                      >
                        Shop Now 
                      </Button>
                    </Box>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default Home;