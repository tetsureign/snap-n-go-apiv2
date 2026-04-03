# Project History and Decisions

## Initial Development (late 2024)

- The project started as a simple, barebone Express backend. At the time, I wanted to get the core feature working first (object detection), so I've explored using TensorFlow.js to get ML working right inside Node, with Coco-SSD as a middle step towards integrating back YOLOv5 from the previous API
- I have explored offloading heavy ML load to another Worker Thread, using Piscina

## MVP (early 2025)

- Architecture is still barebone, just Model → Controller. Custom middlewares to help with auth and error handling
- Integrating YOLOv5 to Node seemed unnecessary because I already have a FastAPI Microservice working for that, and running it in Node overcomplicates the setup, so I've decided to use the microservice pattern. This helps separate where the backend with user data and API routing runs from ML inference. One thing of note: I haven't used any message queues yet, since the current microservice is still simple with only one detect route
- I've moved from Express to Fastify not just because of performance, but because I'd have a bit more tools catered to the framework (for example: debug logging with Pino, or Swagger), without having to DIY, manually wiring everything up one by one. And, switching from Express to Fastify is easy because their APIs are mostly the same
- I chose MySQL for database simply because it's the common and widely supported database for a Node.js backend. I don't need any advanced database feature that MySQL doesn't offer for this project (for example: JSONB on PostgreSQL). The reason for choosing a SQL database over NoSQL is simply because I wanted to study and practice a bit more about SQL. I believe that with the simple scope of this project (only two schemas: User and SearchHistory), a MongoDB database would still be sufficient, and actually might be more natural for this use case - I could embed search history as an array directly in the User document, and the flexible schema would handle different OAuth providers (Google, Facebook, Discord) without needing nullable columns. Plus, with Prisma's MongoDB support, the DX would be similar. But since this is primarily a learning project, I wanted to practice SQL queries and understand relational data modeling better
- I initially chose Knex.js to help with querying data, because while I wanted to write raw SQL queries to study, I also wanted database migrations to live within the codebase. Knex.js helps me achieving both
- I integrated Google OAuth2 as the only means to create and use an account for this backend. This helps with user convenience, and I don't have to save additional fields to DB and DIY auth myself
- Used Zod as a data verifier library because I'm familiar with it from the frontend, and it has nice DX. I only need to use fluent chaining instead of DIY-ing a hundred Ifs

## Current Iteration

- Security
  - Rate limit: to prevent spamming and DDoS attacks. Current config: each IP is limited to 100 requests per 15 minutes, with `localhost` exempt for development convenience
  - File handling: detection uploads are now validated in-memory. The route checks an allowed image MIME type, then validates that the uploaded buffer is actually decodable as an image before forwarding it to the detection transport. Upload size is limited to 5MB
  - Helmet: provides useful response headers to stop common attack vectors
  - CORS: in production (with `NODE_ENV=production`), only allow hosts specified in `CORS_ORIGIN` or `CORS_ORIGINS` env (comma-separated). Allows `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS` methods, and `Content-Type`, `Authorization`, `X-Requested-With` headers. Includes `Access-Control-Allow-Credentials` header
- As I've learned more about SQL queries and joins elsewhere, I don't need raw SQL queries inside the app anymore. A modern ORM like Prisma offers great DX that integrates well with TypeScript, is widely popular and well-supported, so it's a natural choice. The only minor hiccup was that most online guides and LLMs still reference v5 common patterns (using the generated client from `node_modules` (deprecated) instead of the custom output path that v6 wants), but once I figured that out, everything else was smooth

Below is how I brought my knowledge from ASP.NET Core over to this project

- I introduced Dependency Injection with `awilix` for OAuth only. OAuth is where it makes the most sense - it allows for easily swapping OAuth providers and implementations without having to change everything that handles auth. It also allows for easier mocking of those services when testing. Introducing DI everywhere would break its lean and functional flow, which is what I want to maintain. And since other services and Prisma are easily mockable, the need for DI on those services lessens dramatically
- For tests, I'm working on adding some unit tests to core services, and integration tests to core flows. This is mostly for studying, and I believe that writing integration tests is more valuable than writing unit tests for every single part possible. Things might work independently, but breaks when wired with other things, which, is the real-world, where the app is used. Also, I've chosen Vitest over Jest, as it is more modern, supports TypeScript out-of-the-box, and is still API-compatible with Jest so there's not a lot of learning curve

## Refactor Notes (2026)

- The app has since been refactored away from the earlier model-wrapper and partial-DI approach
- Awilix was removed after the OAuth experiment. Auth now uses explicit provider wiring and Fastify JWT integration instead of a container
- Prisma access now lives in repositories, which turned out to be a useful replacement boundary for the previous Active Record-style model layer
- Error handling is now centralized around typed application errors and one Fastify error handler
- Environment access is centralized through a typed config module instead of scattered `process.env` reads
- Detection no longer writes uploads to temp files. It now validates image uploads in-memory and calls a detection transport abstraction. The current transport is HTTP, but the boundary was shaped this way to make a future message-queue transport easier to introduce
- The codebase structure is now feature-oriented under `api/src/modules/*`, with shared HTTP/auth/error helpers under `api/src/shared/*`
- Zod ended up becoming a major contract layer in the project, not only for request validation, but also for consistent response envelopes and DTO/runtime alignment
