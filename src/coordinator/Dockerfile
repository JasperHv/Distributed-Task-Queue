# Base Node image
FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Copy package.json + package-lock.json first (for caching layers)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose service port if needed
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
