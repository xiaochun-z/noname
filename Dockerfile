FROM --platform=${TARGETPLATFORM} node:20-alpine

ENV NODE_ENV=production

RUN npm install -g pm2

WORKDIR /app

COPY . .

RUN npm install --omit=dev express@4.18.2 minimist ws

RUN rm -rf noname-server.exe .git .github README.md Dockerfile .gitignore .dockerignore

EXPOSE 80
EXPOSE 8080

CMD ["pm2-runtime", "process.yml"]
