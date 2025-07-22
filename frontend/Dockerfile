FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Map the container port 3000 to be exposed as port 5173 for Vite's default port
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
