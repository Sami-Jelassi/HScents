import React from 'react';
import { Typography, Box } from '@mui/material';

const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#000000', mb: 3 }}>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Welcome to the admin dashboard!
      </Typography>
    </Box>
  );
};

export default Dashboard;