/**
 * Get the proper image URL based on environment and path
 * @param {string} imagePath - Path to the image
 * @returns {string} - Full URL to the image
 */
export const getImagePath = imagePath => {
  if (!imagePath) {
    console.log('No image path provided, using placeholder');
    return `${import.meta.env.VITE_API_BASE_URL}/media/default/placeholder.jpg`;
  }

  // If it's already a full URL (http, https, or S3), return it as is
  if (imagePath.startsWith('http') || imagePath.includes('amazonaws.com')) {
    return imagePath;
  }
  
  // Get environment configuration for media URL
  const mediaUrl = import.meta.env.VITE_MEDIA_URL || `${import.meta.env.VITE_API_BASE_URL}/media/`;
  
  // Remove leading/trailing slashes and clean up the path
  const cleanPath = imagePath
    .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
    .replace(/^media\/|\/media\//g, '') // Remove media prefixes/suffixes
    .replace(/\/+/g, '/'); // Replace multiple slashes with single
  
  // Combine the media URL with the cleaned path
  return `${mediaUrl.replace(/\/+$/, '')}/${cleanPath}`;
};