/**
 * Cleans URL paths by removing duplicate media segments and normalizing slashes.
 * This function handles both full URLs and relative paths.
 *
 * @param {string} path - The original URL or path
 * @param {string} baseUrl - The base URL (optional)
 * @returns {string} - The cleaned and properly formatted URL
 */
export const cleanMediaPath = (path, baseUrl = '') => {
  if (!path) return '';

  // If it's already a full URL, return it as is
  if (path.startsWith('http')) {
    return path;
  }

  // Get environment configuration
  const isDevelopment = import.meta.env.VITE_ENV === 'development';
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const s3Path = import.meta.env.VITE_S3_PATH;

  // Remove leading/trailing slashes and clean up the path
  const cleanPath = path
    .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
    .replace(/\/media\/media\//g, '/media/') // Remove duplicate media segments
    .replace(/^media\/|\/media$/g, '') // Remove standalone media at start/end
    .replace(/\/+/g, '/'); // Replace multiple slashes with single

  // In development, use the Django development server
  if (isDevelopment && apiBaseUrl) {
    return `${apiBaseUrl}/media/${cleanPath}`;
  }

  // In production, use S3/CloudFront if configured
  if (s3Path) {
    return `${s3Path}/media/${cleanPath}`;
  }

  // Fallback to regular API URL
  const combinedPath = baseUrl
    ? `${baseUrl.replace(/\/+$/, '')}/${cleanPath}`
    : cleanPath;

  return combinedPath.includes('/media/')
    ? combinedPath
    : `${baseUrl}/media/${cleanPath}`;
};
