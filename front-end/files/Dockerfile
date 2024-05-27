# Use the official Node.js 14 image as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . /app

# Expose port 3000 (or whichever port your application listens on)
EXPOSE 3000

# Command to run the application
CMD ["node", "front-end-server.js"]
