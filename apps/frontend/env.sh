#!/bin/sh

# Recreate config file
rm -rf /usr/share/nginx/html/env-config.js
touch /usr/share/nginx/html/env-config.js

# Add assignment 
echo "window._env_ = {" >> /usr/share/nginx/html/env-config.js

# Add static configuration
echo "  VITE_API_URL: \"http://backend:8000\"," >> /usr/share/nginx/html/env-config.js
echo "  VITE_API_VERSION: \"v1\"," >> /usr/share/nginx/html/env-config.js
echo "  VITE_MEDIA_URL: \"http://backend:8000/media/\"," >> /usr/share/nginx/html/env-config.js
echo "  VITE_STATIC_URL: \"http://backend:8000/static/\"," >> /usr/share/nginx/html/env-config.js

echo "}" >> /usr/share/nginx/html/env-config.js 