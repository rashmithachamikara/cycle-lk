# Multi-stage build for Vite React TypeScript application
# Stage 1: Build the application
FROM node:20-alpine AS builder

# Accept build arguments from Dokploy
ARG VITE_API_URL
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID
ARG VITE_FIREBASE_VAPID_KEY
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_APP_ENVIRONMENT

# Set working directory
WORKDIR /app

# Install dependencies for better caching
COPY package*.json ./
RUN npm ci

# Copy configuration and environment files
COPY vite.config.ts tsconfig*.json tailwind.config.js postcss.config.js ./
COPY index.html .env ./

# Copy source code
COPY src/ ./src/
COPY public/ ./public/

# Set Node.js options and build
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine AS production

# Copy the build output to Nginx's html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration (optional - create if needed)
# COPY nginx.conf /etc/nginx/nginx.conf

# Create a simple Nginx configuration for SPA routing
RUN echo 'server {\
    listen 80;\
    server_name localhost;\
    root /usr/share/nginx/html;\
    index index.html;\
    \
    # Handle SPA routing - fallback to index.html for client-side routing\
    location / {\
        try_files $uri $uri/ /index.html;\
    }\
    \
    # Gzip compression\
    gzip on;\
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;\
    \
    # Cache static assets\
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {\
        expires 1y;\
        add_header Cache-Control "public, immutable";\
    }\
    \
    # Security headers\
    add_header X-Frame-Options "SAMEORIGIN" always;\
    add_header X-Content-Type-Options "nosniff" always;\
    add_header X-XSS-Protection "1; mode=block" always;\
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]