# Use the official Bun image as the base
FROM oven/bun:latest AS base
# Set the working directory inside the container
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl

# Copy the application files to the container
COPY . .

# Install dependencies
RUN bun install

# Build the application
RUN bun run build

# Expose the application port
EXPOSE 3000

# More explicit preview command
CMD ["sh", "-c", "bun run preview --host 0.0.0.0 --port 3000"]
