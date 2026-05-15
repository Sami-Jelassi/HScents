import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
  Avatar,
  Chip,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShoppingBag as OrdersIcon,
  AttachMoney as RevenueIcon,
  People as CustomersIcon,
  Inventory as ProductsIcon,
  Category as CategoryIcon,
  LocalOffer as OffersIcon,
  Discount as CouponsIcon,
  Email as MessagesIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import api from '../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  Filler
);

const colors = {
  navyDark: '#0a1928',
  navyLight: '#1e3a5f',
  accentGold: '#73a7f6',
  white: '#ffffff',
  black: '#0a0a0a',
  grayLight: '#ffffff',
  primary: '#1e3a5f',
  primaryLight: '#3a5a7f',
  secondary: '#738ff6',
  secondaryDark: '#60b0e6',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  purple: '#9c27b0',
  orange: '#ff5722',
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalOffers: 0,
    totalCoupons: 0,
    unreadMessages: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
  });
  const [chartData, setChartData] = useState({
    ordersByDay: [],
    revenueByDay: [],
    categoriesData: [],
    topProducts: [],
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [period, setPeriod] = useState('week');
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all necessary data in parallel
      const [ordersRes, productsRes, contactRes, couponsRes, offersRes] = await Promise.all([
        api.get('/orders'),
        api.get('/products'),
        api.get('/contact/stats'),
        api.get('/discounts'),
        api.get('/offers'),
      ]);

      const orders = ordersRes.data.orders;
      const products = productsRes.data.products;
      
      // Calculate stats
      const totalRevenue = orders
        .filter(o => o.orderStatus !== 'cancelled')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
      const pendingOrders = orders.filter(o => o.orderStatus === 'pending').length;
      
      // Get unique customers
      const uniqueCustomers = new Set(orders.map(o => o.customer?.email)).size;
      
      // Low stock products
      const lowStockProducts = products.filter(p => 
        p.sizes?.some(size => size.stock <= 5 && size.stock > 0)
      ).length;
      
      // Get unique categories
      const uniqueCategories = new Set(products.map(p => p.category)).size;
      
      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalCustomers: uniqueCustomers,
        totalProducts: products.length,
        totalCategories: uniqueCategories,
        totalOffers: offersRes.data.stats?.total || 0,
        totalCoupons: couponsRes.data.stats?.total || 0,
        unreadMessages: contactRes.data.stats?.unread || 0,
        lowStockProducts,
        pendingOrders,
      });

      // Process chart data
      processChartData(orders);
      
      // Get recent orders (last 5)
      setRecentOrders(orders.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (orders) => {
    // Get date range based on period
    const now = new Date();
    let daysToShow = 7;
    if (period === 'month') daysToShow = 30;
    if (period === 'year') daysToShow = 365;
    
    const dateMap = new Map();
    
    // Initialize date map
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dateMap.set(dateStr, { orders: 0, revenue: 0 });
    }
    
    // Fill data from orders
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const dateStr = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dateMap.has(dateStr)) {
        const existing = dateMap.get(dateStr);
        existing.orders += 1;
        existing.revenue += order.totalAmount || 0;
        dateMap.set(dateStr, existing);
      }
    });
    
    const labels = Array.from(dateMap.keys());
    const ordersData = Array.from(dateMap.values()).map(d => d.orders);
    const revenueData = Array.from(dateMap.values()).map(d => d.revenue);
    
    setChartData({
      ordersByDay: { labels, data: ordersData },
      revenueByDay: { labels, data: revenueData },
    });
  };

  const formatCurrency = (amount) => `${amount?.toLocaleString()} TND`;

  const getPercentChange = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        backgroundColor: colors.primary,
        titleColor: colors.white,
        bodyColor: colors.white,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: alpha(colors.grayLight, 0.5),
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const StatCard = ({ title, value, icon, color, trend, trendValue, onClick }) => (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      style={{ height: '100%' }}
    >
      <Card
        sx={{
          height: '100%',
          borderRadius: '16px',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: `0 8px 25px ${alpha(color, 0.2)}`,
            borderColor: color,
          },
          border: `1px solid ${alpha(color, 0.1)}`,
        }}
        onClick={onClick}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', fontWeight: 600, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                {title}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: colors.primary, mt: 1, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                {typeof value === 'number' && title.includes('Revenue') ? formatCurrency(value) : value?.toLocaleString()}
              </Typography>
              {trend && (
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
                  {trend > 0 ? (
                    <TrendingUpIcon sx={{ fontSize: 14, color: colors.success }} />
                  ) : (
                    <TrendingDownIcon sx={{ fontSize: 14, color: colors.error }} />
                  )}
                  <Typography variant="caption" sx={{ color: trend > 0 ? colors.success : colors.error }}>
                    {Math.abs(trend)}% from last {period}
                  </Typography>
                </Stack>
              )}
            </Box>
            <Avatar sx={{ bgcolor: alpha(color, 0.1), color: color, width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 }, ml: 1, flexShrink: 0 }}>
              {icon}
            </Avatar>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );

  const lineChartData = {
    labels: chartData.ordersByDay.labels,
    datasets: [
      {
        label: 'Orders',
        data: chartData.ordersByDay.data,
        borderColor: colors.primary,
        backgroundColor: alpha(colors.primary, 0.1),
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const revenueChartData = {
    labels: chartData.revenueByDay.labels,
    datasets: [
      {
        label: 'Revenue (TND)',
        data: chartData.revenueByDay.data,
        borderColor: colors.success,
        backgroundColor: alpha(colors.success, 0.1),
        fill: true,
        tension: 0.4,
      },
    ],
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, bgcolor: colors.grayLight, minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }} 
          flexWrap="wrap" 
          sx={{ gap: 2 }}
        >
          <Box sx={{ maxWidth: '100%' }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: colors.primary,
                fontFamily: "'Amaranth', sans-serif",
                mb: 1,
                fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.125rem' },
              }}
            >
              Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Welcome back! Here's what's happening with your store today.
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
            <Button
              variant={period === 'week' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setPeriod('week')}
              sx={{ borderRadius: '20px', textTransform: 'none', fontSize: { xs: '0.7rem', sm: '0.8125rem' }, px: { xs: 1.5, sm: 2 } }}
            >
              Week
            </Button>
            <Button
              variant={period === 'month' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setPeriod('month')}
              sx={{ borderRadius: '20px', textTransform: 'none', fontSize: { xs: '0.7rem', sm: '0.8125rem' }, px: { xs: 1.5, sm: 2 } }}
            >
              Month
            </Button>
            <Button
              variant={period === 'year' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setPeriod('year')}
              sx={{ borderRadius: '20px', textTransform: 'none', fontSize: { xs: '0.7rem', sm: '0.8125rem' }, px: { xs: 1.5, sm: 2 } }}
            >
              Year
            </Button>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchDashboardData} sx={{ color: colors.primary }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue}
            icon={<RevenueIcon />}
            color={colors.success}
            trend={12.5}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<OrdersIcon />}
            color={colors.primary}
            trend={8.2}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon={<CustomersIcon />}
            color={colors.info}
            trend={15.3}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={<ScheduleIcon />}
            color={colors.warning}
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: { xs: 1.5, sm: 2, md: 3 }, borderRadius: { xs: '16px', sm: '20px' }, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary, mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Orders Overview
            </Typography>
            <Box sx={{ height: { xs: 250, sm: 300 } }}>
              <Line data={lineChartData} options={lineChartOptions} />
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: { xs: 1.5, sm: 2, md: 3 }, borderRadius: { xs: '16px', sm: '20px' }, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary, mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Revenue Overview
            </Typography>
            <Box sx={{ height: { xs: 250, sm: 300 } }}>
              <Line data={revenueChartData} options={lineChartOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Second Row Stats */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Grid size={{ xs: 4, sm: 4, md: 2.4 }}>
          <StatCard
            title="Products"
            value={stats.totalProducts}
            icon={<ProductsIcon />}
            color={colors.purple}
          />
        </Grid>
        <Grid size={{ xs: 4, sm: 4, md: 2.4 }}>
          <StatCard
            title="Categories"
            value={stats.totalCategories}
            icon={<CategoryIcon />}
            color={colors.orange}
          />
        </Grid>
        <Grid size={{ xs: 4, sm: 4, md: 2.4 }}>
          <StatCard
            title="Active Offers"
            value={stats.totalOffers}
            icon={<OffersIcon />}
            color={colors.secondary}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
          <StatCard
            title="Discount Codes"
            value={stats.totalCoupons}
            icon={<CouponsIcon />}
            color={colors.info}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
          <StatCard
            title="Unread Messages"
            value={stats.unreadMessages}
            icon={<MessagesIcon />}
            color={stats.unreadMessages > 0 ? colors.error : colors.success}
          />
        </Grid>
      </Grid>

      {/* Alerts Section */}
      {(stats.lowStockProducts > 0 || stats.pendingOrders > 0) && (
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
          {stats.lowStockProducts > 0 && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: { xs: '12px', sm: '16px' },
                  bgcolor: alpha(colors.warning, 0.1),
                  border: `1px solid ${alpha(colors.warning, 0.3)}`,
                }}
              >
                <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center" flexWrap={{ xs: 'wrap', sm: 'nowrap' }} sx={{ gap: 1 }}>
                  <WarningIcon sx={{ color: colors.warning, fontSize: { xs: 24, sm: 32 } }} />
                  <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 0 }, order: { xs: 2, sm: 1 } }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.warning, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                      Low Stock Alert
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      You have {stats.lowStockProducts} product(s) with low stock (5 or fewer units remaining).
                    </Typography>
                  </Box>
                  <Button variant="outlined" size="small" sx={{ borderColor: colors.warning, color: colors.warning, fontSize: { xs: '0.7rem', sm: '0.8125rem' }, order: { xs: 1, sm: 2 }, flexShrink: 0 }}>
                    View Inventory
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          )}
          {stats.pendingOrders > 0 && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: { xs: '12px', sm: '16px' },
                  bgcolor: alpha(colors.info, 0.1),
                  border: `1px solid ${alpha(colors.info, 0.3)}`,
                }}
              >
                <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center" flexWrap={{ xs: 'wrap', sm: 'nowrap' }} sx={{ gap: 1 }}>
                  <ScheduleIcon sx={{ color: colors.info, fontSize: { xs: 24, sm: 32 } }} />
                  <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 0 }, order: { xs: 2, sm: 1 } }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.info, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                      Pending Orders
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      You have {stats.pendingOrders} order(s) waiting for processing.
                    </Typography>
                  </Box>
                  <Button variant="outlined" size="small" sx={{ borderColor: colors.info, color: colors.info, fontSize: { xs: '0.7rem', sm: '0.8125rem' }, order: { xs: 1, sm: 2 }, flexShrink: 0 }}>
                    View Orders
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Recent Activity */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        {/* Recent Orders */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ borderRadius: { xs: '16px', sm: '20px' }, overflow: 'hidden' }}>
            <Box sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: `1px solid ${colors.grayLight}`, bgcolor: colors.primary }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.white, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Recent Orders
              </Typography>
            </Box>
            <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
              {recentOrders.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', py: 4, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  No recent orders
                </Typography>
              ) : (
                <Stack spacing={{ xs: 1, sm: 2 }}>
                  {recentOrders.map((order) => (
                    <Box
                      key={order._id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: { xs: 1, sm: 1.5 },
                        borderRadius: '12px',
                        bgcolor: colors.grayLight,
                        flexWrap: { xs: 'wrap', sm: 'nowrap' },
                        gap: 1,
                        '&:hover': { bgcolor: alpha(colors.primary, 0.05) },
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          {order.orderNumber}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                          {order.customer?.fullName}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, display: 'flex', alignItems: { xs: 'flex-start', sm: 'flex-end' }, flexDirection: 'column' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: colors.primary, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          {formatCurrency(order.totalAmount)}
                        </Typography>
                        <Chip
                          label={order.orderStatus}
                          size="small"
                          sx={{
                            mt: 0.5,
                            height: 20,
                            fontSize: '0.65rem',
                            bgcolor: order.orderStatus === 'delivered' ? alpha(colors.success, 0.1) : alpha(colors.warning, 0.1),
                            color: order.orderStatus === 'delivered' ? colors.success : colors.warning,
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ borderRadius: { xs: '16px', sm: '20px' }, overflow: 'hidden' }}>
            <Box sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: `1px solid ${colors.grayLight}`, bgcolor: colors.primary }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.white, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Quick Actions
              </Typography>
            </Box>
            <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Grid container spacing={{ xs: 1, sm: 2 }}>
                <Grid size={{ xs: 6 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => window.location.href = '/dashboard/products/add'}
                    sx={{
                      py: { xs: 1, sm: 2 },
                      borderRadius: '12px',
                      borderColor: colors.primary,
                      color: colors.primary,
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      '&:hover': { bgcolor: alpha(colors.primary, 0.05) },
                    }}
                  >
                    Add Product
                  </Button>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => window.location.href = '/dashboard/offers'}
                    sx={{
                      py: { xs: 1, sm: 2 },
                      borderRadius: '12px',
                      borderColor: colors.secondary,
                      color: colors.secondary,
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      '&:hover': { bgcolor: alpha(colors.secondary, 0.05) },
                    }}
                  >
                    Create Offer
                  </Button>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => window.location.href = '/dashboard/discounts'}
                    sx={{
                      py: { xs: 1, sm: 2 },
                      borderRadius: '12px',
                      borderColor: colors.success,
                      color: colors.success,
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      '&:hover': { bgcolor: alpha(colors.success, 0.05) },
                    }}
                  >
                    Add Coupon
                  </Button>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => window.location.href = '/dashboard/inventory'}
                    sx={{
                      py: { xs: 1, sm: 2 },
                      borderRadius: '12px',
                      borderColor: colors.warning,
                      color: colors.warning,
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      '&:hover': { bgcolor: alpha(colors.warning, 0.05) },
                    }}
                  >
                    Update Stock
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const alpha = (color, opacity) => {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

export default Dashboard;