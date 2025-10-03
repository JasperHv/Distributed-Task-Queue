FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install nodemon for hot reload in development
RUN npm install -g nodemon

# Copy application code
COPY . .

# Default command (overridden in docker-compose.yml)
CMD ["npm", "run", "start"]