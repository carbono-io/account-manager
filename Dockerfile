FROM node:4.1.2
COPY . /account-manager
WORKDIR /account-manager
RUN npm install

EXPOSE 7888

CMD ["/bin/sh", "-c", "node ."]
