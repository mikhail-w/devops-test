#!/bin/sh

# Recreate config file
rm -rf /usr/share/nginx/html/env-config.js
touch /usr/share/nginx/html/env-config.js

# Add assignment 
echo "window._env_ = {" >> /usr/share/nginx/html/env-config.js

# Add environment variables
echo "  VITE_API_BASE_URL: \"${VITE_API_BASE_URL}\"," >> /usr/share/nginx/html/env-config.js
echo "  VITE_API_URL: \"${VITE_API_URL}\"," >> /usr/share/nginx/html/env-config.js
echo "  VITE_MEDIA_URL: \"${VITE_MEDIA_URL}\"," >> /usr/share/nginx/html/env-config.js
echo "  VITE_WEATHER_API_KEY: \"${VITE_WEATHER_API_KEY}\"," >> /usr/share/nginx/html/env-config.js
echo "  VITE_PAYPAL_CLIENT_ID: \"${VITE_PAYPAL_CLIENT_ID}\"," >> /usr/share/nginx/html/env-config.js
echo "  VITE_GOOGLE_MAPS_API_KEY: \"${VITE_GOOGLE_MAPS_API_KEY}\"," >> /usr/share/nginx/html/env-config.js
echo "  VITE_GOOGLE_CLOUD_VISION_API_KEY: \"${VITE_GOOGLE_CLOUD_VISION_API_KEY}\"," >> /usr/share/nginx/html/env-config.js

# Close the object
echo "}" >> /usr/share/nginx/html/env-config.js