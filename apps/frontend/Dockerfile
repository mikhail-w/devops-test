# Build stage
FROM node:18-alpine AS builder

# Set work directory
WORKDIR /app

# Install necessary dependencies for crypto
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies and Terser
RUN npm install && npm install -D terser

# Copy project files
COPY . .

# Build the project
RUN npm run build

# Second stage
FROM nginx:alpine

# Copy build files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy and make the env script executable
COPY env.sh /docker-entrypoint.d/40-env.sh
RUN chmod +x /docker-entrypoint.d/40-env.sh

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 