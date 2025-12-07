#!/bin/sh

# Default to http://backend:8888 if VITE_BACKEND_SERVER is not set
BACKEND_URL="${VITE_BACKEND_SERVER:-http://backend:8888}"

# Remove trailing slash if present
BACKEND_URL=${BACKEND_URL%/}

echo "Configuring Nginx to proxy /api to $BACKEND_URL"

# Replace the placeholder in nginx.conf with the actual backend URL
sed -i "s|__BACKEND_URL__|$BACKEND_URL|g" /etc/nginx/conf.d/default.conf

# Execute the CMD from Dockerfile
exec "$@"
