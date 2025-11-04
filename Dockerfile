FROM node:20-alpine AS dev

ENV NODE_ENV=development

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm npm install

COPY . .

EXPOSE 80

CMD ["npm", "start", "--", "--host=0.0.0.0"]
