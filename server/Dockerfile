FROM node:18

# Install pnpm
RUN npm i -g pnpm

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install app dependencies
RUN pnpm install

COPY . .

RUN pnpm build

EXPOSE 3000
CMD [ "pnpm", "start:prod" ]