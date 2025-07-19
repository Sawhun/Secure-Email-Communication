# Use Node.js LTS image
FROM node:18

# App directory in container
WORKDIR /app

# Copy dependency manifest
COPY package*.json ./

# Install dependencies (including dev tools like nodemon)
RUN npm install

# Copy entire project code
COPY . .

# Expose the app’s development port
EXPOSE 3001

# Run in development mode by default
CMD ["npm", "run", "dev"]
