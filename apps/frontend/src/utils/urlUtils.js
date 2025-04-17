/**
 * Cleans URL paths by removing duplicate media segments and normalizing slashes.
 * This function handles both full URLs and relative paths.
 *
 * @param {string} path - The original URL or path
 * @returns {string} - The cleaned and properly formatted URL
 */
export const cleanMediaPath = (path) => {
  if (!path) return '';

  // If it's already a full URL, return it as is
  if (path.startsWith('http')) {
    return path;
  }

  // Get environment configuration
  const mediaUrl = import.meta.env.VITE_MEDIA_URL || `${import.meta.env.VITE_API_BASE_URL}/media/`;

  // Remove leading/trailing slashes and clean up the path
  const cleanPath = path
    .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
    .replace(/\/media\/media\//g, '/media/') // Remove duplicate media segments
    .replace(/^media\/|\/media$/g, '') // Remove standalone media at start/end
    .replace(/\/+/g, '/'); // Replace multiple slashes with single

  // Combine the media URL with the cleaned path
  return `${mediaUrl.replace(/\/+$/, '')}/${cleanPath}`;
};

/**
 * Debug function to log media URL construction for troubleshooting
 * @param {string} path - The original image path
 */
export const debugImagePath = (path) => {
  if (!path) {
    console.log('DEBUG: No path provided');
    return;
  }

  const mediaUrl = import.meta.env.VITE_MEDIA_URL || `${import.meta.env.VITE_API_BASE_URL}/media/`;
  const cleanPath = path
    .replace(/^\/+|\/+$/g, '')
    .replace(/\/media\/media\//g, '/media/')
    .replace(/^media\/|\/media$/g, '')
    .replace(/\/+/g, '/');
  
  const finalUrl = `${mediaUrl.replace(/\/+$/, '')}/${cleanPath}`;
  
  console.log({
    originalPath: path,
    mediaUrl: mediaUrl,
    cleanedPath: cleanPath,
    finalUrl: finalUrl,
    envVariables: {
      VITE_MEDIA_URL: import.meta.env.VITE_MEDIA_URL,
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      VITE_ENV: import.meta.env.VITE_ENV,
      VITE_S3_PATH: import.meta.env.VITE_S3_PATH
    }
  });
  
  return finalUrl;
};