################################################################################
# Stage 1: Builder
################################################################################
# Initialize build phase
FROM node:18 AS builder
# Metadata labels
LABEL authors="kale schuetzeberg"
# Set working directory
WORKDIR /src
# Copy package.json and package-lock.json first (layer caching - same concept!)
COPY ["./package.json", "./package-lock.json", "./"]
# Install dependencies
RUN npm install
# Copy source code
COPY . .
# Run build command (hint: npm run build)
RUN npm run build

################################################################################
# Stage 2: Runtime
################################################################################
# Initialize run phase
FROM nginx:alpine
# Copy built files from builder to nginx's serve directory (hint: nginx serves from /usr/share/nginx/html)
COPY --from=builder /src/dist /usr/share/nginx/html
# Expose nginx port 80
EXPOSE 80