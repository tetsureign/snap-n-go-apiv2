# API Refactor Plan

## Goal

Reduce code repetition, remove partial DI, and simplify the API into a structure that is easy to follow without committing to a full framework-style architecture.

The target shape is:

`route -> controller -> service/use-case -> repository -> Prisma`

This keeps request/response concerns in Fastify, business logic in services, and database access in repositories.

## Guiding Decisions

- Remove Awilix and request-scoped DI.
- Keep wiring explicit and local.
- Use interface-based provider polymorphism for OAuth, not a container.
- Move away from Active Record-style model classes.
- Centralize config, auth, and error handling.
- Refactor in small slices so behavior stays stable.

## Current Problems

### 1. Partial DI creates two wiring styles

The codebase currently mixes:

- DI lookup in auth controllers
- direct module imports in services
- global Prisma and env usage

This adds indirection without giving the consistency benefits of full DI.

Examples:

- `src/controllers/authController.ts`
- `src/container/dependencyInjection.ts`
- `src/services/googleAuth/GoogleOAuthService.ts`
- `src/services/googleAuth/GoogleJwtService.ts`

### 2. Thin services and heavy models

`src/services/userService.ts` and `src/services/historyService.ts` mostly pass through to model methods.

At the same time, `src/models/User.ts` and `src/models/SearchHistory.ts` combine:

- database access
- DTO mapping
- soft-delete behavior
- record construction

This is more custom infrastructure than the project needs.

### 3. Repeated controller error handling and response formatting

Many controllers repeat the same pattern:

- call service
- handle null / not found
- log error
- return response schema

Examples:

- `src/controllers/userController.ts`
- `src/controllers/historyController.ts`
- `src/controllers/authController.ts`

### 4. Auth is split across custom middleware and OAuth services

JWT verification lives in middleware, token creation lives in a service, and provider selection lives in controllers.

This makes multi-provider auth harder to evolve cleanly.

### 5. Route schemas drift from actual responses

There are places where route response declarations do not match the returned payload shape, especially for array responses.

### 6. Detection flow has too much DIY plumbing

The detection path manually manages:

- temporary file names
- temp file writes
- path validation
- deletion callbacks
- outbound multipart request building

This should be simpler.

## Target Structure

Use a feature-oriented layout:

```text
src/
  app.ts
  server.ts
  config/
    env.ts
  plugins/
    auth.ts
    prisma.ts
    swagger.ts
  modules/
    auth/
      auth.routes.ts
      auth.controller.ts
      auth.service.ts
      auth.schemas.ts
      providers/
        googleOAuthProvider.ts
    users/
      user.routes.ts
      user.controller.ts
      user.service.ts
      user.repository.ts
      user.schemas.ts
    history/
      history.routes.ts
      history.controller.ts
      history.service.ts
      history.repository.ts
      history.schemas.ts
    detection/
      detection.routes.ts
      detection.controller.ts
      detection.service.ts
      detection.schemas.ts
      detection.client.ts
  shared/
    errors/
    http/
    types/
```

This keeps related code together and avoids cross-project `models/`, `services/`, and `utils/` buckets growing into catch-alls.

## DI Removal Plan

### Decision

Do not replace Awilix with another DI library.

Instead, use explicit module composition and provider maps.

### Replacement Pattern

Create a shared OAuth provider contract:

```ts
export interface OAuthProvider {
  verifyToken(token: string): Promise<VerifiedOAuthUser>;
  loginWithToken(token: string): Promise<AuthResult>;
}
```

Then compose providers explicitly in one module:

```ts
export const oauthProviders = {
  google: createGoogleOAuthProvider(deps),
};
```

Auth service selects from the map:

```ts
const provider = oauthProviders[providerName];
if (!provider) throw new BadRequestError("Unsupported OAuth provider");
```

### Benefits

- no runtime string-based container lookup
- easier code navigation
- easier testing with plain object stubs
- multi-provider support remains straightforward

## Refactor Stages

## Stage 1: Stabilize App Boundaries

### Tasks

- Create `src/app.ts` to build and configure Fastify.
- Move `listen()` into `src/server.ts`.
- Move plugin registration into `src/plugins/`.
- Keep route registration in one place, but separate from startup.

### Outcome

Tests can instantiate the app without starting a real server, and boot logic becomes easier to reason about.

## Stage 2: Remove DI and Rewire OAuth Explicitly

### Tasks

- Delete `src/container/dependencyInjection.ts`.
- Remove `@fastify/awilix` and `awilix` from dependencies.
- Replace `req.diScope.resolve(...)` in auth flow with an explicit provider registry.
- Convert Google auth classes into either:
  - plain factory-created services, or
  - plain modules with explicit dependencies passed in

### Suggested Shape

- `modules/auth/auth.service.ts` owns provider selection
- `modules/auth/providers/googleOAuthProvider.ts` handles Google-specific verification
- token generation and refresh live in one auth-focused module

