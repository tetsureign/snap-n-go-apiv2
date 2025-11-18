# Snap & Go API

This is the backend of the [Snap & Go mobile app](https://github.com/tetsureign/SnapAndGo). It handles authentication, object detection forwarding, user management, and search history persistence.

Built with TypeScript and Fastify. It started from a scratch "npm init" and evolved into a small but opinionated backend project to practice and apply my learned architectural patterns where it make sense.

## Project History and Decisions

### Initial Development (late 2024)

- The project started as a simple, barebone Express backend. At the time, I wanted to get the core feature working first (object detection), so I've explored using TensorFlow.js to get ML working right inside Node, with Coco-SSD as a middle step towards integrating back YOLOv5 from the previous API
- I have explored offloading heavy ML load to another Worker Thread, using Piscina

### MVP (early 2025)

- Architecture is still barebone, just Model → Controller. Custom middlewares to help with auth and error handling
- Integrating YOLOv5 to Node seemed unnecessary because I already have a FastAPI Microservice working for that, and running it in Node overcomplicates the setup, so I've decided to use the microservice pattern. This helps separate where the backend with user data and API routing runs from ML inference. One thing of note: I haven't used any message queues yet, since the current microservice is still simple with only one detect route
- I've moved from Express to Fastify not just because of performance, but because I'd have a bit more tools catered to the framework (for example: debug logging with Pino, or Swagger), without having to DIY, manually wiring everything up one by one. And, switching from Express to Fastify is easy because their APIs are mostly the same
- I chose MySQL for database simply because it's the common and widely supported database for a Node.js backend. I don't need any advanced database feature that MySQL doesn't offer for this project (for example: JSONB on PostgreSQL). The reason for choosing a SQL database over NoSQL is simply because I wanted to study and practice a bit more about SQL. I believe that with the simple scope of this project (only two schemas: User and SearchHistory), a MongoDB database would still be sufficient, and actually might be more natural for this use case - I could embed search history as an array directly in the User document, and the flexible schema would handle different OAuth providers (Google, Facebook, Discord) without needing nullable columns. Plus, with Prisma's MongoDB support, the DX would be similar. But since this is primarily a learning project, I wanted to practice SQL queries and understand relational data modeling better
- I initially chose Knex.js to help with querying data, because while I wanted to write raw SQL queries to study, I also wanted database migrations to live within the codebase. Knex.js helps me achieving both
- I integrated Google OAuth2 as the only means to create and use an account for this backend. This helps with user convenience, and I don't have to save additional fields to DB and DIY auth myself
- Used Zod as a data verifier library because I'm familiar with it from the frontend, and it has nice DX. I only need to use fluent chaining instead of DIY-ing a hundred Ifs

### Current Iteration

- Security
  - Rate limit: to prevent spamming and DDoS attacks. Current config: each IP is limited to 100 requests per 15 minutes, with `localhost` exempt for development convenience
  - File handling: for each uploaded file, generate a unique filename with the current timestamp + a random string. For detection route, check if the MIME type is `image/` as well. Save uploads to the `UPLOAD_TEMP_DIR` env or `/tmp`, limit upload file size to 5MB, and additionally check if the file that was about to be sent to the microservice has its path start with the upload path above
  - Helmet: provides useful response headers to stop common attack vectors
  - CORS: in production (with `NODE_ENV=production`), only allow hosts specified in `CORS_ORIGIN` or `CORS_ORIGINS` env (comma-separated). Allows `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS` methods, and `Content-Type`, `Authorization`, `X-Requested-With` headers. Includes `Access-Control-Allow-Credentials` header
- As I've learned more about SQL queries and joins elsewhere, I don't need raw SQL queries inside the app anymore. A modern ORM like Prisma offers great DX that integrates well with TypeScript, is widely popular and well-supported, so it's a natural choice. The only minor hiccup was that most online guides and LLMs still reference v5 common patterns (using the generated client from `node_modules` (deprecated) instead of the custom output path that v6 wants), but once I figured that out, everything else was smooth

Below is how I brought my knowledge from ASP.NET Core over to this project

- I introduced Dependency Injection with `awilix` for OAuth only. OAuth is where it makes the most sense - it allows for easily swapping OAuth providers and implementations without having to change everything that handles auth. It also allows for easier mocking of those services when testing. Introducing DI everywhere would break its lean and functional flow, which is what I want to maintain. And since other services and Prisma are easily mockable, the need for DI on those services lessens dramatically
- For tests, I'm working on adding some unit tests to core services, and integration tests to core flows. This is mostly for studying, and I believe that writing integration tests is more valuable than writing unit tests for every single part possible. Things might work independently, but breaks when wired with other things, which, is the real-world, where the app is used. Also, I've chosen Vitest over Jest, as it is more modern, supports TypeScript out-of-the-box, and is still API-compatible with Jest so there's not a lot of learning curve

## Features

- OAuth authentication with Google (multi-provider support ready with DI)
- Object detection API that forwards images to YOLOv5 microservice
- User management endpoints (get user info, soft delete)
- Search history CRUD operations with pagination
- JWT token management (access and refresh tokens)
- Swagger/OpenAPI documentation at `/docs`
- Rate limiting and security middleware

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: Prisma ORM with MySQL
- **Validation**: Zod
- **Dependency Injection**: Awilix
- **Security**: JWT (jsonwebtoken), Helmet, CORS, Rate limiting
- **Documentation**: Swagger/OpenAPI (@fastify/swagger, @fastify/swagger-ui)
- **Testing**: Vitest
- **HTTP Client**: Axios (for YOLO service communication)
- **Image Processing**: Sharp
- **OAuth**: google-auth-library
- **Tooling**: ESLint, TypeScript

## Architecture

The backend follows a microservices architecture:

```
Mobile App → Fastify Backend → YOLOv5 FastAPI Microservice
                    ↓
               MySQL Database
```

1. **Mobile App**: Sends images and requests to the Fastify backend
2. **Fastify Backend**: Handles API routing, authentication, business logic, and forwards detection requests to YOLOv5 service
3. **YOLOv5 Microservice**: Processes images and returns detected objects with coordinates and confidence scores
4. **MySQL Database**: Stores user accounts and search history

### API Routes

- `/auth` - Authentication endpoints (OAuth login, token refresh)
- `/detect` - Object detection endpoint (forwards to YOLOv5 service)
- `/user` - User management endpoints
- `/history` - Search history CRUD operations

### Frontend Integration

- **Mobile App**: [Snap & Go React Native App](https://github.com/tetsureign/SnapAndGo)
- **ML Service**: [YOLOv5 FastAPI Microservice](https://github.com/tetsureign/SnapAndGo-microsvc-objdetect)

## Requirements

- Node.js
- pnpm (package manager, enforced in preinstall)
- MySQL database
- YOLOv5 FastAPI microservice (for object detection)

## Getting Started

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env` and use your own values.

3. **Set up the database**:
   Run Prisma migrations to set up the database schema:

   ```bash
   # Generate Prisma client
   pnpm run prisma:generate

   # Run migrations (if Prisma migrate is set up)
   # npx prisma migrate dev
   ```

4. **Start the YOLOv5 microservice**:
   Ensure your YOLOv5 FastAPI microservice is running and accessible.

5. **Run the server**:

   ```bash
   # Development mode (watch mode)
   pnpm run dev

   # Or production mode
   pnpm run build
   pnpm start
   ```

## Environment Variables

- `JWT_SECRET` - Secret for signing/verifying JWT access tokens
- `REFRESH_SECRET` - Secret for signing/verifying JWT refresh tokens
- `GOOGLE_CLIENT_ID` - Google OAuth client ID for authentication
- `YOLO_SERVICE_URL` - Base URL for the external YOLOv5 detection microservice
- `DATABASE_URL` - Prisma database connection string (MySQL)
- `PORT` - Port for the HTTP server (default: 3000)
- `ROUTE_PREFIX` - Optional API prefix for routes
- `UPLOAD_TEMP_DIR` - Directory for temporary file uploads (default: `/tmp`)
- `CORS_ORIGINS` or `CORS_ORIGIN` - Comma-separated allowed origins (required in production)
- `NODE_ENV` - Environment mode: `production` or `development` (affects CORS, logging)

See `.env.example` for a starting point.

## Available Scripts

- `pnpm dev` - Start development server (watch mode)
- `pnpm build` - Build TypeScript to JavaScript
- `pnpm start` - Start production server
- `pnpm test` - Run Vitest test suite
- `pnpm test:coverage` - Run tests with coverage report
- `pnpm test:unit` - Run unit tests only
- `pnpm test:integration` - Run integration tests only
- `pnpm test:e2e` - Run end-to-end tests only
- `pnpm lint` - Run ESLint
- `pnpm prisma:generate` - Generate Prisma client

## Development Notes

- **Architecture**: Layered structure with `routes` → `controllers` → `services` → `models`
- **Domain Models**: Implemented as classes that expose `toDTO()` and instance methods
- **Services and Controllers**: Primarily function-based modules for simplicity and testability
- **Dependency Injection**: Handled by Awilix; DI container configured in `src/container/dependencyInjection.ts`
- **API Documentation**: Swagger UI available at `/docs` endpoint
- **Response Format**: Consistent response shapes using Zod schemas
- **File Upload**: Images sent as multipart/form-data (any field name accepted). Backend forwards to YOLOv5 microservice with key 'file'. 5MB file size limit
- **Rate Limiting**: 100 requests per 15 minutes per IP (localhost exempt)
- **TypeScript Path Aliases**: `@/*` maps to `src/*`
