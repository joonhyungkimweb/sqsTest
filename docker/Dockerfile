FROM nvidia/cuda:11.2.1-cudnn8-runtime-ubuntu20.04
ARG BUCKET_NAME
ARG QUEUE_URL
ARG CALLBACK_GATEWAY
RUN apt update
RUN apt install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt install -y nodejs
RUN npm i -g yarn
WORKDIR /usr/app
COPY . . 
RUN yarn --prod
ENV BUCKET_NAME ${BUCKET_NAME}
ENV QUEUE_URL ${QUEUE_URL} 
ENV CALLBACK_GATEWAY ${CALLBACK_GATEWAY} 
CMD [ "node", "src/app.js" ]
