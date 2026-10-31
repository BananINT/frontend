FROM node:24-alpine AS base

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

EXPOSE 80

FROM base AS dev

COPY . .

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "80"]

FROM base AS build

# Vite inlines VITE_* into the bundle at build time (passed as compose build args).
ARG VITE_KEYCLOAK_URL=/auth
ARG VITE_KEYCLOAK_REALM=bananint
ARG VITE_KEYCLOAK_CLIENT_ID=bananint-client
ENV VITE_KEYCLOAK_URL=$VITE_KEYCLOAK_URL \
    VITE_KEYCLOAK_REALM=$VITE_KEYCLOAK_REALM \
    VITE_KEYCLOAK_CLIENT_ID=$VITE_KEYCLOAK_CLIENT_ID

COPY . .

RUN npm run build

FROM nginx:1.31-alpine AS prod

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
