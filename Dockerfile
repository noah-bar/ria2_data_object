FROM node:21-alpine as build
WORKDIR /app
COPY package.json ./
RUN npm i --production
COPY . .
RUN npm run build

FROM node:21-alpine
WORKDIR /app
COPY --from=build ./app/node_modules ./node_modules
COPY --from=build ./app/dist ./
COPY .env ./
COPY config ./config
CMD ["node", "index.js"]
EXPOSE 3000

# BUILD
# docker build . -f Dockerfile -t data_object:prod

# RUN
# docker run -d -p 3000:3000 --name data_object_prod data_object:prod
