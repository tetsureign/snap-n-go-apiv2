# Snap & Go API

This is the backend for the [Snap & Go mobile app](https://github.com/tetsureign/SnapAndGo). It handles authentication, object detection forwarding, user management, and search history persistence. Built with a modern, opinionated stack including TypeScript, Fastify, Prisma, and Docker.

---

## Features

- OAuth authentication with Google (multi-provider support ready with DI)
- Object detection API that forwards images to a YOLOv5 microservice
- User management endpoints (get user info, soft delete)
- Search history CRUD operations with pagination
- JWT token management (access and refresh tokens)
- API documentation via Swagger/OpenAPI at `/docs`
- Containerized for consistent development and production environments
- Security best practices: Rate limiting, Helmet, CORS, secure file handling

## Tech Stack

- **Containerization**: Docker, Docker Compose
- **Runtime**: Node.js
- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: Prisma ORM with MySQL
- **Validation**: Zod
- **Testing**: Vitest
- **Tooling**: pnpm, ESLint, TypeScript

---

## Getting Started

This project is designed to be run with Docker and Docker Compose, which handles the database and machine learning microservice.

### Prerequisites

- Docker and Docker Compose (or Podman and Podman Compose)
- Node.js (for development)
- pnpm

### 1. Environment Configuration

First, set up your environment variables for the API service.

```bash
# Start by copying the example file in the api directory
cp api/.env.example api/.env
```

Now, open the `api/.env` file and fill in the required values, especially your `GOOGLE_CLIENT_ID` and secrets. The default values for database and service URLs are already configured for the Docker setup.

---

## Development

This project is configured for a hybrid development environment where background services (database, ML service) run in Docker, and the API service runs directly on your host machine for faster development and hot-reloading.

1.  **Start Background Services:**
    The `compose.override.yaml` file is configured to automatically start only the database and ML service for development. Open a terminal and run:

    ```bash
    docker compose up -d
    ```

    This command will start the MySQL database and the Python ML service in detached mode.

2.  **Configure Environment for Localhost:**
    Since the API will run on your host, it needs to connect to the Docker services via `localhost`. Modify your `api/.env` file to point to the correct local ports:

    ```diff
    - YOLO_SERVICE_URL=http://ml-service:8000
    + YOLO_SERVICE_URL=http://localhost:8000
    - DB_HOST=db
    + DB_HOST=localhost
    ```

3.  **Install Dependencies & Run API:**
    In a separate terminal, navigate to the `api` directory, install the dependencies, and start the API server in development (watch) mode:
    ```bash
    cd api
    pnpm install
    pnpm dev
    ```
    The API will now be running at `http://localhost:3000` and will automatically restart when you make changes to the source code.

---

## Production

To run the application in a production environment, all services will be run via Docker.

1.  **Set Production Environment:**
    Ensure your `api/.env` file is configured for production (e.g., using production secrets, setting `NODE_ENV=production`, and using the Docker service names like `db` and `ml-service` for URLs).

2.  **Run with Docker Compose:**
    Execute the following command to build and start all services defined in the primary `compose.yaml` file.

    ```bash
    docker compose -f compose.yaml up -d
    ```

    This command intentionally ignores the `compose.override.yaml` file, which is only for development.

---

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

## Available Scripts

All commands should be run from the `api` directory.

- `pnpm dev` - Start the API in development watch mode.
- `pnpm build` - Build the API for production.
- `pnpm start` - Start the built API.
- `pnpm test` - Run the full test suite for the API.
- `pnpm lint` - Run ESLint on the `api` package.

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
