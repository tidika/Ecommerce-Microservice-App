# Use the official Node.js 14 image as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker layer caching for npm install
COPY package*.json ./

# Install dependencies
RUN npm install


# Copy the rest of the application code to the working directory
COPY . .

# Expose port 3000 (or whichever port your application listens on)
EXPOSE 3002

# Command to run the application
CMD ["node", "catalogue-app.js"]