### Outcome

Multi-provider auth remains supported, but wiring becomes explicit and consistent.

## Stage 3: Replace Active Record Models with Repositories

### Tasks

- Replace `src/models/User.ts` with:
  - `modules/users/user.repository.ts`
  - `modules/users/user.schemas.ts`
- Replace `src/models/SearchHistory.ts` with:
  - `modules/history/history.repository.ts`
  - `modules/history/history.schemas.ts`
- Keep Prisma types and DB operations in repositories only.
- Move DTO mapping into small mapper functions if needed.

### Repository Responsibilities

- query Prisma
- return plain objects
- apply soft-delete filters consistently

### Service Responsibilities

- orchestration
- business rules
- combining repository calls

### Outcome

Less class boilerplate, less custom object lifecycle code, clearer separation between business logic and persistence.

## Stage 4: Centralize Auth and Request User Handling

### Tasks

- Replace custom JWT verification middleware with `@fastify/jwt`.
- Register auth as a Fastify plugin.
- Decorate request with a typed user payload.
- Keep token signing and verification in the same auth boundary.

### Notes

Current token shape is Google-specific. Generalize it so it supports future providers without encoding provider-specific fields directly into the core token type.

Suggested token shape:

```ts
type AuthToken = {
  userId: string;
  provider: "google";
  providerUserId: string;
};
```

### Outcome

Less duplicated token logic and cleaner support for additional providers.

## Stage 5: Add a Real Error Model

### Tasks

- Create shared errors such as:
  - `BadRequestError`
  - `UnauthorizedError`
  - `ForbiddenError`
  - `NotFoundError`
  - `ExternalServiceError`
- Update services/controllers to throw typed errors.
- Update the global Fastify error handler to map typed errors into HTTP responses.

### Outcome

Controllers stop repeating `try/catch` blocks and status mapping.

## Stage 6: Normalize Response Schemas

### Tasks

- Audit all route schemas against actual returned payloads.
- Add list response helpers where needed.
- Separate API response schemas from DB-shaped schemas.

### Fix First

- detection response should be an array schema
- history list response should be an array schema

### Outcome

Swagger docs and runtime payloads stay aligned.

## Stage 7: Centralize Env and Config

### Tasks

- Create `src/config/env.ts`.
- Validate all required env vars at startup.
- Export a typed config object.
- Remove scattered `process.env` access from controllers, services, and utils.

### Recommended Package

- `envalid` or `@fastify/env`

### Outcome

No more hidden runtime failures from missing env vars in deep modules.

## Stage 8: Simplify Detection Flow

### Tasks

- Isolate YOLO API interaction into a client module.
- Reduce file handling helpers.
- If possible, stream uploads through instead of saving and re-reading files.
- If temp files remain necessary, standardize lifecycle in one utility.

### Recommended Packages

- `file-type` for content-based file validation
- `tmp-promise` for temp file lifecycle
- consider native `fetch` / `FormData` instead of `axios` + `form-data`

### Outcome

Less custom filesystem code and fewer cleanup edge cases.

## Stage 9: Reduce Repetition in Routes and Controllers

### Tasks

- Keep controllers thin and focused on HTTP transport.
- Move repeated response helpers into a shared HTTP utility if still needed.
- Group schemas by feature instead of global buckets.

### Outcome

Feature modules become easier to scan end-to-end.

## Recommended Packages

### Strong candidates

- `@fastify/jwt`
- `@fastify/autoload`
- `fastify-plugin`
- `envalid` or `@fastify/env`
- `file-type`
- `tmp-promise`

### Conditional candidates

- `prisma-zod-generator` or `zod-prisma-types`
  - use if manual Prisma-shaped Zod schema duplication starts growing

## Packages to Remove

- `@fastify/awilix`
- `awilix`

Potentially also:

- `axios`
- `form-data`

Only remove those if the detection client is migrated to native fetch/web APIs.

## Suggested Order of Execution

1. Split `app.ts` and `server.ts`
2. Remove Awilix and rewire OAuth explicitly
3. Introduce auth module and provider registry
4. Replace model classes with repositories
5. Centralize env config
6. Add typed error classes and improve global error handling
7. Fix response schema mismatches
8. Simplify detection flow
9. Reorganize files into feature modules

## Scope Control

Keep each refactor slice behavior-preserving.

Do not combine these into one large rewrite. Preferred sequence:

- first wiring
- then persistence boundaries
- then auth/plugin cleanup
- then detection simplification
- then file layout cleanup

## Definition of Done

The refactor is complete when:

- there is no DI container
- OAuth provider selection is explicit
- Prisma access is isolated to repositories
- controllers are thin
- auth is centralized
- env access is centralized
- route schemas match real payloads
- detection flow uses fewer custom helpers
- the file layout is feature-oriented and easier to navigate
