FROM node:20.11.1-bullseye-slim as base

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile


FROM base as builder

COPY ./tsconfig.json .
COPY tsconfig.build.json .
COPY .eslintrc.js .
COPY nest-cli.json .

COPY ./src ./src

RUN yarn build



FROM builder as production

COPY --from=builder /usr/src/app/dist ./dist

ENV PORT 3000
EXPOSE 3000

CMD ["node", "./dist/main"]
