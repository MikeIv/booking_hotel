ARG REGISTRY=docker.io/library

FROM ${REGISTRY}/node:22.19-alpine AS build

ARG NUXT_PUBLIC_API_BASE
ENV NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE

WORKDIR /app

COPY package.json yarn.lock ./
COPY patches ./patches
RUN corepack enable && yarn install --frozen-lockfile --ignore-scripts

COPY . .
RUN yarn postinstall && yarn build

FROM ${REGISTRY}/nginx:1.30.4-alpine

COPY .docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/.output/public /usr/share/nginx/html
