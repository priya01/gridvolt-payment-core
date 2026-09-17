# ==========================================
# STAGE 1: Development & Compilation Layer
# ==========================================
FROM node:22-alpine AS development

WORKDIR /usr/src/app

# 1. Copy package definitions first to leverage Docker caching layers
COPY package*.json ./

# 2. Install dev dependencies with peer dependency bypass flags
RUN npm install --include=dev --legacy-peer-deps

# 3. Copy the rest of the application code source definitions
COPY . .

# 4. Clean out any stale local distribution folders to prevent cache mismatch errors
RUN rm -rf dist

# 5. Build your NestJS applications inside the container
RUN npx nest build api-gateway && \
    npx nest build order-service && \
    npx nest build analytics-service

# ==========================================
# STAGE 2: Production Execution Layer
# ==========================================
FROM node:22-alpine AS production

WORKDIR /usr/src/app

# 6. Copy package metadata files for isolated production node sizing
COPY package*.json ./

# 7. Install only production packages cleanly
RUN npm install --production --legacy-peer-deps

# 8. Extract the compiled JavaScript files from the development stage environment
COPY --from=development /usr/src/app/dist ./dist

# 9. Copy your cross-service schema files (gRPC protobufs)
COPY proto ./proto

# 10. Expose public REST Gateway and internal high-speed gRPC binary ports
EXPOSE 3200 50051

# 11. Run a default fallback script (Override hooks handler)
CMD ["node", "dist/apps/api-gateway/main.js"]
