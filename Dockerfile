# Stage 1: Build the React application
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:1.29-alpine

# Port variable (Cloud Run)
ENV PORT=8080

# Remove default nginx configuration
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy build and custom config
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
