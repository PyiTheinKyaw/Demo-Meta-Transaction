FROM node:16

# Create app directory
WORKDIR /usr/src/app

# copy source codes
COPY . .

# install ts-node in order to run with ts-node
RUN npm install -g ts-node

# install required npm packages
RUN npm install

RUN ts-node dbsetup.ts

# exposing container port
EXPOSE 5000

# run running command
CMD [ "ts-node", "server.ts" ]
