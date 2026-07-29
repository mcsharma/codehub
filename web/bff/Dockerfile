# Build context is web/ (the pnpm workspace root), not web/bff/ — the BFF
# serves the frontend's built static assets in prod (see src/index.ts's
# `frontendDistPath = '../../frontend/dist'`), so this image has to build
# both packages and lay them out at that same relative path.
#
# Used both by Railway (prod/test services point at this Dockerfile instead
# of Nixpacks auto-detection) and locally (`docker compose up bff`) — one
# image, same build, in both places.
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

# Only what pnpm install needs: package.json files (for the workspace graph)
# plus bff's prisma schema/scripts, since its postinstall hook
# (`prisma generate && node scripts/postgenerate.mjs`) runs during install
# and needs both to exist already. Keeping this minimal means the install
# layer only invalidates on dependency/schema changes, not on every source
# edit.
FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY bff/package.json ./bff/package.json
COPY bff/prisma ./bff/prisma
COPY bff/scripts ./bff/scripts
COPY frontend/package.json ./frontend/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY bff ./bff
COPY frontend ./frontend
RUN pnpm --filter @codehub/bff run build
RUN pnpm --filter @codehub/frontend run build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/bff/node_modules ./bff/node_modules
COPY --from=build /app/bff/dist ./bff/dist
COPY --from=build /app/bff/prisma ./bff/prisma
COPY --from=build /app/bff/package.json ./bff/package.json
COPY --from=build /app/frontend/dist ./frontend/dist
WORKDIR /app/bff
EXPOSE 4000
CMD ["node", "dist/index.js"]
