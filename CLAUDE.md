# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

`pizza-app` is a NestJS 11 + TypeORM 1.x + PostgreSQL backend for a pizzeria, being built by porting features from the sibling project. `AppModule` imports `ConfigModule` (global, `.env`), `DatabaseModule`, `UserModule`, `AuthModule` and `CategoryModule`.

Ported so far:
- **auth** (`src/auth`): `POST /auth/login` and `POST /auth/refresh`, JWT access + refresh tokens (stateless), global `JwtAuthGuard` and `RulesGuard`.
- **user** (`src/user`): paginated list, create, update, deactivate (`DELETE :id`) and hard delete (`DELETE :id/permanent`).
- **category** (`src/category`): create, list, get, update (`PATCH`), delete. Routes live under `/category`, singular, like `/user`.

Not ported yet: products (Cloudinary banners) and orders. There is also an empty leftover `ControllerService` (`src/controller/`) registered in `AppModule`. Tests are still the Nest starter specs (`*.controller.spec.ts`, `*.service.spec.ts`, `test/app.e2e-spec.ts`), and the unit specs that import `@nestjs/typeorm` currently fail to load under Jest ("Must use import to load ES Module"), since that package is ESM-only.

The sibling project `../pizzaria-api` is the fully built version of this same API (auth/JWT, users, categories, products with Cloudinary banners, orders). Its `.cursor/CONTEXTO.md` documents the intended architecture, endpoints and conventions in Portuguese. Use it as the reference when porting features into `pizza-app`; `../ui` is the React/Vite frontend (CORS in `main.ts` only allows `http://localhost:5173`). `pizza-app` is its own git repository (remote `origin` is `github.com/andersongilvan/pizza-api`, main branch `main`; feature work happens on branches such as `category`). `../pizzaria-api` is also a separate repo, and the parent directory has an empty repo (no commits) that just lists these folders as untracked.

## Commands

```bash
docker compose up -d            # Postgres 16 (container postgres-db); reads DB_* from .env
npm run start:dev               # nest start --watch (PORT defaults to 3000)
npm run build                   # nest build (deleteOutDir: true)
npm run start:prod              # node dist/main
npm run lint                    # eslint --fix over src, apps, libs, test
npm run format                  # prettier --write src/**/*.ts test/**/*.ts
npm test                        # jest unit tests (rootDir: src, *.spec.ts)
npx jest path/to/file.spec.ts   # single unit test file
npx jest -t "test name"         # single test by name
npm run test:e2e                # jest --config test/jest-e2e.json (*.e2e-spec.ts)
```

Note that `lint` runs with `--fix`, so it modifies files.

### Migrations

```bash
npm run migration:generate --name=NomeDaMigration   # diff entities x DB (Postgres must be up)
npm run migration:create --name=NomeDaMigration     # empty migration for hand-written SQL
npm run migration:run
npm run migration:revert                            # undo the last applied migration
```

Files go in `src/database/migrations`. The scripts run the TypeORM CLI through ts-node as CommonJS using `tsconfig.typeorm.json` (the main tsconfig is `nodenext`), against `src/database/data-source.ts`. `data-source.ts` imports `dotenv`, which is only present transitively through `@nestjs/config`; add it as a direct dependency if you rely on it.

## Architecture notes

- **Schema is migration-only**: `synchronize: false` in both `DatabaseModule` and `data-source.ts`. Every entity change needs a migration. Entities are discovered by the glob `src/**/*.entity.{ts,js}` (plus `autoLoadEntities`), so entity files must be named `*.entity.ts`.
- **Two DB configs must stay in sync**: `database.module.ts` (runtime, via `ConfigService.getOrThrow`, so the app refuses to boot if a `DB_*` var is missing) and `data-source.ts` (TypeORM CLI, reads `process.env` directly).
- `DatabaseModule` sets `manualInitialization` when `NODE_ENV=test`, so e2e tests must initialize the DataSource themselves.
- Conventions, as established in `../pizzaria-api`: feature modules under `src/<feature>/`; entities in `src/entities/`, enums in `src/enums/`; files named `<feature>.<type>.ts` (DTOs are `dto.ts` in `auth`/`user`, `category.dto.ts` in `category`); controllers stay thin and services throw `NotFoundException`/`ConflictException`; responses must not expose entities with `passwordHash` (see `UserService.resolveUserResponse`). `main.ts` sets a global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted` and `transform` set to `true`.

### Auth

- `AuthModule` registers two global `APP_GUARD`s, in this order: `JwtAuthGuard` (strategy `jwt`, skipped by `@Public()`) and `RulesGuard` (checks `@RequiredRoles(...)`; routes without it are open to any authenticated user). Roles are `UserRole.ADMIN` and `UserRole.STAFF`.
- Tokens carry `{ sub, type: 'access' | 'refresh' }` and are signed with the same `JWT_SECRET`/`JWT_ISSUER`. Each strategy rejects the wrong `type`. The access token lifetime comes from `JWT_EXPIRATION_TIME` (via `ConfigService`), the refresh one from `JWT_REFRESH_EXPIRATION_TIME` (read from `process.env` in `AuthService.generateToken`).
- `POST /auth/refresh` is `@Public()` (the access token may already be expired) and protected by `JwtRefreshGuard` (strategy `jwt-refresh`), which reads the token from the body field `refreshToken`. It returns a new access/refresh pair and also checks that the user still exists and is `active`.
- Refresh tokens are **stateless**: no storage, rotation or revocation, so a leaked one stays valid until it expires. A `refresh_tokens` table keyed by `jti` is the planned upgrade.
- Both guards override `handleRequest` to answer `401 Token expirado` / `Refresh token expirado` for a `TokenExpiredError`. Expiry is checked by `passport-jwt` before `validate()` runs, so it must be handled in the guard, not inside `validate()`.

## Code style

Prettier (`.prettierrc`): single quotes, **no semicolons**, `printWidth: 100`, trailing commas everywhere. Class properties use definite assignment (`name!: string`). The repo's `.vscode/settings.json` organizes imports and removes unused ones on save. TypeScript runs with `strictNullChecks` but not `noImplicitAny`. ESLint uses type-checked `typescript-eslint` rules, with `no-explicit-any` off and `no-floating-promises` as a warning (`main.ts` uses `void bootstrap()`).

Per the sibling project's conventions, commit messages are written in Portuguese, focus on the *why*, and use one file per commit.

## Environment

`.env` (gitignored) must define `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`. Auth also requires `JWT_SECRET`, `JWT_ISSUER`, `JWT_EXPIRATION_TIME` (access token, seconds) and `JWT_REFRESH_EXPIRATION_TIME` (refresh token, seconds); the app refuses to boot without the first three. `CLOUDINARY_*` values are for features not yet ported. `../pizzaria-api/.env.example` is the template (it also lists `JWT_AUDIENCE`, which `pizza-app` does not read yet).

`.env` is only read at boot, and `nest start --watch` does not restart on `.env` changes. When a variable is declared twice, dotenv keeps the **first** occurrence, so a duplicate further down is silently ignored.
