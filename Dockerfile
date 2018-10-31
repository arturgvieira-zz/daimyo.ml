FROM node:8.12.0-alpine
ADD . web
WORKDIR /web
# ML Dependencies
RUN apk --update-cache \
    add musl \
    linux-headers \
    gcc \
    g++ \
    make \
    gfortran \
    openblas-dev \
    python \
    python3 \
    python3-dev

RUN pip3 install --upgrade pip 
RUN pip3 install numpy \
    scikit-learn \ 
    'pandas<0.21.0' \
    redis
# Net Dependencies
RUN npm i --only=prod
# CMD App Entry Point
CMD ["node", "--experimental-modules", "/web/server/index.mjs"]
# Heroku Deploy Commands
# sudo heroku container:push web --app mobius-trader-data
# sudo heroku container:release web
