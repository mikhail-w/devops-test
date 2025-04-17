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
  
  // Remove any leading slashes from the image path
  const cleanPath = imagePath.replace(/^\/+/, '');
  
  // Ensure the path includes "media" if not already there
  const mediaPath = cleanPath.startsWith('media/') ? cleanPath : `media/${cleanPath}`;
  
  // Add the base URL
  return `${import.meta.env.VITE_API_BASE_URL}/${mediaPath}`;
};