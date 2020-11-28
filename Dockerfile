FROM centos/nodejs-8-centos7

WORKDIR /app
COPY --chown=daemon:daemon src/ .

RUN npm install --save roughjs

ENTRYPOINT ["/opt/rh/rh-nodejs8/root/usr/bin/node"]
CMD ["/app/index.js"]
