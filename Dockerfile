FROM node:20-alpine

WORKDIR /app

# Copy only the backend files
COPY backend/package*.json ./

# Install dependencies
RUN npm install --production

# Copy backend source
COPY backend/ ./

EXPOSE 5000

CMD ["node", "src/index.js"]
