# Stage 1: Build the Vite application
FROM node:24 AS builder

# Install pnpm via wget script and set PATH
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.bashrc" SHELL="$(which bash)" bash -

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

RUN echo "VITE_API_BASE_URL=https://gestion.sugatecocinas.com:8888/api" > .env
RUN echo "VITE_OIDC_AUTHORITY=https://gestion.sugatecocinas.com:8888/auth/realms/sugate" >> .env
RUN echo "VITE_OIDC_CLIENT_ID=frontend" >> .env
RUN echo "VITE_OIDC_REDIRECT_URI=`${window.location.origin}/auth/callback`" >> .env
RUN echo "VITE_OIDC_POST_LOGOUT_REDIRECT_URI=`${window.location.origin}`" >> .env
RUN echo "VITE_OIDC_SCOPE=openid profile email" >> .env
# Build the application
# This will output to the 'dist' directory (Vite default)
RUN pnpm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:stable-alpine

# Remove default Nginx server configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the static assets from the builder stage
# The 'dist' directory contains the result of Vite build
COPY --from=builder /app/dist /var/www/html

WORKDIR /var/www/html


# Expose port 80
EXPOSE 80

# Start Nginx via entrypoint
ENTRYPOINT ["nginx", "-g", "daemon off;"]