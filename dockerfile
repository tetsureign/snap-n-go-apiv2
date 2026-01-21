FROM node:lts-alpine3.23 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# Using a dummy env to run Prisma Generate
RUN --mount=type=cache,id=pnpm,target=/pnpm/store DATABASE_URL="mysql://build:3306/build" pnpm --filter api run prisma:generate
RUN pnpm run -r build
RUN pnpm deploy --filter=api --prod /prod/api

FROM base AS api
COPY --from=build /prod/api /prod/api
WORKDIR /prod/api
EXPOSE 3000
CMD [ "pnpm", "start:prod" ]
