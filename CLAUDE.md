# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

`pizza-app` is a NestJS 11 + TypeORM 1.x + PostgreSQL backend for a pizzeria. It is currently a **bare scaffold**: `AppModule` has no imports, and `DatabaseModule` (`src/database/database.module.ts`) exists but is **not yet registered** in `AppModule`. There are no entities, migrations, controllers or unit tests yet (`test/app.e2e-spec.ts` is the Nest starter test).

The sibling project `../pizzaria-api` is the fully built version of this same API (auth/JWT, users, categories, products with Cloudinary banners, orders). Its `.cursor/CONTEXTO.md` documents the intended architecture, endpoints and conventions in Portuguese. Use it as the reference when porting features into `pizza-app`; `../ui` is the React/Vite frontend. The three directories live in one git repo rooted at `../` (no commits yet, current branch `master`, main branch `main`).

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
- Target conventions, as established in `../pizzaria-api`: feature modules under `src/<feature>/`; entities in `src/entities/`, enums in `src/enums/`; files named `<feature>.<type>.ts`; controllers stay thin; mappers return response types instead of entities (so `passwordHash` never leaks); global JWT guard via `APP_GUARD` with `@Public()` opt-out and `@RequiredRoles(...)` for authorization; a global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted` and `transform` set to `true` in `main.ts`.

## Code style

Prettier (`.prettierrc`): single quotes, **no semicolons**, `printWidth: 100`, trailing commas everywhere. Class properties use definite assignment (`name!: string`). The repo's `.vscode/settings.json` organizes imports and removes unused ones on save. TypeScript runs with `strictNullChecks` but not `noImplicitAny`. ESLint uses type-checked `typescript-eslint` rules, with `no-explicit-any` off and `no-floating-promises` as a warning (`main.ts` uses `void bootstrap()`).

Per the sibling project's conventions, commit messages are written in Portuguese, focus on the *why*, and use one file per commit.

## Environment

`.env` (gitignored) must define `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`. It also carries `JWT_SECRET`, `JWT_ISSUER`, `JWT_EXPIRATION_TIME` (seconds) and `CLOUDINARY_*` values for features not yet ported. `../pizzaria-api/.env.example` is the template for these.
