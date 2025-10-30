# Dockerfile for 10x Interior Designer

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package.json and lock file
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set the build-time argument for the API key
ARG GEMINI_API_KEY
# Set the environment variable for the build process
ENV GEMINI_API_KEY=$GEMINI_API_KEY

# Build the Next.js application
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Set the environment to production
ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Copy the public assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Copy the server-side cache directory
COPY --from=builder --chown=nextjs:nodejs /app/.cache ./.cache

# Set the user to the non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Set the port environment variable
ENV PORT 3000

# Command to start the server
# The server is located in the standalone output directory
CMD ["node", "server.js"]
