# ---------- BUILD STAGE ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install exact dependencies from package-lock.json
RUN npm ci

# Copy frontend source
COPY . .

# Backend API URL
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

# Build React application
RUN npm run build


# ---------- PRODUCTION STAGE ----------
FROM nginx:alpine

# Copy Vite production build into Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]