FROM node:22-alpine AS base
# Alpine's git package is recent enough for `merge-tree --write-tree`
# (needs git >=2.38 — Alpine 3.19+'s git is 2.43+) — confirm the base
# node:22-alpine image's underlying Alpine version stays current enough;
# same version-matters-not-cosmetic reasoning as services/git/Dockerfile's
# debian:bookworm-slim choice.
RUN apk add --no-cache git
WORKDIR /app

FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
CMD ["node", "dist/main.js"]
