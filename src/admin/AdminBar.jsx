import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  useMediaQuery,
  useTheme as useMuiTheme,
  Chip,
  Collapse,
  alpha,
  Paper,
  Stack,
  Button,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material';
// React Icons imports
import { 
  HiOutlineViewGrid, 
  HiOutlineShoppingBag, 
  HiOutlineUsers, 
  HiOutlineMailOpen,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineBell,
  HiOutlineCreditCard,
} from 'react-icons/hi';
import { 
  MdOutlineCategory, 
  MdOutlineLocalOffer, 
  MdOutlineInventory, 
  MdOutlineAddBox,
  MdOutlineListAlt,
  MdOutlineStorefront,
  MdOutlineSecurity,
  MdOutlineVerifiedUser,
  MdOutlineHelp,
  MdOutlineFeedback,
  MdOutlineEmail,
  MdOutlinePhone,
} from 'react-icons/md';
import { 
  FiTrendingUp, 
  FiPackage, 
  FiShoppingCart,
} from 'react-icons/fi';
import { 
  BsGrid3X3GapFill, 
  BsBook, 
  BsJournalBookmark, 
  BsStickyFill, 
  BsFillArchiveFill,
} from 'react-icons/bs';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

// Theme colors matching your NAVI/HAMDI SCENTS theme
const colors = {
  navyDark: '#0a1928',
  navyLight: '#1e3a5f',
  accentGold: '#F6D673',
  white: '#ffffff',
  black: '#0a0a0a',
  grayLight: '#f5f5f5',
  primary: '#1e3a5f',
  primaryLight: '#3a5a7f',
  secondary: '#F6D673',
  secondaryDark: '#e6c660',
};

