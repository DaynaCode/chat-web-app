FROM node:22-alpine AS build

WORKDIR /app

RUN npm config set registry https://mirror2.chabokan.net/npm/

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
