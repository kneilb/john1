FROM node:15.3

# Install app
WORKDIR /app
COPY --chown=daemon:daemon . /app
RUN npm install

ENTRYPOINT ["npm"]
CMD ["start"]
