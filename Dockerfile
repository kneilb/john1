FROM node:15.3

# Install prereqs
RUN apt-get update && \
    apt-get -y install \
        build-essential \
        libcairo2-dev \
        libpango1.0-dev \
        libjpeg-dev \
        libgif-dev \
        librsvg2-dev

# Install app
WORKDIR /app
COPY --chown=daemon:daemon ./ .
RUN npm install .

ENTRYPOINT ["node"]
CMD ["/app/src/index.js"]
