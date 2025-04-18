import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: '/',  // Use relative URL since we're proxying through Vite
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Only add authorization header for protected routes
    const protectedRoutes = [
      '/api/users/',
      '/api/orders/',
      '/api/products/create/',
      '/api/products/delete/',
      '/api/products/update/',
      '/api/blog/',
    ];

    // Check if the current request path matches any protected route
    const isProtectedRoute = protectedRoutes.some(route => 
      config.url.startsWith(route)
    );

    // Get token from localStorage if it exists and route is protected
    if (isProtectedRoute) {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const { token } = JSON.parse(userInfo);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.error('CORS error:', error);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 