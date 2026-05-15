import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Button,
  alpha,
  Divider,
  IconButton,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Tabs,
  Tab,
  Checkbox,
  Snackbar,
  Alert,
  Zoom,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
  Archive as ArchiveIcon,
  Reply as ReplyIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Email as EmailIcon,
  Subject as SubjectIcon,
  Message as MessageIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  DeleteSweep as DeleteSweepIcon,
} from '@mui/icons-material';
import api from '../services/api';

const colors = {
  navyDark: '#0a1928',
  navyLight: '#1e3a5f',
  accentGold: '#73a7f6',
  white: '#ffffff',
  black: '#0a0a0a',
  grayLight: '#f5f5f5',
  primary: '#1e3a5f',
  primaryLight: '#3a5a7f',
  secondary: '#738ff6',
  secondaryDark: '#60b0e6',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
};

const Messagerie = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentTab, setCurrentTab] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    replied: 0,
    archived: 0,
    starred: 0,
  });

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    category: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [messages, filters, currentTab]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/contact');
      setMessages(response.data.messages);
      setStats(response.data.stats);
      setFilteredMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to load messages',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/contact/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...messages];
    
    if (currentTab === 1) filtered = filtered.filter(m => m.status === 'unread');
    if (currentTab === 2) filtered = filtered.filter(m => m.status === 'read');
    if (currentTab === 3) filtered = filtered.filter(m => m.isStarred);
    
    if (filters.search) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        m.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        m.subject.toLowerCase().includes(filters.search.toLowerCase()) ||
        m.message.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(m => m.status === filters.status);
    }
    
    if (filters.category !== 'all') {
      filtered = filtered.filter(m => m.category === filters.category);
    }
    
    if (filters.dateFrom) {
      filtered = filtered.filter(m => new Date(m.createdAt) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(m => new Date(m.createdAt) <= new Date(filters.dateTo));
    }
    
    setFilteredMessages(filtered);
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      category: 'all',
      dateFrom: '',
      dateTo: '',
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleMarkAsRead = async (message) => {
    try {
      setActionLoading(true);
      await api.put(`/contact/${message._id}/read`);
      await fetchMessages();
      await fetchStats();
      setSnackbar({
        open: true,
        message: 'Message marked as read',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error marking as read:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to mark as read',
        severity: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStar = async (message) => {
    try {
      const response = await api.put(`/contact/${message._id}/star`);
      await fetchMessages();
      await fetchStats();
      setSnackbar({
        open: true,
        message: response.data.message,
        severity: 'success',
      });
    } catch (error) {
      console.error('Error toggling star:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update star status',
        severity: 'error',
      });
    }
  };

  const handleArchive = async (message) => {
    try {
      await api.put(`/contact/${message._id}/archive`);
      await fetchMessages();
      await fetchStats();
      setSnackbar({
        open: true,
        message: 'Message archived',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error archiving message:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to archive message',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (message) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await api.delete(`/contact/${message._id}`);
        await fetchMessages();
        await fetchStats();
        setSnackbar({
          open: true,
          message: 'Message deleted successfully',
          severity: 'success',
        });
        if (selectedMessage?._id === message._id) {
          setDetailsOpen(false);
          setSelectedMessage(null);
        }
      } catch (error) {
        console.error('Error deleting message:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to delete message',
          severity: 'error',
        });
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedMessages.length} selected messages?`)) {
      try {
        await api.delete('/contact/bulk/delete', { data: { messageIds: selectedMessages } });
        await fetchMessages();
        await fetchStats();
        setSelectedMessages([]);
        setSelectAll(false);
        setSnackbar({
          open: true,
          message: `${selectedMessages.length} messages deleted`,
          severity: 'success',
        });
      } catch (error) {
        console.error('Error bulk deleting:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to delete messages',
          severity: 'error',
        });
      }
    }
  };

  const handleBulkMarkAsRead = async () => {
    try {
      await api.put('/contact/bulk/read', { messageIds: selectedMessages });
      await fetchMessages();
      await fetchStats();
      setSelectedMessages([]);
      setSelectAll(false);
      setSnackbar({
        open: true,
        message: 'Messages marked as read',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error bulk marking:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to mark messages as read',
        severity: 'error',
      });
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a reply message',
        severity: 'warning',
      });
      return;
    }
    
    try {
      setActionLoading(true);
      await api.post(`/contact/${selectedMessage._id}/reply`, { replyMessage: replyText });
      await fetchMessages();
      await fetchStats();
      setReplyDialogOpen(false);
      setReplyText('');
      setSnackbar({
        open: true,
        message: 'Reply sent successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error sending reply:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to send reply',
        severity: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    setDetailsOpen(true);
    if (message.status === 'unread') {
      await handleMarkAsRead(message);
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = paginatedMessages.map(m => m._id);
      setSelectedMessages(newSelected);
      setSelectAll(true);
    } else {
      setSelectedMessages([]);
      setSelectAll(false);
    }
  };

  const handleSelectOne = (id) => {
    const selectedIndex = selectedMessages.indexOf(id);
    let newSelected = [];
    
    if (selectedIndex === -1) {
      newSelected = [...selectedMessages, id];
    } else {
      newSelected = selectedMessages.filter((_, i) => i !== selectedIndex);
    }
    
    setSelectedMessages(newSelected);
    setSelectAll(newSelected.length === paginatedMessages.length);
  };

  const getCategoryChip = (category) => {
    const categories = {
      general: { label: 'General', color: colors.info, icon: '📧' },
      product: { label: 'Product Inquiry', color: colors.info, icon: '🛍️' },
      order: { label: 'Order', color: colors.warning, icon: '📦' },
      support: { label: 'Support', color: colors.primary, icon: '🛠️' },
      feedback: { label: 'Feedback', color: colors.success, icon: '💬' },
      complaint: { label: 'Complaint', color: colors.error, icon: '⚠️' },
    };
    const cat = categories[category] || { label: category, color: colors.primary, icon: '📧' };
    return <Chip icon={<span>{cat.icon}</span>} label={cat.label} size="small" sx={{ bgcolor: alpha(cat.color, 0.1), color: cat.color, fontSize: { xs: '0.6rem', sm: '0.75rem' } }} />;
  };

  const getStatusIcon = (status) => {
    if (status === 'unread') return <ErrorIcon sx={{ color: colors.error, fontSize: { xs: 16, sm: 20 } }} />;
    if (status === 'read') return <CheckCircleIcon sx={{ color: colors.success, fontSize: { xs: 16, sm: 20 } }} />;
    if (status === 'replied') return <ReplyIcon sx={{ color: colors.info, fontSize: { xs: 16, sm: 20 } }} />;
    return <ScheduleIcon sx={{ color: colors.warning, fontSize: { xs: 16, sm: 20 } }} />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const paginatedMessages = filteredMessages.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, overflowX: 'hidden' }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 1.5, sm: 2, md: 4 } }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            color: colors.primary, 
            fontFamily: "'Amaranth', sans-serif",
            mb: 0.25,
            fontSize: { xs: '1.1rem', sm: '1.5rem', md: '2.125rem' },
            lineHeight: 1.2,
          }}
        >
          Message Center
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' } }}>
          Manage and respond to customer inquiries
        </Typography>
      </Box>

      {/* Stats Cards - Responsive Grid */}
      <Grid container spacing={{ xs: 0.75, sm: 1.5, md: 3 }} sx={{ mb: { xs: 1.5, sm: 2, md: 4 } }}>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <Paper sx={{ p: { xs: 1, sm: 1.5, md: 2 }, borderRadius: { xs: '8px', sm: '12px', md: '16px' }, bgcolor: alpha(colors.primary, 0.05), height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={0.5}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: '#666', fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.75rem' }, display: 'block', overflow: 'hidden' }}>Total</Typography>
                <Typography sx={{ fontWeight: 800, color: colors.primary, fontSize: { xs: '1.1rem', sm: '1.5rem', md: '2.5rem' }, lineHeight: 1 }}>
                  {stats.total}
                </Typography>
              </Box>
              <EmailIcon sx={{ fontSize: { xs: 20, sm: 30, md: 40 }, color: colors.primary, opacity: 0.5, flexShrink: 0 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <Paper sx={{ p: { xs: 1, sm: 1.5, md: 2 }, borderRadius: { xs: '8px', sm: '12px', md: '16px' }, bgcolor: alpha(colors.error, 0.1), height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={0.5}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: '#666', fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.75rem' }, display: 'block', overflow: 'hidden' }}>Unread</Typography>
                <Typography sx={{ fontWeight: 800, color: colors.error, fontSize: { xs: '1.1rem', sm: '1.5rem', md: '2.5rem' }, lineHeight: 1 }}>
                  {stats.unread}
                </Typography>
              </Box>
              <MarkReadIcon sx={{ fontSize: { xs: 20, sm: 30, md: 40 }, color: colors.error, opacity: 0.5, flexShrink: 0 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <Paper sx={{ p: { xs: 1, sm: 1.5, md: 2 }, borderRadius: { xs: '8px', sm: '12px', md: '16px' }, bgcolor: alpha(colors.success, 0.1), height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={0.5}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: '#666', fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.75rem' }, display: 'block', overflow: 'hidden' }}>Read</Typography>
                <Typography sx={{ fontWeight: 800, color: colors.success, fontSize: { xs: '1.1rem', sm: '1.5rem', md: '2.5rem' }, lineHeight: 1 }}>
                  {stats.read}
                </Typography>
              </Box>
              <CheckCircleIcon sx={{ fontSize: { xs: 20, sm: 30, md: 40 }, color: colors.success, opacity: 0.5, flexShrink: 0 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <Paper sx={{ p: { xs: 1, sm: 1.5, md: 2 }, borderRadius: { xs: '8px', sm: '12px', md: '16px' }, bgcolor: alpha(colors.info, 0.1), height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={0.5}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: '#666', fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.75rem' }, display: 'block', overflow: 'hidden' }}>Replied</Typography>
                <Typography sx={{ fontWeight: 800, color: colors.info, fontSize: { xs: '1.1rem', sm: '1.5rem', md: '2.5rem' }, lineHeight: 1 }}>
                  {stats.replied || 0}
                </Typography>
              </Box>
              <ReplyIcon sx={{ fontSize: { xs: 20, sm: 30, md: 40 }, color: colors.info, opacity: 0.5, flexShrink: 0 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <Paper sx={{ p: { xs: 1, sm: 1.5, md: 2 }, borderRadius: { xs: '8px', sm: '12px', md: '16px' }, bgcolor: alpha(colors.secondary, 0.1), height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={0.5}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: '#666', fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.75rem' }, display: 'block', overflow: 'hidden' }}>Starred</Typography>
                <Typography sx={{ fontWeight: 800, color: colors.secondary, fontSize: { xs: '1.1rem', sm: '1.5rem', md: '2.5rem' }, lineHeight: 1 }}>
                  {stats.starred}
                </Typography>
              </Box>
              <StarIcon sx={{ fontSize: { xs: 20, sm: 30, md: 40 }, color: colors.secondary, opacity: 0.5, flexShrink: 0 }} />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs 
        value={currentTab} 
        onChange={(e, v) => setCurrentTab(v)}
        sx={{ mb: { xs: 1.5, sm: 2 }, borderBottom: `1px solid ${alpha(colors.primary, 0.1)}` }}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        <Tab label="All" sx={{ fontSize: { xs: '0.7rem', sm: '0.85rem' }, minWidth: 'auto', px: { xs: 1, sm: 2 } }} />
        <Tab 
          label="Unread" 
          icon={<Badge badgeContent={stats.unread} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.5rem', height: 14, minWidth: 14 } }} />} 
          iconPosition="end"
          sx={{ fontSize: { xs: '0.7rem', sm: '0.85rem' }, minWidth: 'auto', px: { xs: 1, sm: 2 } }}
        />
        <Tab label="Read" sx={{ fontSize: { xs: '0.7rem', sm: '0.85rem' }, minWidth: 'auto', px: { xs: 1, sm: 2 } }} />
        <Tab label="Starred" sx={{ fontSize: { xs: '0.7rem', sm: '0.85rem' }, minWidth: 'auto', px: { xs: 1, sm: 2 } }} />
      </Tabs>

      {/* Toolbar */}
      <Paper sx={{ p: { xs: 1, sm: 1.5, md: 2 }, mb: { xs: 1.5, sm: 2 }, borderRadius: '12px' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.75, sm: 1 }}>
          {selectedMessages.length > 0 && (
            <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} sx={{ order: { xs: 2, sm: 1 }, flexWrap: 'wrap' }}>
              <Button
                size="small"
                startIcon={<MarkReadIcon />}
                onClick={handleBulkMarkAsRead}
                sx={{ color: colors.success, fontSize: { xs: '0.6rem', sm: '0.75rem' }, padding: '4px 8px', minWidth: 'auto' }}
              >
                Read ({selectedMessages.length})
              </Button>
              <Button
                size="small"
                startIcon={<DeleteSweepIcon />}
                onClick={handleBulkDelete}
                sx={{ color: colors.error, fontSize: { xs: '0.6rem', sm: '0.75rem' }, padding: '4px 8px', minWidth: 'auto' }}
              >
                Delete ({selectedMessages.length})
              </Button>
            </Stack>
          )}
          
          <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} sx={{ flex: 1, order: { xs: 1, sm: 2 }, minWidth: 0 }}>
            <TextField
              size="small"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              fullWidth
              sx={{ flex: 1, minWidth: 0 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: colors.primary, fontSize: { xs: 18, sm: 22 } }} />
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              variant="outlined"
              size="small"
              sx={{ borderColor: colors.primary, color: colors.primary, whiteSpace: 'nowrap', fontSize: { xs: '0.6rem', sm: '0.75rem' }, padding: '6px 8px', minWidth: 'auto' }}
            >
              {isMobile ? '' : 'Filters'}
            </Button>
            
            <Tooltip title="Refresh">
              <IconButton onClick={fetchMessages} sx={{ color: colors.primary, padding: '8px' }}>
                <RefreshIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {showFilters && (
          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${alpha(colors.primary, 0.1)}` }}>
            <Grid container spacing={{ xs: 0.75, sm: 1 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: { xs: '0.7rem', sm: '0.85rem' } }}>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Status"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.85rem' } }}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="unread">Unread</MenuItem>
                    <MenuItem value="read">Read</MenuItem>
                    <MenuItem value="replied">Replied</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: { xs: '0.7rem', sm: '0.85rem' } }}>Category</InputLabel>
                  <Select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    label="Category"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.85rem' } }}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="general">General</MenuItem>
                    <MenuItem value="product">Product Inquiry</MenuItem>
                    <MenuItem value="order">Order</MenuItem>
                    <MenuItem value="support">Support</MenuItem>
                    <MenuItem value="feedback">Feedback</MenuItem>
                    <MenuItem value="complaint">Complaint</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="From Date"
                  size="small"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& input': { fontSize: { xs: '0.7rem', sm: '0.85rem' } } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="To Date"
                  size="small"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& input': { fontSize: { xs: '0.7rem', sm: '0.85rem' } } }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  size="small"
                  sx={{ color: colors.primary, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Messages List - Mobile Cards or Desktop Table */}
      {isMobile ? (
        <Box>
          {paginatedMessages.length === 0 ? (
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: '12px' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>No messages found</Typography>
            </Paper>
          ) : (
            paginatedMessages.map((message) => (
              <Card 
                key={message._id}
                sx={{ 
                  mb: 1, 
                  borderRadius: '8px',
                  bgcolor: message.status === 'unread' ? alpha(colors.primary, 0.02) : 'inherit',
                  border: selectedMessages.includes(message._id) ? `2px solid ${colors.primary}` : '1px solid transparent',
                }}
              >
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Stack spacing={0.75}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Checkbox
                          checked={selectedMessages.includes(message._id)}
                          onChange={(e) => { e.stopPropagation(); handleSelectOne(message._id); }}
                          size="small"
                          sx={{ p: 0.3, color: colors.primary }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {getStatusIcon(message.status)}
                      </Stack>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleToggleStar(message); }} sx={{ p: 0.3 }}>
                        {message.isStarred ? <StarIcon sx={{ color: colors.secondary, fontSize: 14 }} /> : <StarBorderIcon sx={{ fontSize: 14 }} />}
                      </IconButton>
                    </Stack>

                    <Box onClick={() => handleViewMessage(message)} sx={{ cursor: 'pointer' }}>
                      <Stack direction="row" spacing={0.75} alignItems="flex-start">
                        <Avatar sx={{ width: 28, height: 28, bgcolor: colors.primary, fontSize: '0.7rem', flexShrink: 0 }}>
                          {message.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: message.status === 'unread' ? 700 : 400, fontSize: '0.75rem' }}>
                            {message.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.6rem' }}>
                            {message.email}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.6rem', flexShrink: 0 }}>
                          {formatDate(message.createdAt)}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ fontWeight: message.status === 'unread' ? 600 : 400, fontSize: '0.75rem', mt: 0.5 }}>
                        {message.subject}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.6rem' }}>
                        {message.message}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.75 }}>
                    {getCategoryChip(message.category)}
                  </Stack>

                  <Stack direction="row" spacing={0.5} justifyContent="flex-end" sx={{ pt: 0.5, borderTop: '1px solid #eee' }}>
                    <Tooltip title="Archive">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleArchive(message); }} sx={{ color: colors.warning, padding: '4px' }}>
                        <ArchiveIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reply">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setSelectedMessage(message); setReplyDialogOpen(true); }} sx={{ color: colors.success, padding: '4px' }}>
                        <ReplyIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(message); }} sx={{ color: colors.error, padding: '4px' }}>
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardContent>
              </Card>
            ))
          )}
          
          {filteredMessages.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
              <TablePagination
                rowsPerPageOptions={[5, 10]}
                component="div"
                count={filteredMessages.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                sx={{
                  '& .MuiTablePagination-toolbar': { flexWrap: 'wrap', justifyContent: 'center', gap: 0.5, padding: '8px' },
                  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.65rem', margin: '2px 0' },
                  '& button': { padding: '4px' },
                }}
              />
            </Box>
          )}
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
          <Table size={isTablet ? "small" : "medium"}>
            <TableHead sx={{ bgcolor: alpha(colors.primary, 0.05) }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox checked={selectAll} onChange={handleSelectAll} sx={{ color: colors.primary }} />
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.7rem', sm: '0.85rem' } }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.7rem', sm: '0.85rem' } }}>From</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.7rem', sm: '0.85rem' } }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.7rem', sm: '0.85rem' } }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.7rem', sm: '0.85rem' } }}>Date</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: { xs: '0.7rem', sm: '0.85rem' } }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedMessages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>No messages found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMessages.map((message) => (
                  <TableRow 
                    key={message._id} 
                    hover
                    selected={selectedMessages.includes(message._id)}
                    sx={{ cursor: 'pointer', bgcolor: message.status === 'unread' ? alpha(colors.primary, 0.02) : 'inherit' }}
                    onClick={() => handleViewMessage(message)}
                  >
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selectedMessages.includes(message._id)} onChange={() => handleSelectOne(message._id)} sx={{ color: colors.primary }} />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={message.status}>{getStatusIcon(message.status)}</Tooltip>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: colors.primary, fontSize: '0.75rem' }}>{message.name.charAt(0)}</Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: message.status === 'unread' ? 700 : 400, fontSize: { xs: '0.7rem', sm: '0.85rem' } }}>{message.name}</Typography>
                          <Typography variant="caption" sx={{ color: '#666', fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>{message.email}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: message.status === 'unread' ? 700 : 400, fontSize: { xs: '0.7rem', sm: '0.85rem' } }}>{message.subject}</Typography>
                      <Typography variant="caption" sx={{ color: '#666', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>{message.message}</Typography>
                    </TableCell>
                    <TableCell>{getCategoryChip(message.category)}</TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#666', fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>{formatDate(message.createdAt)}</Typography>
                    </TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <IconButton size="small" onClick={() => handleToggleStar(message)}>
                          {message.isStarred ? <StarIcon sx={{ color: colors.secondary, fontSize: { xs: 16, sm: 20 } }} /> : <StarBorderIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
                        </IconButton>
                        <IconButton size="small" onClick={() => handleArchive(message)} sx={{ color: colors.warning }}><ArchiveIcon sx={{ fontSize: { xs: 16, sm: 20 } }} /></IconButton>
                        <IconButton size="small" onClick={() => { setSelectedMessage(message); setReplyDialogOpen(true); }} sx={{ color: colors.success }}><ReplyIcon sx={{ fontSize: { xs: 16, sm: 20 } }} /></IconButton>
                        <IconButton size="small" onClick={() => handleDelete(message)} sx={{ color: colors.error }}><DeleteIcon sx={{ fontSize: { xs: 16, sm: 20 } }} /></IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredMessages.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            sx={{ fontSize: { xs: '0.7rem', sm: '0.85rem' } }}
          />
        </TableContainer>
      )}

      {/* Message Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
        TransitionComponent={Zoom}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : '16px' } }}
      >
        {selectedMessage && (
          <>
            <DialogTitle sx={{ bgcolor: colors.primary, color: colors.white, fontSize: { xs: '0.9rem', sm: '1.25rem' }, p: { xs: 1.5, sm: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Message Details
                <IconButton onClick={() => setDetailsOpen(false)} sx={{ color: colors.white, padding: '4px' }}><CloseIcon sx={{ fontSize: { xs: 18, sm: 24 } }} /></IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: { xs: 1.5, sm: 3 } }}>
              <Grid container spacing={{ xs: 1, sm: 2 }}>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: colors.primary, fontSize: '1rem' }}>{selectedMessage.name.charAt(0)}</Avatar>
                    <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>{selectedMessage.name}</Typography>
                      <Typography variant="body2" sx={{ color: '#666', fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>{selectedMessage.email}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: colors.grayLight, borderRadius: '12px' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: colors.primary, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                      <SubjectIcon sx={{ fontSize: { xs: 14, sm: 16 }, mr: 0.5, verticalAlign: 'middle' }} /> Subject
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontSize: { xs: '0.75rem', sm: '0.95rem' } }}>{selectedMessage.subject}</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: colors.primary, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                      <MessageIcon sx={{ fontSize: { xs: 14, sm: 16 }, mr: 0.5, verticalAlign: 'middle' }} /> Message
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', fontSize: { xs: '0.75rem', sm: '0.95rem' } }}>{selectedMessage.message}</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ gap: 0.75 }}>
                    {getCategoryChip(selectedMessage.category)}
                    <Chip icon={selectedMessage.repliedAt ? <CheckCircleIcon /> : <ScheduleIcon />} label={selectedMessage.repliedAt ? `Replied on ${new Date(selectedMessage.repliedAt).toLocaleDateString()}` : 'Not replied yet'} size="small" sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }} />
                    <Chip label={`Received: ${new Date(selectedMessage.createdAt).toLocaleString()}`} size="small" variant="outlined" sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }} />
                    {selectedMessage.readAt && <Chip label={`Read: ${new Date(selectedMessage.readAt).toLocaleString()}`} size="small" variant="outlined" sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }} />}
                  </Stack>
                </Grid>
                {selectedMessage.adminNotes && (
                  <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 1.5, bgcolor: alpha(colors.secondary, 0.1), borderRadius: '12px' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.primary, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>Admin Notes</Typography>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.7rem', sm: '0.85rem' } }}>{selectedMessage.adminNotes}</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: { xs: 1, sm: 2 }, pt: 0, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
              <Button onClick={() => setDetailsOpen(false)} fullWidth={isMobile} sx={{ fontSize: { xs: '0.7rem', sm: '0.85rem' } }}>Close</Button>
              <Button variant="contained" startIcon={<ReplyIcon />} onClick={() => { setReplyDialogOpen(true); setDetailsOpen(false); }} fullWidth={isMobile} sx={{ bgcolor: colors.primary, fontSize: { xs: '0.7rem', sm: '0.85rem' } }}>
                Reply
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Reply Dialog */}
      <Dialog 
        open={replyDialogOpen} 
        onClose={() => setReplyDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : '16px' } }}
      >
        <DialogTitle sx={{ bgcolor: colors.primary, color: colors.white, fontSize: { xs: '0.9rem', sm: '1.25rem' }, p: { xs: 1.5, sm: 2 } }}>
          Reply to {selectedMessage?.name}
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1.5, sm: 3 } }}>
          <Stack spacing={1.5}>
            <Paper sx={{ p: { xs: 1, sm: 1.5 }, bgcolor: colors.grayLight, borderRadius: '12px' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.primary, fontSize: { xs: '0.7rem', sm: '0.85rem' } }}>Original Message:</Typography>
              <Typography variant="body2" sx={{ mt: 0.75, fontSize: { xs: '0.7rem', sm: '0.85rem' } }}>{selectedMessage?.message}</Typography>
            </Paper>
            <TextField fullWidth multiline rows={5} label="Your Reply" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your response here..." size="small" sx={{ '& textarea': { fontSize: { xs: '0.75rem', sm: '0.95rem' } } }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1, sm: 2 }, pt: 0, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
          <Button onClick={() => setReplyDialogOpen(false)} fullWidth={isMobile} sx={{ fontSize: { xs: '0.7rem', sm: '0.85rem' } }}>Cancel</Button>
          <Button variant="contained" startIcon={actionLoading ? <CircularProgress size={16} /> : <SendIcon />} onClick={handleSendReply} disabled={actionLoading} fullWidth={isMobile} sx={{ bgcolor: colors.primary, fontSize: { xs: '0.7rem', sm: '0.85rem' } }}>
            Send Reply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: '12px', fontSize: { xs: '0.7rem', sm: '0.85rem' } }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Messagerie;