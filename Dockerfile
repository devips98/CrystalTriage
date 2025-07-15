FROM node:18-alpine

# Install necessary system dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies with verbose logging
RUN npm ci --verbose

# Copy source code
COPY . .

# Verify npm scripts are available
RUN npm run --silent

# Build the application with verbose output
RUN npm run build --verbose

# Remove dev dependencies after build
RUN npm prune --omit=dev

# Create uploads directory
RUN mkdir -p uploads

# Copy and make startup script executable
COPY start.sh .
RUN chmod +x start.sh

# Expose port
EXPOSE 5000

# Start the application
CMD ["./start.sh"]