const AdminBar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [openSubMenus, setOpenSubMenus] = useState({});
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inventoryBadge, setInventoryBadge] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  // Fetch real user data from API
  useEffect(() => {
    fetchUserData();
    fetchInventoryStatus();
    fetchUnreadMessages();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await api.get('/auth/me');
      const userData = response.data.user;
      setUser(userData);
      
      // Update localStorage with latest user data
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Try to get from localStorage as fallback
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryStatus = async () => {
    try {
      const response = await api.get('/products');
      const products = response.data.products;
      
      let hasLowStock = false;
      let hasOutOfStock = false;
      
      products.forEach(product => {
        product.sizes?.forEach(size => {
          if (size.stock === 0) {
            hasOutOfStock = true;
          }
          if (size.stock <= 5 && size.stock > 0) {
            hasLowStock = true;
          }
        });
      });
      
      if (hasOutOfStock) {
        setInventoryBadge({ label: 'Out', color: '#f44336' });
      } else if (hasLowStock) {
        setInventoryBadge({ label: 'Low', color: colors.secondary });
      } else {
        setInventoryBadge({ label: 'Full', color: '#4caf50' });
      }
    } catch (error) {
      console.error('Error fetching inventory status:', error);
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      const response = await api.get('/contact/stats');
      const unread = response.data.stats?.unread || 0;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    handleMenuClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const toggleSubMenu = (menuText) => {
    setOpenSubMenus(prev => ({
      ...prev,
      [menuText]: !prev[menuText]
    }));
  };

  const drawerWidth = 280;
  const collapsedDrawerWidth = 80;

  // Menu items configuration with dynamic badge
  const getMenuItems = () => [
    { 
      text: 'Dashboard', 
      icon: <HiOutlineViewGrid size={22} />, 
      path: '/dashboard',
    },
    { 
      text: 'Products', 
      icon: <HiOutlineShoppingBag size={22} />, 
      path: '/dashboard/products',
      subItems: [
        { text: 'All Products', path: '/dashboard/products', icon: <HiOutlineShoppingBag size={18} /> },
        { text: 'Add Product', path: '/dashboard/products/add', icon: <MdOutlineAddBox size={18} /> },
        { text: 'Categories', path: '/dashboard/categories', icon: <MdOutlineCategory size={18} /> },
      ]
    },
    { 
      text: 'Orders', 
      icon: <MdOutlineListAlt size={22} />, 
      path: '/dashboard/orders',
      badge: '12',
    },
    { 
      text: 'Customers', 
      icon: <HiOutlineUsers size={22} />, 
      path: '/dashboard/customers',
    },
    { 
      text: 'Inventory', 
      icon: <MdOutlineInventory size={22} />, 
      path: '/dashboard/inventory',
      badge: inventoryBadge ? inventoryBadge.label : null,
      badgeColor: inventoryBadge?.color,
    },
    { 
      text: 'Messages', 
      icon: <HiOutlineMailOpen size={22} />, 
      path: '/dashboard/messagerie',
      badge: unreadCount > 0 ? 'New' : null,
      badgeColor: unreadCount > 0 ? colors.error : null,
    },
    { 
      text: 'Offers', 
      icon: <MdOutlineLocalOffer size={22} />, 
      path: '/dashboard/offers',
    },
    { 
      text: 'Discount Codes', 
      icon: <FiTrendingUp size={22} />, 
      path: '/dashboard/discounts',
    },
    { 
      text: 'Settings', 
      icon: <HiOutlineCog size={22} />, 
      path: '/dashboard/settings',
      subItems: [
        { text: 'Store Settings', path: '/dashboard/settings', icon: <MdOutlineStorefront size={18} /> },
        { text: 'Admin Users', path: '/dashboard/admins', icon: <MdOutlineVerifiedUser size={18} /> },
        { text: 'Security', path: '/dashboard/security', icon: <MdOutlineSecurity size={18} /> },
      ]
    },
  ];

  const menuItems = getMenuItems();

  // Stats data
  const stats = {
    revenue: '$12,345',
    orders: 342,
    customers: 1234,
  };

  // Notifications data
  const notifications = [
    { id: 1, title: 'New order received', description: 'Order #12345 - $234', time: '5 min ago', type: 'order' },
    { id: 2, title: 'Low stock alert', description: '"Perfume Amber" only 3 left', time: '1 hour ago', type: 'alert' },
    { id: 3, title: 'New customer registered', description: 'John Doe joined', time: '3 hours ago', type: 'customer' },
    { id: 4, title: 'Payment received', description: 'Invoice #987 - $567', time: '5 hours ago', type: 'payment' },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: scrolled ? alpha(colors.white, 0.98) : colors.white,
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          transition: 'all 0.3s ease',
          borderBottom: `1px solid ${alpha(colors.primary, 0.15)}`,
          boxShadow: scrolled ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ 
                color: colors.primary,
                '&:hover': { backgroundColor: alpha(colors.primary, 0.1) },
              }}
            >
              <MenuIcon />
            </IconButton>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: colors.primary,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/dashboard')}
              >
                <Typography variant="h6" sx={{ color: colors.secondary, fontWeight: 'bold' }}>
                  HS
                </Typography>
              </Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: colors.primary,
                    fontFamily: "'Amaranth', sans-serif",
                  }}
                >
                  Hamdi<span style={{ color: colors.secondary }}>Scents</span> <span style={{ color: colors.navyDark, fontSize: '0.8rem' }}>Panel</span>
                </Typography>
                <Typography variant="caption" sx={{ color: colors.navyDark }}>
                  <span style={{ fontWeight: 600, color: colors.secondaryDark, textDecoration: 'underline'}}>{user?.name || 'Admin'}'s</span> Dashboard
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            {/* Stats Chip */}
            {!isMobile && (
              <Paper
                elevation={0}
                sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: '50px',
                  background: alpha(colors.primary, 0.05),
                  border: `1px solid ${alpha(colors.primary, 0.15)}`,
                }}
              >
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Revenue</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.primary }}>{stats.revenue}</Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Orders</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.navyDark }}>{stats.orders}</Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Customers</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.navyDark }}>{stats.customers}</Typography>
                  </Box>
                </Stack>
              </Paper>
            )}

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton 
                onClick={handleNotificationsOpen} 
                sx={{ 
                  color: colors.primary,
                  background: alpha(colors.primary, 0.05),
                  '&:hover': { background: alpha(colors.primary, 0.1) },
                }}
              >
                <Badge 
                  badgeContent={notifications.length} 
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: colors.secondary,
                      color: colors.navyDark,
                    },
                  }}
                >
                  <HiOutlineBell size={22} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User Menu */}
            <Tooltip title="Account">
              <IconButton 
                onClick={handleMenuOpen} 
                sx={{ 
                  p: 0,
                  border: `2px solid ${alpha(colors.secondary, 0.5)}`,
                  borderRadius: '50%',
                }}
              >
                <Avatar
                  src={user?.profileImage || null}
                  sx={{
                    backgroundColor: user?.profileImage ? 'transparent' : colors.primary,
                    width: 42,
                    height: 42,
                    fontWeight: 600,
                  }}
                >
                  {!user?.profileImage && (user?.name?.charAt(0)?.toUpperCase() || 'A')}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>

        {scrolled && <LinearProgress sx={{ height: 2, backgroundColor: 'transparent', '& .MuiLinearProgress-bar': { backgroundColor: colors.secondary } }} />}
      </AppBar>

      {/* User Menu Dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              minWidth: 260,
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: `1px solid ${alpha(colors.primary, 0.1)}`,
            },
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(colors.primary, 0.1)}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar 
              src={user?.profileImage || null}
              sx={{ 
                backgroundColor: user?.profileImage ? 'transparent' : colors.primary, 
                width: 48, 
                height: 48 
              }}
            >
              {!user?.profileImage && (user?.name?.charAt(0)?.toUpperCase() || 'A')}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.navyDark }}>
                {user?.name || 'Admin User'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                {user?.email || 'admin@hamdiscents.com'}
              </Typography>
              <Chip 
                label={user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'User'} 
                size="small"
                sx={{
                  backgroundColor: alpha(colors.secondary, 0.2),
                  color: colors.primary,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  mt: 0.5,
                }}
              />
            </Box>
          </Box>
        </Box>
        
        <MenuItem onClick={() => { navigate('/dashboard/profile'); handleMenuClose(); }} sx={{ py: 1.5 }}>
          <ListItemIcon><HiOutlineUser size={20} color={colors.primary} /></ListItemIcon>
          <ListItemText primary="My Profile" slotProps={{ primary: { sx: { fontSize: '0.9rem' } } }} />
        </MenuItem>
        <MenuItem onClick={() => { navigate('/dashboard/settings'); handleMenuClose(); }} sx={{ py: 1.5 }}>
          <ListItemIcon><HiOutlineCog size={20} color={colors.primary} /></ListItemIcon>
          <ListItemText primary="Settings" slotProps={{ primary: { sx: { fontSize: '0.9rem' } } }} />
        </MenuItem>
        <MenuItem onClick={() => { navigate('/dashboard/security'); handleMenuClose(); }} sx={{ py: 1.5 }}>
          <ListItemIcon><MdOutlineSecurity size={20} color={colors.primary} /></ListItemIcon>
          <ListItemText primary="Security" slotProps={{ primary: { sx: { fontSize: '0.9rem' } } }} />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
          <ListItemIcon><HiOutlineLogout size={20} color={colors.primary} /></ListItemIcon>
          <ListItemText 
            primary="Logout" 
            slotProps={{ 
              primary: { 
                sx: { color: colors.primary, fontWeight: 600, fontSize: '0.9rem' } 
              } 
            }} 
          />
        </MenuItem>
      </Menu>

      {/* Notifications Dropdown */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              width: 360,
              maxWidth: '90vw',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: `1px solid ${alpha(colors.primary, 0.1)}`,
            },
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(colors.primary, 0.1)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.navyDark }}>Notifications</Typography>
          <Chip label="4 new" size="small" sx={{ bgcolor: colors.secondary, color: colors.navyDark, height: 20, fontSize: '0.7rem', fontWeight: 600 }} />
        </Box>
        
        {notifications.map((notif) => (
          <MenuItem key={notif.id} sx={{ py: 1.5, borderBottom: `1px solid ${alpha('#000', 0.05)}` }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', width: '100%' }}>
              <Avatar sx={{ bgcolor: alpha(colors.primary, 0.1), width: 36, height: 36 }}>
                {notif.type === 'order' && <FiShoppingCart size={18} color={colors.primary} />}
                {notif.type === 'alert' && <MdOutlineInventory size={18} color={colors.primary} />}
                {notif.type === 'customer' && <HiOutlineUsers size={18} color={colors.primary} />}
                {notif.type === 'payment' && <HiOutlineCreditCard size={18} color={colors.primary} />}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.navyDark }}>{notif.title}</Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>{notif.description}</Typography>
                <Typography variant="caption" sx={{ color: colors.secondaryDark, display: 'block', mt: 0.5 }}>
                  {notif.time}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
        
        <Box sx={{ p: 1.5, textAlign: 'center', borderTop: `1px solid ${alpha(colors.primary, 0.1)}` }}>
          <Button size="small" sx={{ color: colors.primary, textTransform: 'none' }}>
            View all notifications
          </Button>
        </Box>
      </Menu>

      {/* SIDEBAR DRAWER */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          width: sidebarOpen ? drawerWidth : collapsedDrawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarOpen ? drawerWidth : collapsedDrawerWidth,
            boxSizing: 'border-box',
            backgroundColor: colors.white,
            borderRight: `1px solid ${alpha(colors.primary, 0.1)}`,
            transition: 'width 0.2s ease',
            overflowX: 'hidden',
          },
        }}
      >
        {/* Sidebar Header with Close Button */}
        <Box sx={{ p: 1, textAlign: 'center', borderBottom: `1px solid ${alpha(colors.primary, 0.1)}` }}>
          <IconButton 
            onClick={handleDrawerToggle} 
            sx={{ color: colors.primary, backgroundColor: alpha(colors.primary, 0.05) }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Navigation Menu */}
        <List sx={{ px: 1.5, py: 2 }}>
          {menuItems.map((item) => (
            <React.Fragment key={item.text}>
              <ListItem
                onClick={() => item.subItems ? toggleSubMenu(item.text) : handleNavigation(item.path)}
                sx={{
                  mb: 1,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  backgroundColor: location.pathname === item.path 
                    ? alpha(colors.primary, 0.08)
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: alpha(colors.primary, 0.05),
                  },
                  transition: 'all 0.2s ease',
                  justifyContent: sidebarOpen ? 'initial' : 'center',
                  px: sidebarOpen ? 2 : 1,
                  py: 1,
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path ? colors.primary : '#666',
                    minWidth: sidebarOpen ? 40 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {sidebarOpen && (
                  <>
                    <ListItemText 
                      primary={item.text} 
                      slotProps={{ 
                        primary: { 
                          sx: {
                            color: location.pathname === item.path ? colors.primary : colors.navyDark,
                            fontWeight: location.pathname === item.path ? 600 : 400,
                            fontSize: '0.9rem',
                          }
                        } 
                      }} 
                    />
                    {item.badge && (
                      <Chip 
                        label={item.badge} 
                        size="small" 
                        sx={{ 
                          backgroundColor: item.badgeColor || colors.secondary, 
                          color: item.badgeColor ? colors.white : colors.navyDark, 
                          height: 20, 
                          fontSize: '0.65rem',
                          fontWeight: 600,
                        }} 
                      />
                    )}
                    {item.subItems && (
                      <IconButton size="small" sx={{ color: '#666' }}>
                        {openSubMenus[item.text] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                      </IconButton>
                    )}
                  </>
                )}
              </ListItem>

              {/* Submenu Items */}
              {item.subItems && sidebarOpen && (
                <Collapse in={openSubMenus[item.text]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 4 }}>
                    {item.subItems.map((subItem) => (
                      <ListItem
                        key={subItem.text}
                        onClick={() => handleNavigation(subItem.path)}
                        sx={{
                          mb: 0.5,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: location.pathname === subItem.path 
                            ? alpha(colors.primary, 0.05) 
                            : 'transparent',
                          '&:hover': {
                            backgroundColor: alpha(colors.primary, 0.03),
                          },
                          transition: 'all 0.2s ease',
                          py: 0.8,
                        }}
                      >
                        {subItem.icon && (
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            {subItem.icon}
                          </ListItemIcon>
                        )}
                        <ListItemText 
                          primary={subItem.text} 
                          slotProps={{ 
                            primary: { 
                              sx: {
                                fontSize: '0.8rem',
                                color: location.pathname === subItem.path ? colors.primary : '#666',
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
      </Drawer>
    </Box>
  );
};

export default AdminBar;