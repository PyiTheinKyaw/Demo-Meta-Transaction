FROM node:10

# Create app directory
WORKDIR /usr/src/app

# copy source codes
COPY . .

# install required npm packages
RUN npm install

# exposing container port
EXPOSE 3000

# run running command
CMD [ "npm", "start" ]
