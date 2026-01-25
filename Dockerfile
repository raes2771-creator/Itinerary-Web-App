# --- Stage 1: Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install ALL dependencies (including TypeScript)
COPY package*.json ./
RUN npm install

# Copy all source code
COPY . .

# 1. Build the Frontend (Vite usually outputs to /dist)
RUN npm run build

# 2. Compile the Backend (server.ts -> server.js)
# We use npx tsc to compile the single file. 
# --esModuleInterop and --skipLibCheck help avoid common TS-Node compatibility grumbles.
RUN npx tsc server.ts --outDir dist-server --esModuleInterop --skipLibCheck --target esnext --moduleResolution node

# --- Stage 2: Runtime Stage ---
FROM node:20-alpine
WORKDIR /app

# Set to production to keep things lean
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy the compiled frontend from builder
COPY --from=builder /app/dist ./dist

# Copy the compiled backend from builder
COPY --from=builder /app/dist-server/server.js ./server.js

# Expose your server port
EXPOSE 3000

# Run the compiled javascript file
CMD ["node", "server.js"]
