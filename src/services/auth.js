import api from './api';

const authService = {
  // Register user
  register: async (userData) => {
    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('dateOfBirth', userData.dateOfBirth);
    if (userData.profileImage) {
      formData.append('profileImage', userData.profileImage);
    }
    
    const response = await api.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', {
      email: credentials.email,
      password: credentials.password,
      rememberMe: credentials.rememberMe
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Verify identity for password reset
  verifyIdentity: async (email, dateOfBirth) => {
    const response = await api.post('/auth/forgot-password/verify-identity', {
      email,
      dateOfBirth
    });
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    const response = await api.post('/auth/forgot-password/verify-otp', {
      email,
      otp
    });
    return response.data;
  },

  // Reset password
  resetPassword: async (resetToken, newPassword) => {
    const response = await api.post('/auth/forgot-password/reset-password', {
      resetToken,
      newPassword
    });
    return response.data;
  },

  // Resend OTP
  resendOTP: async (email) => {
    const response = await api.post('/auth/forgot-password/resend-otp', {
      email
    });
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Get user from localStorage
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;