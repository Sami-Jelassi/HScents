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
  Pagination,
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
  LinearProgress,
  Menu,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Snackbar,
  Alert,
  Zoom,
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
import { motion } from 'framer-motion';
import api from '../services/api';

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
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
};

const Messagerie = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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

  // Filters
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
    
    // Tab filter
    if (currentTab === 1) filtered = filtered.filter(m => m.status === 'unread');
    if (currentTab === 2) filtered = filtered.filter(m => m.status === 'read');
    if (currentTab === 3) filtered = filtered.filter(m => m.isStarred);
    
    // Search filter
    if (filters.search) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        m.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        m.subject.toLowerCase().includes(filters.search.toLowerCase()) ||
        m.message.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(m => m.status === filters.status);
    }
    
    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(m => m.category === filters.category);
    }
    
    // Date range filter
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
    return <Chip icon={<span>{cat.icon}</span>} label={cat.label} size="small" sx={{ bgcolor: alpha(cat.color, 0.1), color: cat.color }} />;
  };

  const getStatusIcon = (status) => {
    if (status === 'unread') return <ErrorIcon sx={{ color: colors.error, fontSize: 20 }} />;
    if (status === 'read') return <CheckCircleIcon sx={{ color: colors.success, fontSize: 20 }} />;
    if (status === 'replied') return <ReplyIcon sx={{ color: colors.info, fontSize: 20 }} />;
    return <ScheduleIcon sx={{ color: colors.warning, fontSize: 20 }} />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
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
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            color: colors.primary, 
            fontFamily: "'Amaranth', sans-serif",
            mb: 1,
          }}
        >
          Message Center
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Manage and respond to customer inquiries
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.primary, 0.05) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Total Messages</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.primary }}>
                  {stats.total}
                </Typography>
              </Box>
              <EmailIcon sx={{ fontSize: 40, color: colors.primary, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.error, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Unread</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.error }}>
                  {stats.unread}
                </Typography>
              </Box>
              <MarkReadIcon sx={{ fontSize: 40, color: colors.error, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.success, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Read</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.success }}>
                  {stats.read}
                </Typography>
              </Box>
              <CheckCircleIcon sx={{ fontSize: 40, color: colors.success, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.info, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Replied</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.info }}>
                  {stats.replied || 0}
                </Typography>
              </Box>
              <ReplyIcon sx={{ fontSize: 40, color: colors.info, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.secondary, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Starred</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.secondary }}>
                  {stats.starred}
                </Typography>
              </Box>
              <StarIcon sx={{ fontSize: 40, color: colors.secondary, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs 
        value={currentTab} 
        onChange={(e, v) => setCurrentTab(v)}
        sx={{ mb: 3, borderBottom: `1px solid ${alpha(colors.primary, 0.1)}` }}
      >
        <Tab label="All Messages" />
        <Tab label="Unread" icon={<Badge badgeContent={stats.unread} color="error" />} />
        <Tab label="Read" />
        <Tab label="Starred" />
      </Tabs>

      {/* Toolbar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ gap: 2 }}>
          {selectedMessages.length > 0 && (
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                startIcon={<MarkReadIcon />}
                onClick={handleBulkMarkAsRead}
                sx={{ color: colors.success }}
              >
                Mark Read ({selectedMessages.length})
              </Button>
              <Button
                size="small"
                startIcon={<DeleteSweepIcon />}
                onClick={handleBulkDelete}
                sx={{ color: colors.error }}
              >
                Delete ({selectedMessages.length})
              </Button>
            </Stack>
          )}
          
          <TextField
            size="small"
            placeholder="Search messages..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            sx={{ flex: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: colors.primary }} />
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            variant="outlined"
            size="small"
            sx={{ borderColor: colors.primary, color: colors.primary }}
          >
            Filters
          </Button>
          
          <Tooltip title="Refresh">
            <IconButton onClick={fetchMessages} sx={{ color: colors.primary }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Advanced Filters */}
        {showFilters && (
          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(colors.primary, 0.1)}` }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="unread">Unread</MenuItem>
                    <MenuItem value="read">Read</MenuItem>
                    <MenuItem value="replied">Replied</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    label="Category"
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
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="From Date"
                  size="small"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="To Date"
                  size="small"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  sx={{ color: colors.primary }}
                >
                  Clear All Filters
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Messages Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: alpha(colors.primary, 0.05) }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectAll}
                  onChange={handleSelectAll}
                  sx={{ color: colors.primary }}
                />
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell>From</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedMessages.map((message) => (
              <TableRow 
                key={message._id} 
                hover
                selected={selectedMessages.includes(message._id)}
                sx={{ 
                  cursor: 'pointer',
                  bgcolor: message.status === 'unread' ? alpha(colors.primary, 0.02) : 'inherit',
                  '&:hover': { bgcolor: alpha(colors.primary, 0.04) },
                }}
                onClick={() => handleViewMessage(message)}
              >
                <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedMessages.includes(message._id)}
                    onChange={() => handleSelectOne(message._id)}
                    sx={{ color: colors.primary }}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title={message.status}>
                    {getStatusIcon(message.status)}
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, bgcolor: colors.primary }}>
                      {message.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: message.status === 'unread' ? 700 : 400 }}>
                        {message.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {message.email}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: message.status === 'unread' ? 700 : 400 }}>
                    {message.subject}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {message.message.substring(0, 50)}...
                  </Typography>
                </TableCell>
                <TableCell>{getCategoryChip(message.category)}</TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {formatDate(message.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                  <Stack direction="row" spacing={0.5} justifyContent="center">
                    <Tooltip title={message.isStarred ? 'Remove star' : 'Star message'}>
                      <IconButton size="small" onClick={() => handleToggleStar(message)}>
                        {message.isStarred ? 
                          <StarIcon sx={{ color: colors.secondary }} /> : 
                          <StarBorderIcon />
                        }
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Archive">
                      <IconButton size="small" onClick={() => handleArchive(message)} sx={{ color: colors.warning }}>
                        <ArchiveIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reply">
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setSelectedMessage(message);
                          setReplyDialogOpen(true);
                        }}
                        sx={{ color: colors.success }}
                      >
                        <ReplyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDelete(message)} sx={{ color: colors.error }}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredMessages.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Message Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
        maxWidth="md" 
        fullWidth
        TransitionComponent={Zoom}
      >
        {selectedMessage && (
          <>
            <DialogTitle sx={{ bgcolor: colors.primary, color: colors.white }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Message Details</Typography>
                <IconButton onClick={() => setDetailsOpen(false)} sx={{ color: colors.white }}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ width: 50, height: 50, bgcolor: colors.primary }}>
                      {selectedMessage.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary }}>
                        {selectedMessage.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {selectedMessage.email}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: colors.grayLight, borderRadius: '12px' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: colors.primary }}>
                      <SubjectIcon sx={{ fontSize: 16, mr: 0.5 }} /> Subject
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{selectedMessage.subject}</Typography>
                    
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: colors.primary }}>
                      <MessageIcon sx={{ fontSize: 16, mr: 0.5 }} /> Message
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{selectedMessage.message}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                    {getCategoryChip(selectedMessage.category)}
                    <Chip 
                      icon={selectedMessage.repliedAt ? <CheckCircleIcon /> : <ScheduleIcon />}
                      label={selectedMessage.repliedAt ? `Replied on ${new Date(selectedMessage.repliedAt).toLocaleDateString()}` : 'Not replied yet'}
                      size="small"
                    />
                    <Chip 
                      label={`Received: ${new Date(selectedMessage.createdAt).toLocaleString()}`}
                      size="small"
                      variant="outlined"
                    />
                    {selectedMessage.readAt && (
                      <Chip 
                        label={`Read: ${new Date(selectedMessage.readAt).toLocaleString()}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Grid>
                {selectedMessage.adminNotes && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: alpha(colors.secondary, 0.1), borderRadius: '12px' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.primary }}>
                        Admin Notes
                      </Typography>
                      <Typography variant="body2">{selectedMessage.adminNotes}</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              <Button
                variant="contained"
                startIcon={<ReplyIcon />}
                onClick={() => {
                  setReplyDialogOpen(true);
                  setDetailsOpen(false);
                }}
                sx={{ bgcolor: colors.primary }}
              >
                Reply to Message
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
      >
        <DialogTitle sx={{ bgcolor: colors.primary, color: colors.white }}>
          Reply to {selectedMessage?.name}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: colors.grayLight, borderRadius: '12px' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.primary }}>Original Message:</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>{selectedMessage?.message}</Typography>
            </Paper>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Your Reply"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your response here..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={actionLoading ? <CircularProgress size={20} /> : <SendIcon />}
            onClick={handleSendReply}
            disabled={actionLoading}
            sx={{ bgcolor: colors.primary }}
          >
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
        <Alert severity={snackbar.severity} sx={{ borderRadius: '12px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Messagerie;