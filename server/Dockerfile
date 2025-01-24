# Use the official Node.js image.
FROM node:18

# Create and change to the app directory.
WORKDIR /usr/src/server

# Copy application dependency manifests to the container image.
COPY ../package*.json ./

# Install production dependencies.
RUN npm install

# Copy the local code to the container image.
COPY . .

# Run the web service on container startup.
CMD [ "node", "index.js" ]

# Expose the port the WebSocket server runs on
EXPOSE 4000