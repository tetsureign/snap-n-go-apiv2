# Snap & Go API

This is the backend for the [Snap & Go mobile app](https://github.com/tetsureign/SnapAndGo). It handles authentication, object detection forwarding, user management, and search history persistence. Built with a modern, opinionated stack including TypeScript, Fastify, Prisma, and Docker.

---

## Features

- OAuth authentication with Google (structured so additional providers can be added explicitly)
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

This project uses separate environment files for production and development.

**For Production (.env):**
Copy the example file to `.env`. This file is used by Docker Compose in production mode.
```bash
cp api/.env.example api/.env
```
Fill in your production secrets (e.g., `GOOGLE_CLIENT_ID`, `JWT_SECRET`). The default values for database and service URLs are configured for the internal Docker network (`db:3306`, `ml-service:8000`).

**For Local Development (.env.dev):**
Copy the example file to `.env.dev`. This file is used when running the API locally with `pnpm dev`.
```bash
cp api/.env.example api/.env.dev
```
You will need to adjust the values in `.env.dev` to point to `localhost` ports (see Development section below).

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
    Since the API will run on your host, it needs to connect to the Docker services via `localhost`. Open your `api/.env.dev` file and update the following:

    ```ini
    # Use localhost ports
    YOLO_SERVICE_URL=http://localhost:8000
    DB_HOST=localhost
    
    # Use the development port defined in compose.override.yaml (3307)
    DB_PORT=3307 
    ```

3.  **Install Dependencies & Run API:**
    In a separate terminal, navigate to the `api` directory, install the dependencies, and start the API server:
    ```bash
    cd api
    pnpm install
    pnpm dev
    ```
    The `pnpm dev` command automatically loads variables from `.env.dev`.
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

See [HISTORY.md](./HISTORY.md) for the project's background and architectural decisions.

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

Within the API service, the current application flow is:

```text
route -> controller -> service -> repository -> Prisma
```

Feature code is organized by module, with shared transport/error helpers extracted separately:

```text
api/src/
  config/
  modules/
    auth/
    detection/
    history/
    users/
  plugins/
  shared/
    auth/
    errors/
    http/
  types/
```

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

- `pnpm dev` - Start the API in development watch mode (uses `.env.dev`).
- `pnpm prisma:dev` - Run `prisma migrate dev` (uses `.env.dev`).
- `pnpm prisma:studio` - Run `prisma studio` (uses `.env.dev`).
- `pnpm build` - Build the API for production.
- `pnpm start` - Start the built API.
- `pnpm test` - Run the full test suite for the API.
- `pnpm lint` - Run ESLint on the `api` package.

## Development Notes

- **Architecture**: Feature-oriented modules with explicit wiring. Internally the app follows `route -> controller -> service -> repository -> Prisma`
- **Persistence**: Prisma access is isolated to repositories rather than model wrapper classes
- **Auth**: Fastify JWT plugin for request auth, explicit provider registry for OAuth, no DI container
- **Services and Controllers**: Function-based modules for simplicity and testability
- **API Documentation**: Swagger UI available at `/docs` endpoint
- **Response Format**: Consistent response shapes using Zod schemas
- **File Upload**: Images sent as multipart/form-data (any field name accepted). Uploads are validated in-memory by MIME type plus actual image parsing before forwarding to the detection transport. 5MB file size limit
- **Detection Boundary**: Detection uses a transport abstraction with an HTTP implementation today, leaving room for a future message-queue transport
- **Rate Limiting**: 100 requests per 15 minutes per IP (localhost exempt)
- **TypeScript Path Aliases**: `@/*` maps to `src/*`
