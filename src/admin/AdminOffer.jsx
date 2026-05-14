import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Avatar,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  Divider,
  Card,
  CardContent,
  Tabs,
  Tab,
  Tooltip,
  TablePagination,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
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

const AdminOffer = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    comingSoon: 0,
    featured: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    tag: 'Limited Time',
    startDate: '',
    endDate: '',
    isFeatured: false,
    discountPercentage: '',
    sizes: [{ size: '30ml', price: 0, stock: 0 }]
  });

  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [moreImages, setMoreImages] = useState([]);
  const [moreImagesPreviews, setMoreImagesPreviews] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/offers');
      setOffers(response.data.offers);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load offers',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (offer = null) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData({
        name: offer.name || '',
        description: offer.description || '',
        shortDescription: offer.shortDescription || '',
        tag: offer.tag || 'Limited Time',
        startDate: offer.startDate ? new Date(offer.startDate).toISOString().slice(0, 16) : '',
        endDate: offer.endDate ? new Date(offer.endDate).toISOString().slice(0, 16) : '',
        isFeatured: offer.isFeatured || false,
        discountPercentage: offer.discountPercentage || '',
        sizes: offer.sizes || [{ size: '30ml', price: 0, stock: 0 }]
      });
      setMainImagePreview(offer.mainImage);
      setMoreImagesPreviews(offer.moreImages || []);
    } else {
      setEditingOffer(null);
      setFormData({
        name: '',
        description: '',
        shortDescription: '',
        tag: 'Limited Time',
        startDate: new Date().toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        isFeatured: false,
        discountPercentage: '',
        sizes: [{ size: '30ml', price: 0, stock: 0 }]
      });
      setMainImagePreview(null);
      setMoreImagesPreviews([]);
      setMainImage(null);
      setMoreImages([]);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingOffer(null);
    setFormLoading(false);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSwitchChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked
    });
  };

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...formData.sizes];
    newSizes[index][field] = value;
    setFormData({ ...formData, sizes: newSizes });
  };

  const addSize = () => {
    setFormData({
      ...formData,
      sizes: [...formData.sizes, { size: '30ml', price: 0, stock: 0 }]
    });
  };

  const removeSize = (index) => {
    const newSizes = formData.sizes.filter((_, i) => i !== index);
    setFormData({ ...formData, sizes: newSizes });
  };

  const handleMainImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'Image size should be less than 5MB',
          severity: 'error',
        });
        return;
      }
      setMainImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMoreImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    
    if (validFiles.length !== files.length) {
      setSnackbar({
        open: true,
        message: 'Some images exceed 5MB limit',
        severity: 'error',
      });
    }
    
    setMoreImages([...moreImages, ...validFiles]);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMoreImagesPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMoreImage = (index) => {
    setMoreImages(moreImages.filter((_, i) => i !== index));
    setMoreImagesPreviews(moreImagesPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setFormLoading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('shortDescription', formData.shortDescription);
      formDataToSend.append('tag', formData.tag);
      formDataToSend.append('startDate', formData.startDate);
      formDataToSend.append('endDate', formData.endDate);
      formDataToSend.append('isFeatured', formData.isFeatured);
      if (formData.discountPercentage) {
        formDataToSend.append('discountPercentage', formData.discountPercentage);
      }
      formDataToSend.append('sizes', JSON.stringify(formData.sizes));
      
      if (mainImage) {
        formDataToSend.append('mainImage', mainImage);
      }
      
      moreImages.forEach(image => {
        formDataToSend.append('moreImages', image);
      });
      
      if (editingOffer) {
        await api.put(`/offers/${editingOffer._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSnackbar({
          open: true,
          message: 'Offer updated successfully!',
          severity: 'success',
        });
      } else {
        await api.post('/offers', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSnackbar({
          open: true,
          message: 'Offer created successfully!',
          severity: 'success',
        });
      }
      
      fetchOffers();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving offer:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save offer',
        severity: 'error',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (offerId) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await api.delete(`/offers/${offerId}`);
        setSnackbar({
          open: true,
          message: 'Offer deleted successfully!',
          severity: 'success',
        });
        fetchOffers();
      } catch (error) {
        console.error('Error deleting offer:', error);
        setSnackbar({
          open: true,
          message: 'Failed to delete offer',
          severity: 'error',
        });
      }
    }
  };

  const handleToggleStatus = async (offer) => {
    try {
      await api.put(`/offers/${offer._id}/toggle`);
      setSnackbar({
        open: true,
        message: `Offer ${offer.isActive ? 'deactivated' : 'activated'} successfully`,
        severity: 'success',
      });
      fetchOffers();
    } catch (error) {
      console.error('Error toggling offer:', error);
      setSnackbar({
        open: true,
        message: 'Failed to toggle offer status',
        severity: 'error',
      });
    }
  };

  const getStatusChip = (offer) => {
    if (!offer.isActive) {
      return <Chip label="Inactive" size="small" sx={{ bgcolor: colors.grayLight, color: '#666' }} />;
    }
    if (offer.status === 'active') {
      return <Chip label="Active" size="small" sx={{ bgcolor: colors.success, color: '#fff' }} />;
    }
    if (offer.status === 'expired') {
      return <Chip label="Expired" size="small" sx={{ bgcolor: colors.error, color: '#fff' }} />;
    }
    if (offer.status === 'coming-soon') {
      return <Chip label="Coming Soon" size="small" sx={{ bgcolor: colors.warning, color: '#fff' }} />;
    }
    return <Chip label={offer.status} size="small" />;
  };

  const getTagChip = (tag) => {
    const tagColors = {
      'Summer Sale': colors.warning,
      'Winter Sale': colors.info,
      'Black Friday': colors.navyDark,
      'Flash Sale': colors.error,
      'Limited Time': colors.secondary,
      'Clearance': colors.success,
      'New Year': colors.accentGold,
      'Holiday Special': colors.primary,
    };
    const color = tagColors[tag] || colors.primary;
    return <Chip label={tag} size="small" sx={{ bgcolor: alpha(color, 0.2), color: color }} />;
  };

  const paginatedOffers = offers.slice(
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
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            color: colors.primary, 
            fontFamily: "'Amaranth', sans-serif",
            mb: 1,
          }}
        >
          Special Offers
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Create and manage promotional offers for your customers
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.primary, 0.05) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Total Offers</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.primary }}>
                  {stats.total}
                </Typography>
              </Box>
              <Typography variant="h2" sx={{ opacity: 0.5 }}>🎯</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.success, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Active</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.success }}>
                  {stats.active}
                </Typography>
              </Box>
              <CheckCircleIcon sx={{ fontSize: 40, color: colors.success, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.warning, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Coming Soon</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.warning }}>
                  {stats.comingSoon}
                </Typography>
              </Box>
              <ScheduleIcon sx={{ fontSize: 40, color: colors.warning, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.error, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Expired</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.error }}>
                  {stats.expired}
                </Typography>
              </Box>
              <CancelIcon sx={{ fontSize: 40, color: colors.error, opacity: 0.5 }} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(colors.secondary, 0.1) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Featured</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: colors.secondary }}>
                  {stats.featured}
                </Typography>
              </Box>
              <Typography variant="h2" sx={{ opacity: 0.5 }}>⭐</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: colors.primary,
            '&:hover': { bgcolor: colors.primaryLight },
            borderRadius: '50px',
            textTransform: 'none',
          }}
        >
          Create Offer
        </Button>
      </Box>

      {/* Offers Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: alpha(colors.primary, 0.05) }}>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Tag</TableCell>
              <TableCell>Sizes</TableCell>
              <TableCell>Price Range</TableCell>
              <TableCell>Valid Period</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOffers.map((offer) => (
              <TableRow key={offer._id} hover>
                <TableCell>
                  <Avatar src={offer.mainImage} sx={{ width: 50, height: 50, borderRadius: '8px' }} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{offer.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>{offer.slug}</Typography>
                </TableCell>
                <TableCell>{getTagChip(offer.tag)}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {offer.sizes?.map((size, idx) => (
                      <Chip key={idx} label={size.size} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  {offer.sizes?.length > 0 && (
                    <Typography variant="body2">
                      {Math.min(...offer.sizes.map(s => s.price))} - {Math.max(...offer.sizes.map(s => s.price))} TND
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {new Date(offer.startDate).toLocaleDateString()}<br />
                    → {new Date(offer.endDate).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>{getStatusChip(offer)}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={0.5} justifyContent="center">
                    <Tooltip title={offer.isActive ? 'Deactivate' : 'Activate'}>
                      <IconButton size="small" onClick={() => handleToggleStatus(offer)}>
                        {offer.isActive ? <ToggleOnIcon sx={{ color: colors.success }} /> : <ToggleOffIcon sx={{ color: '#999' }} />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenDialog(offer)} sx={{ color: colors.primary }}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDelete(offer._id)} sx={{ color: colors.error }}>
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
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={offers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Create/Edit Offer Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: colors.primary, color: colors.white }}>
          {editingOffer ? 'Edit Offer' : 'Create New Offer'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Tabs value={selectedTab} onChange={(e, v) => setSelectedTab(v)} sx={{ mb: 2 }}>
            <Tab label="Basic Info" />
            <Tab label="Sizes & Pricing" />
            <Tab label="Images" />
          </Tabs>

          {selectedTab === 0 && (
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Offer Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
                placeholder="e.g., Summer Flash Sale"
              />
              <TextField
                fullWidth
                label="Short Description"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleFormChange}
                multiline
                rows={2}
              />
              <TextField
                fullWidth
                label="Full Description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                multiline
                rows={4}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Offer Tag</InputLabel>
                    <Select name="tag" value={formData.tag} onChange={handleFormChange}>
                      <MenuItem value="Summer Sale">🏖️ Summer Sale</MenuItem>
                      <MenuItem value="Winter Sale">❄️ Winter Sale</MenuItem>
                      <MenuItem value="Black Friday">🖤 Black Friday</MenuItem>
                      <MenuItem value="Flash Sale">⚡ Flash Sale</MenuItem>
                      <MenuItem value="Limited Time">⏰ Limited Time</MenuItem>
                      <MenuItem value="Clearance">🏷️ Clearance</MenuItem>
                      <MenuItem value="New Year">🎆 New Year</MenuItem>
                      <MenuItem value="Holiday Special">🎄 Holiday Special</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Discount Percentage (Optional)"
                    name="discountPercentage"
                    value={formData.discountPercentage}
                    onChange={handleFormChange}
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Start Date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleFormChange}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="End Date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleFormChange}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
              </Grid>
              <FormControlLabel
                control={<Switch checked={formData.isFeatured} onChange={handleSwitchChange} name="isFeatured" />}
                label="Feature this offer (show on homepage)"
              />
            </Stack>
          )}

          {selectedTab === 1 && (
            <Stack spacing={2}>
              {formData.sizes.map((size, index) => (
                <Card key={index} sx={{ p: 2, bgcolor: colors.grayLight }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={3}>
                      <FormControl fullWidth>
                        <InputLabel>Size</InputLabel>
                        <Select
                          value={size.size}
                          onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                        >
                          <MenuItem value="5ml">5ml</MenuItem>
                          <MenuItem value="10ml">10ml</MenuItem>
                          <MenuItem value="30ml">30ml</MenuItem>
                          <MenuItem value="50ml">50ml</MenuItem>
                          <MenuItem value="100ml">100ml</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Offer Price (TND)"
                        value={size.price}
                        onChange={(e) => handleSizeChange(index, 'price', parseFloat(e.target.value))}
                        InputProps={{ startAdornment: <InputAdornment position="start">TND</InputAdornment> }}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Stock"
                        value={size.stock}
                        onChange={(e) => handleSizeChange(index, 'stock', parseInt(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <IconButton color="error" onClick={() => removeSize(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Card>
              ))}
              <Button startIcon={<AddIcon />} onClick={addSize} sx={{ alignSelf: 'flex-start' }}>
                Add Size
              </Button>
            </Stack>
          )}

          {selectedTab === 2 && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Main Image</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  {mainImagePreview && (
                    <Avatar src={mainImagePreview} sx={{ width: 100, height: 100, borderRadius: '8px' }} />
                  )}
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    sx={{ borderColor: colors.primary, color: colors.primary }}
                  >
                    Upload Main Image
                    <input type="file" hidden accept="image/*" onChange={handleMainImageUpload} />
                  </Button>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Additional Images</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                  {moreImagesPreviews.map((preview, index) => (
                    <Box key={index} sx={{ position: 'relative' }}>
                      <Avatar src={preview} sx={{ width: 80, height: 80, borderRadius: '8px' }} />
                      <IconButton
                        size="small"
                        sx={{ position: 'absolute', top: -8, right: -8, bgcolor: '#fff' }}
                        onClick={() => removeMoreImage(index)}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  sx={{ borderColor: colors.primary, color: colors.primary }}
                >
                  Upload More Images
                  <input type="file" hidden accept="image/*" multiple onChange={handleMoreImagesUpload} />
                </Button>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={formLoading}
            sx={{ bgcolor: colors.primary, '&:hover': { bgcolor: colors.primaryLight } }}
          >
            {formLoading ? <CircularProgress size={24} /> : (editingOffer ? 'Update' : 'Create')}
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

export default AdminOffer;