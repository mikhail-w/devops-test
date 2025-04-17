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
  const mediaUrl = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000/media/';

  // Remove leading/trailing slashes and clean up the path
  const cleanPath = path
    .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
    .replace(/\/media\/media\//g, '/media/') // Remove duplicate media segments
    .replace(/^media\/|\/media$/g, '') // Remove standalone media at start/end
    .replace(/\/+/g, '/'); // Replace multiple slashes with single

  // Combine the media URL with the cleaned path
  return `${mediaUrl.replace(/\/+$/, '')}/${cleanPath}`;
};
