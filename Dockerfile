FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_PHOTO_API_ENDPOINT=/api
ARG VITE_STORAGE_API_ENDPOINT=/storage
ARG VITE_POST_LOGOUT_REDIRECT_URI=/

ENV VITE_PHOTO_API_ENDPOINT=${VITE_PHOTO_API_ENDPOINT}
ENV VITE_STORAGE_API_ENDPOINT=${VITE_STORAGE_API_ENDPOINT}
ENV VITE_POST_LOGOUT_REDIRECT_URI=${VITE_POST_LOGOUT_REDIRECT_URI}

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80 443
