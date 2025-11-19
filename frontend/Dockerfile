# Stage 1: Build the React application
FROM node:16 as builder

WORKDIR /app

COPY package.json ./
RUN npm cache clean --force && npm install

COPY . ./
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine

COPY --from=builder /app/build /usr/share/nginx/html

# Add a nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
