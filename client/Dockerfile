FROM node:22-alpine
WORKDIR /app

# Install dependencies first (for caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Angular default port
EXPOSE 4200

# Run ng serve with polling enabled for Linux/Docker environment
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "2000"]
