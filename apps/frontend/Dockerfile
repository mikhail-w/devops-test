# Build stage
FROM node:18-alpine AS builder

# Set work directory
WORKDIR /app

# Install necessary dependencies for crypto and build
RUN apk add --no-cache python3 make g++

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with specific versions for production
RUN npm ci --only=production && \
    npm install -D terser@latest

# Copy project files
COPY . .

# Build the project with production optimization
RUN npm run build && \
    # Clean up unnecessary files
    rm -rf node_modules && \
    rm -rf src && \
    rm -rf public && \
    rm -rf .next

# Second stage - Production
FROM nginx:alpine

# Add security headers and remove unnecessary files
RUN apk add --no-cache tzdata && \
    rm -rf /etc/nginx/conf.d/* && \
    rm -rf /usr/share/nginx/html/*

# Copy build files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration with security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy and make the env script executable
COPY env.sh /docker-entrypoint.d/40-env.sh
RUN chmod +x /docker-entrypoint.d/40-env.sh

# Create a non-root user
RUN adduser -D -H -u 1000 -s /bin/sh www-data && \
    chown -R www-data:www-data /var/cache/nginx && \
    chown -R www-data:www-data /var/log/nginx && \
    chown -R www-data:www-data /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R www-data:www-data /var/run/nginx.pid

# Switch to non-root user
USER www-data

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 