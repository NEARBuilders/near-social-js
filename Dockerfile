FROM node:18.20.2

WORKDIR /usr/app

RUN npm i -g near-sandbox@0.0.18 # for protocol version 65
RUN near-sandbox --home ./.near init --chain-id localnet

# start runnning the node
CMD ["/bin/sh", "-c", "near-sandbox --home ./.near run"]
