# Plan 001: Upgrade to Node 26 compatibility and current dependencies

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. Keep each wave independently reviewable. If anything in the
> "STOP conditions" section occurs, stop and report; do not improvise. When
> done, update this plan's row in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 90dd23c..HEAD -- .nvmrc package.json pnpm-lock.yaml pnpm-workspace.yaml apps packages .github README.md CLAUDE.md .ai .husky scripts`
> If an in-scope file changed since this plan was written, compare the
> "Current state" facts against the live code before proceeding. A material
> mismatch is a STOP condition.

## Status

- **Priority**: P1
- **Effort**: L (multi-day, preferably several PRs or commits)
- **Risk**: HIGH — several independent runtime/framework major upgrades
- **Depends on**: none
- **Category**: migration
- **Planned at**: commit `90dd23c`, 2026-08-07

## Why this matters

The repository currently develops and builds on Node 22 while all three AWS
Lambda services still execute on `nodejs20.x`, an upstream-EOL runtime. Its
lockfile is also behind multiple framework and library majors. A read-only
`pnpm audit --audit-level high` against the current lockfile reports 217
advisories (6 critical, 105 high), including direct paths through Serverless 3,
Next 15.5.9, and an older Vitest resolution.

The desired destination is a Node 26-compatible developer/CI toolchain and a
fully reviewed dependency refresh. Full production Node 26 parity is not yet
available: on the planning date Node 26.5.1 is Current and does not enter LTS
until October 2026; AWS Lambda and Vercel currently offer Node 24 as their
newest managed Node runtime. Therefore this plan uses Node 26 locally and in CI,
uses Node 24 for AWS/Vercel production, and includes a later platform gate for
switching production to Node 26.

## Current state

- This is a pnpm/Turborepo monorepo with four apps and five shared packages.
- `package.json:4-6` permits Node `>=22` and pnpm `>=9`;
  `package.json:59` pins `pnpm@10.25.0`.
- `.nvmrc:1` pins `v22.11.0`.
- `.github/workflows/quality.yml:23-27` and six equivalent setup blocks in
  `.github/workflows/deploy.yml` request Node 22.
- `packages/serverless-config/index.ts:47-65` pins Serverless Framework 3 and
  AWS Lambda `nodejs20.x`; lines 84-94 configure the `serverless-esbuild`
  plugin with target `node20`.
- `packages/database/prisma/schema.prisma:4-8` uses Prisma 6's
  `prisma-client-js` generator plus native engine binaries. The shared
  Serverless config and all three serverless app `predeploy` scripts manually
  package that generated engine.
- `apps/frontend/package.json:16-52` is on Next 15, React 19.1, Tailwind 3,
  Mapbox GL 2/react-map-gl 7, and the legacy `react-query` package.
- `apps/frontend/src/middleware.ts:1-32` uses Next's old middleware convention;
  Next 16 renames this convention to `proxy`.
- `apps/frontend/src/components/Map/index.tsx:11-19` and the related map hooks
  import from `react-map-gl`; v8 with Mapbox GL 3 requires
  `react-map-gl/mapbox`.
- `apps/frontend/src/app/globals.css:1-3` and
  `apps/frontend/postcss.config.js:1-6` use the Tailwind 3 PostCSS setup.
- `packages/eslint-config/base.mjs:4,23,67` loads
  `eslint-plugin-import`. Its latest release declares ESLint only through v9,
  while `eslint-plugin-import-x@4.17.1` declares ESLint 10 support and can be
  mounted under the existing `import` plugin key.
- `apps/frontend/tsconfig.json`, all three `apps/mc*/tsconfig.json`,
  `packages/mclogik/tsconfig.json`, and
  `packages/serverless-config/tsconfig.json` set `baseUrl`; TypeScript 6 warns
  about options removed by TypeScript 7.
- The current checkout has no `node_modules`. The planning-time baseline command
  `pnpm verify` therefore fails before compilation at `prisma generate` with
  `prisma: command not found`. Establishing a genuine Node 22 baseline after a
  frozen install is mandatory.

Existing conventions to preserve:

- Use pnpm only and keep workspace dependencies as `workspace:*`.
- The full local quality gate is `pnpm verify`, which generates Prisma Client,
  then runs every workspace's typecheck, lint, and tests.
- Tests use Vitest; follow
  `packages/serverless-config/index.test.ts` for config assertions,
  `packages/mclogik/src/utils/RateLimitedExecutor.test.ts` for `p-queue`
  behavior, and `packages/mclogik/src/sentry/index.test.ts` for Sentry wrappers.
- Cross-package imports use `@mcbroken/*` rather than relative paths.
- Recent commit history accepts conventional messages such as
  `feat(mclogik): ...`, `refactor(frontend): ...`, and `ci: ...`.

## Target policy and version snapshot

"Upgrade all packages" means every direct dependency must be either at the
latest compatible release at execution time, replaced by its maintained
successor, removed because it is obsolete, or recorded in the exception table
with evidence. Do not blindly run one unconstrained update across the repo.

Planning-time targets from the npm registry (2026-08-07):

| Area | Current | Target |
|------|---------|--------|
| Runtime/package manager | Node 22.11; pnpm 10.25 | Node 26.5.1 local/CI; Node 24 managed production; pnpm 11.20.0 |
| Compiler/lint | TypeScript 5.9; ESLint 9 | TypeScript 6.0.3; ESLint 10.8.0; `@eslint/js` 10.0.1; `typescript-eslint` 8.66.0 |
| Build/test | Turbo 2.8; Vitest 4.0/4.1 | Turbo 2.10.8; Vitest and coverage 4.1.10; Prettier 3.9.6 |
| Git hooks | Husky 8; implicit `npx lint-staged` | Husky 9.1.7; add `lint-staged` 17.3.0 and invoke with `pnpm exec` |
| AWS deployment | Serverless 3.40; plugin esbuild; Lambda Node 20 | Serverless 4.40; built-in esbuild; Serverless Offline 14.8; Lambda Node 24 |
| Database | Prisma 6.19; pg 8.16 | Prisma/client/adapter 7.9.1; pg 8.22; dotenv 17.4; latest `@types/pg` |
| Frontend framework | Next 15.5; React 19.1 | Next/bundle analyzer/config/plugin 16.3; React/DOM 19.2.8; matching type packages |
| Frontend data | `react-query` 3.39 | replace with `@tanstack/react-query` 5.101.4 |
| Frontend styling | Tailwind 3.3; old PostCSS plugin | Tailwind and `@tailwindcss/postcss` 4.3.3; PostCSS 8.5.26; remove Autoprefixer |
| Map | Mapbox GL 2.15; react-map-gl 7.1 | Mapbox GL 3.28.1; react-map-gl 8.1.2 |
| Shared runtime | AWS SDK 3.962, Sentry 9, logger 4, p-queue 7 | AWS SDK 3.1105, Sentry 10.69, logger 6, p-queue 9.3 |
| Other frontend majors | Vercel Analytics 1, Functions 2, date-fns 2, next-plausible 3, usehooks-ts 2, lucide pre-1 | Analytics 2.0, Functions 3.8, date-fns 4.4, next-plausible 4.0, usehooks-ts 3.1, lucide 1.30 |
| Other direct packages | versions reported by `pnpm outdated -r` | latest compatible patch/minor/major; keep CVA and clsx if still current |

Intentional exceptions at the planning date:

- Keep TypeScript at `6.0.3`, not npm-latest `7.0.2`, because
  `typescript-eslint@8.66.0` declares `typescript >=4.8.4 <6.1.0`. Recheck this
  peer range at execution time; only use TypeScript 7 if all lint/compiler peers
  have published compatible stable releases.
- If production remains on managed Node 24, either keep `@types/node` on the
  latest 24.x release for runtime parity or split browser/tooling types so
  deployed code cannot compile against Node 26-only APIs. Do not silently use
  Node 26 types for code that executes on Node 24.
- Node 26 production remains deferred until AWS Lambda and Vercel both list it
  as a managed runtime. Do not create a custom runtime just to eliminate this
  exception.

Before changing versions, consult these primary migration references:

- Node 26 release: https://nodejs.org/en/blog/release/v26.0.0
- Node release status: https://nodejs.org/en/about/previous-releases
- AWS Lambda runtimes: https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html
- Next 16: https://nextjs.org/docs/app/guides/upgrading/version-16
- Prisma 7: https://www.prisma.io/docs/orm/more/upgrade-guides/to-v7
- Serverless 4: https://www.serverless.com/framework/docs/guides/upgrading-v4
- Serverless built-in esbuild: https://www.serverless.com/framework/docs/providers/aws/guide/building
- ESLint 10: https://eslint.org/docs/latest/use/migrate-to-10.0.0
- TypeScript 6: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html
- Tailwind 4: https://tailwindcss.com/docs/upgrade-guide
- TanStack Query 5: https://tanstack.com/query/v5/docs/framework/react/guides/migrating-to-v5
- react-map-gl 8: https://visgl.github.io/react-map-gl/docs/upgrade-guide

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Frozen baseline install | `pnpm install --frozen-lockfile` | exit 0 under Node 22.11/pnpm 10.25 |
| Quality gate | `pnpm verify` | exit 0; all typechecks, lints, and tests pass |
| Frontend build | `pnpm --filter @mcbroken/frosty build` | exit 0; Next production build completes |
| One Lambda package | `pnpm --filter @mcbroken/mcall package` | exit 0; Serverless package completes without deployment |
| All Lambda packages | `for app in mcall mcus mcau; do pnpm --filter "@mcbroken/$app" package || exit 1; done` | exit 0 for all three |
| Dependency drift | `pnpm outdated -r --format json` | only documented temporary exceptions remain |
| Peer graph | `pnpm list -r --depth 0` | exit 0; no missing/invalid direct peers |
| Security audit | `pnpm audit --audit-level high` | exit 0, or every residual high/critical is documented with path and disposition |
| Changed files | `git status --short` | only in-scope paths plus `plans/README.md` are modified |

## Scope

**In scope** (the only product/config paths the executor may modify):

- Runtime/tooling: `.nvmrc`, `package.json`, `pnpm-lock.yaml`,
  `pnpm-workspace.yaml`, `.github/workflows/quality.yml`,
  `.github/workflows/deploy.yml`, `.husky/commit-msg`, `.husky/pre-commit`,
  `scripts/check-api-health.ts`.
- Workspace manifests: `apps/*/package.json`, `packages/*/package.json`.
- Shared compiler/lint config: `tsconfig.json`, `apps/*/tsconfig.json`,
  `packages/*/tsconfig.json`, `packages/typescript-config/*.json`,
  `eslint.config.mjs`, `apps/*/eslint.config.*`,
  `packages/*/eslint.config.*`, `packages/eslint-config/*.{js,mjs,d.ts}`.
- Serverless migration: `apps/mcall/serverless.ts`, `apps/mcus/serverless.ts`,
  `apps/mcau/serverless.ts`, `packages/serverless-config/index.ts`, and
  `packages/serverless-config/index.test.ts`.
- Prisma migration: `packages/database/prisma/schema.prisma`,
  `packages/database/prisma.config.ts`, `packages/database/src/*.ts`, plus
  import sites under `packages/mclogik/src/**` when the generated client type
  path changes. Do not commit generated Prisma output.
- Frontend major migrations: `apps/frontend/next.config.js`,
  `apps/frontend/src/middleware.ts` (rename to `proxy.ts`),
  `apps/frontend/postcss.config.js`, `apps/frontend/tailwind.config.ts`,
  `apps/frontend/src/app/globals.css`, and dependency import/call sites under
  `apps/frontend/src/**`.
- Shared runtime dependency migrations: import/call sites and their existing
  tests under `packages/mclogik/src/**`.
- Version documentation: `README.md`, `CLAUDE.md`, and `.ai/**/*.md` only where
  runtime/package instructions or version tables become stale.
- Plan status: `plans/README.md`.

**Out of scope** (do not touch):

- Any Prisma model or SQL migration; dependency upgrades must not alter the
  application data model.
- Product behavior, API response shapes, visual redesigns, and unrelated
  refactors.
- Production deployment, database migration execution, secret creation, or
  changing cloud resources. Staging deployment requires separate operator
  authorization.
- A custom Lambda runtime/container or a Vercel container solely to run Node 26.
- Renovate/Dependabot introduction; this plan upgrades the current tree only.

## Git workflow

- Stay on the current branch; do not rename it.
- Commit after each green wave so failures can be bisected. Suggested messages:
  `build: adopt node 26 toolchain`, `chore(deps): upgrade shared tooling`,
  `refactor(db): migrate to prisma 7`, `build(serverless): upgrade framework`,
  `refactor(frontend): upgrade framework dependencies`, and
  `docs: refresh supported versions`.
- Do not push or open a PR unless the operator explicitly requests it.

## Steps

### Step 1: Establish the Node 22 baseline and resolve policy gates

1. Use exactly Node 22.11.0 and pnpm 10.25.0 from the current pins.
2. Run the frozen install, `pnpm verify`, the frontend production build, and all
   three `serverless package` commands. Record failures before changing any
   manifest. Fixing unrelated baseline failures is outside this plan; report
   them.
3. Confirm the operator accepts Serverless Framework v4's authentication and
   license terms. Obtain the intended non-interactive CI mechanism (Dashboard
   access key or license key) without putting a secret in the repository.
4. Confirm the hosting policy: Node 26 for development/CI and Node 24 for managed
   AWS/Vercel production until platform support catches up. If the operator
   requires production Node 26 immediately, stop.

**Verify**:

```bash
node --version
pnpm --version
pnpm install --frozen-lockfile
pnpm verify
pnpm --filter @mcbroken/frosty build
for app in mcall mcus mcau; do pnpm --filter "@mcbroken/$app" package || exit 1; done
```

Expected: versions are `v22.11.0` and `10.25.0`; every remaining command exits
0. If not, preserve the output and STOP before attributing it to the migration.

### Step 2: Adopt Node 26 and pnpm 11 without changing application packages

1. Set `.nvmrc` to the latest patched Node 26 release approved at execution
   time (planning snapshot: `v26.5.1`). Remember that Node no longer bundles
   Corepack starting with Node 25; document installing pnpm explicitly rather
   than assuming `corepack enable` exists.
2. Set `packageManager` to the chosen pnpm 11 release (planning snapshot:
   `pnpm@11.20.0`). Set the root pnpm engine to `>=11 <12`.
3. Keep the root Node engine truthful for both environments, for example
   `>=24 <27`, and document `.nvmrc` as the canonical developer version. Do not
   set `>=26` while Vercel builds or Lambda packaging must run on Node 24.
4. Change the quality job to Node 26. In deployment jobs, use Node 26 for the
   quality/build tooling only if Vercel CLI and Serverless packaging pass;
   deployed managed runtime selection remains Node 24.
5. Update onboarding docs for Node 26 and explicit pnpm installation.
6. Regenerate only lockfile metadata with pnpm 11 before changing dependency
   versions. Review the diff for unexpected importer changes.

**Verify**:

```bash
node --version
pnpm --version
pnpm install --lockfile-only
pnpm install --frozen-lockfile
pnpm verify
```

Expected: Node reports the chosen 26.x patch, pnpm reports 11.x, lockfile and
quality commands exit 0.

### Step 3: Upgrade compiler, lint, tests, build tools, and hooks

1. First upgrade all TypeScript declarations to `6.0.3`, run `tsc --noEmit` in
   every workspace, and resolve TypeScript 6 diagnostics. Remove deprecated
   `baseUrl` entries while preserving each existing `paths` mapping relative to
   its owning tsconfig. Do not suppress deprecations with `ignoreDeprecations`.
2. Upgrade ESLint to 10.8.0 consistently across the root and workspaces;
   upgrade `@eslint/js`, `typescript-eslint`, Next/React/Turbo/import-sort/
   unused-import plugins, globals, and Prettier integration together.
3. Replace `eslint-plugin-import` with `eslint-plugin-import-x`. In
   `packages/eslint-config/base.mjs`, import the replacement but mount it under
   the existing `import` plugin key so `import/no-default-export` rules keep
   their names. Remove `@eslint/eslintrc` if a fresh search confirms it remains
   unused.
4. Upgrade Vitest and `@vitest/coverage-v8` to exactly matching versions,
   Turbo, Prettier, tsx, and all remaining tooling patches/minors.
5. Upgrade Husky to 9, change `prepare` from `husky install` to `husky`, remove
   Husky 8's sourced bootstrap from `.husky/pre-commit`, add a pinned
   `lint-staged` devDependency, and replace `npx lint-staged` with
   `pnpm exec lint-staged`. Keep the existing commit-message validation.
6. Remove `ts-node` after changing the stale shebang/comment in
   `scripts/check-api-health.ts` to match its existing `tsx` invocation and
   after Tailwind no longer needs a TypeScript config loader.

**Verify after the TypeScript substep and again after the complete wave**:

```bash
pnpm install
pnpm check-types
pnpm lint
pnpm test
pnpm verify
pnpm exec lint-staged --version
```

Expected: every command exits 0; the installed lint-staged version is the pinned
direct dependency; `grep -RIn '"baseUrl"' -- */*/tsconfig.json` returns no
tsconfig matches; `pnpm list -r typescript eslint vitest` shows one intended
version of each tool.

### Step 4: Migrate Prisma 6 to Prisma 7 without a data migration

1. Upgrade `prisma`, `@prisma/client`, and `@prisma/adapter-pg` together to the
   same 7.x release; upgrade `pg`, `dotenv`, and `@types/pg`.
2. Add `"type": "module"` to `packages/database/package.json` if required by
   the Prisma 7 ESM output and validate all consumers.
3. Change the generator from `prisma-client-js` to Prisma 7's `prisma-client`
   generator, keeping an explicit output directory. Because the app already
   uses `PrismaPg`, use the Rust-free client path and remove `binaryTargets`.
4. Update generated-client imports in `packages/database/src/index.ts` and
   `client.ts` to the files emitted by the chosen output. Keep the public
   `@mcbroken/db` and `@mcbroken/db/client` exports stable.
5. Remove obsolete query-engine copying from the three app `predeploy` scripts,
   the engine include/exclude patterns, and `PRISMA_QUERY_ENGINE_LIBRARY` only
   after a packaged Lambda contains the generated client, adapter, and pg code
   and executes its module initialization under Node 24.
6. Do not create or edit a SQL migration. Run `prisma validate` and generate
   only.

**Verify**:

```bash
pnpm --filter @mcbroken/db exec prisma validate
pnpm --filter @mcbroken/db db:generate
pnpm check-types
pnpm test
git diff --exit-code -- packages/database/prisma/migrations
```

Expected: validation/generation/typecheck/tests exit 0 and no migration file is
changed. Generated output remains ignored by git.

### Step 5: Upgrade shared backend runtime dependencies

1. Upgrade the AWS SDK S3 client, Axios, `p-queue`, `@sailplane/logger`, and
   `@sentry/aws-serverless` to their target majors/current releases.
2. Address changed imports or APIs only at their existing call sites under
   `packages/mclogik/src`. Preserve logging fields, rate/concurrency semantics,
   error capture, HTTP cancellation, and public exports.
3. Extend existing tests only where the new major changes observable behavior:
   - `RateLimitedExecutor.test.ts` must still prove the concurrency ceiling,
     empty input, failures, and result aggregation.
   - `sentry/index.test.ts` must still prove handler wrapping, scope metadata,
     breadcrumbs, and exception/message capture with the Sentry 10 surface.
   - Axios client tests must still cover request cancellation/error mapping.
4. Run with `NODE_OPTIONS=--pending-deprecation` once to expose dependencies
   that touch APIs removed or deprecated in Node 26. Treat warnings from the
   repository's code as failures; record upstream-only warnings with package
   and issue link.

**Verify**:

```bash
pnpm --filter @mcbroken/mclogik check-types
pnpm --filter @mcbroken/mclogik lint
pnpm --filter @mcbroken/mclogik test
NODE_OPTIONS=--pending-deprecation pnpm --filter @mcbroken/mclogik test
```

Expected: all commands exit 0 and rate-limit/Sentry behaviors remain covered.

### Step 6: Upgrade Serverless Framework and the managed Lambda runtime

1. Upgrade Serverless Framework to v4, `@serverless/typescript` to v4, and
   Serverless Offline to its latest compatible release.
2. Set `frameworkVersion` to a controlled v4 range. Configure non-interactive
   authentication in GitHub environments using the operator-approved secret;
   reference only the secret name in workflow YAML, never its value.
3. Remove `serverless-esbuild` and root `esbuild` unless another direct consumer
   is found. Remove the plugin from `plugins` and translate `custom.esbuild` to
   Serverless v4's native `build.esbuild` shape. Preserve bundle=true,
   minify=false, sourcemaps, platform behavior, and bounded concurrency; use v4
   names such as `external`, `buildConcurrency`, and `sourcemap` rather than
   copying old plugin keys blindly.
4. Set the AWS provider runtime to `nodejs24.x` and the compile target to
   `node24`. This replaces the EOL Node 20 production runtime while AWS lacks a
   managed Node 26 runtime.
5. Update `packages/serverless-config/index.test.ts` to assert the v4 framework
   range, `nodejs24.x`, native build settings, and the absence of obsolete
   Prisma-engine packaging.
6. Package all three services. Inspect each artifact listing to confirm handler
   files and Prisma's generated client/runtime dependencies are present, with
   no legacy native query-engine binary.

**Verify**:

```bash
pnpm --filter @mcbroken/serverless-config test
pnpm --filter @mcbroken/serverless-config check-types
for app in mcall mcus mcau; do pnpm --filter "@mcbroken/$app" package || exit 1; done
```

Expected: config tests/typecheck and all packages exit 0 under Node 26 tooling;
the generated CloudFormation templates select `nodejs24.x`.

### Step 7: Upgrade Next, React, and Vercel dependencies

1. Upgrade Next, `@next/bundle-analyzer`, `eslint-config-next`, and
   `@next/eslint-plugin-next` together to 16.x; upgrade React/React DOM and their
   type packages together to 19.2.x; upgrade Vercel Analytics/Functions and
   next-plausible.
2. Run the official Next 16 codemod on `apps/frontend`, review every edit, and
   retain only edits relevant to this app.
3. Rename `src/middleware.ts` to `src/proxy.ts` and rename the exported function
   from `middleware` to `proxy`, preserving the matcher and geolocation cookie.
4. Remove `--turbopack` from the `dev` script because Turbopack is default in
   Next 16. Keep the production build on Turbopack unless the bundle-analyzer
   wrapper demonstrably requires `--webpack`; if so, document that exception.
5. Confirm `cookies()` usage and all request APIs are asynchronous as Next 16
   requires. Do not enable Cache Components or React Compiler in this upgrade.

**Verify**:

```bash
pnpm --filter @mcbroken/frosty check-types
pnpm --filter @mcbroken/frosty lint
pnpm --filter @mcbroken/frosty test
pnpm --filter @mcbroken/frosty build
```

Expected: all commands exit 0; build output contains no middleware deprecation;
the geolocation proxy is included in the production build.

### Step 8: Upgrade frontend data, map, utility, and UI dependencies

1. Replace `react-query` with `@tanstack/react-query`. Change imports in
   `ReactQueryProvider.tsx`, `useMcData.ts`, and `useMcStats.ts`; convert string
   query keys (`"mcData"`, `"mcStats"`) to array keys (`["mcData"]`,
   `["mcStats"]`) as required by the maintained API. Preserve abort-signal
   propagation to Axios.
2. Upgrade Mapbox GL and react-map-gl. Change all imports in `Map/index.tsx`,
   `MapComponent.tsx`, and `useMapInteractions.ts` to
   `react-map-gl/mapbox`; resolve renamed v8 types without changing map style,
   token handling, layer IDs, popup selection, or controlled camera behavior.
3. Upgrade date-fns, usehooks-ts, lucide-react, Radix UI, tailwind-merge,
   Axios, and all remaining frontend direct dependencies. Make only migration-
   required call-site changes.
4. Remove `tailwindcss-animate` if the search confirms no animation utilities
   depend on it. Do not add a replacement solely to keep an unused plugin.

**Verify**:

```bash
pnpm --filter @mcbroken/frosty check-types
pnpm --filter @mcbroken/frosty lint
pnpm --filter @mcbroken/frosty test
pnpm --filter @mcbroken/frosty build
```

Expected: all commands exit 0 and no source import from `react-query` or bare
`react-map-gl` remains.

### Step 9: Migrate Tailwind 3 to Tailwind 4

1. Run Tailwind's official upgrade tool from `apps/frontend` and review its
   changes; do not accept unrelated formatting churn.
2. Add `@tailwindcss/postcss`, use it in the PostCSS config, remove Autoprefixer,
   and replace the three `@tailwind` directives with `@import "tailwindcss"`.
3. Preserve the CSS-variable-backed shadcn color tokens, radius values, dark
   class behavior, `border-border`, and `bg-background`/`text-foreground`.
   Migrate the necessary theme mapping to Tailwind 4's CSS-first form. Remove
   the TypeScript config only after every active customization is represented.
4. Search all JSX for renamed/removed Tailwind utilities called out in the v4
   guide, especially shadow/ring/outline changes. Update only semantics that
   would otherwise change visually.
5. Build and perform a browser smoke check at desktop and mobile widths: map
   fills its container; header/footer, stats cards, tabs, scroll area, skeleton,
   focus rings, colors, and dark-mode tokens match the pre-upgrade baseline.

**Verify**:

```bash
pnpm --filter @mcbroken/frosty check-types
pnpm --filter @mcbroken/frosty lint
pnpm --filter @mcbroken/frosty test
pnpm --filter @mcbroken/frosty build
```

Expected: all commands exit 0 and the documented visual smoke cases pass.

### Step 10: Reconcile every manifest, lockfile, audit result, and document

1. Run `pnpm outdated -r --format json`. For every result, update it, remove it,
   or add it to the explicit exception list with its peer/platform evidence.
   Recheck targets because registry versions may have moved since this plan.
2. Align duplicated dependencies (TypeScript, ESLint, Vitest, Axios, Next lint
   packages) to one intentional specifier policy across workspaces. Keep Prisma
   CLI/client/adapter and React/React DOM/types on coherent version sets.
3. Run a clean frozen install from the committed lockfile. Do not delete broad
   directories; if a clean-room check is needed, use a fresh disposable
   worktree or CI runner.
4. Run the full verification, frontend build, and all service packages.
5. Run `pnpm audit --audit-level high`. Do not use blanket `pnpm.overrides` to
   silence the report. For each residual high/critical, record direct path,
   reachability, upstream status, and a follow-up owner; security issues with a
   compatible patched release block completion.
6. Update README, CLAUDE.md, `.ai/core/technology-stack.md`, deployment docs,
   and workflow docs to state Node 26 local/CI, Node 24 managed production,
   pnpm 11, Next 16, Prisma 7, Serverless 4, Tailwind 4, and the explicit pnpm
   installation requirement.
7. Add a dated follow-up note to move AWS/Vercel production to Node 26 only
   after Node 26 is LTS and both providers expose it. At that time, change the
   root engine/types, Serverless runtime/build target, and Vercel project/runtime
   setting together, then rerun this plan's final gates.

**Verify**:

```bash
pnpm install --frozen-lockfile
pnpm verify
pnpm --filter @mcbroken/frosty build
for app in mcall mcus mcau; do pnpm --filter "@mcbroken/$app" package || exit 1; done
pnpm list -r --depth 0
pnpm outdated -r --format json
pnpm audit --audit-level high
git status --short
```

Expected: install, verification, build, and package commands exit 0; outdated
output contains only documented exceptions; audit has no actionable compatible
high/critical update left; changed files stay in scope.

## Test plan

- Preserve and run the entire existing Vitest suite after every dependency wave.
- Extend `packages/serverless-config/index.test.ts` with assertions for
  Serverless v4, Node 24, native esbuild configuration, and removal of Prisma's
  native-engine packaging.
- Reuse `RateLimitedExecutor.test.ts` to characterize `p-queue` 9 concurrency,
  failure counting, ordering-insensitive results, and empty input.
- Reuse `sentry/index.test.ts` to characterize Sentry 10 wrapper/capture APIs.
- Add focused frontend tests only if a migration changes logic beyond imports;
  do not introduce broad snapshots to approve markup churn.
- Treat the Next production build as the integration test for Next/React/
  Vercel/Tailwind/Mapbox module resolution.
- Treat each `serverless package` result as the integration test for Serverless
  v4 + Prisma 7 bundling. A staging invocation is recommended after this code
  plan but requires separate deployment authorization.

## Done criteria

All must hold:

- [ ] `.nvmrc` selects the approved Node 26 patch and CI quality runs on Node 26.
- [ ] Managed AWS/Vercel runtime policy remains Node 24 until documented support
      for Node 26 exists; no custom runtime was introduced.
- [ ] pnpm 11 is pinned and documented; no workflow relies on bundled Corepack.
- [ ] Every direct dependency is current, replaced, removed, or present in the
      explicit evidence-backed exception list.
- [ ] TypeScript is at the newest release supported by `typescript-eslint` and
      no removed/deprecated tsconfig option is merely suppressed.
- [ ] `pnpm install --frozen-lockfile` exits 0 from a clean checkout.
- [ ] `pnpm verify` exits 0.
- [ ] `pnpm --filter @mcbroken/frosty build` exits 0.
- [ ] All three `serverless package` commands exit 0 and select `nodejs24.x`.
- [ ] No Prisma SQL migration or model changed; generated files are untracked.
- [ ] No imports from legacy `react-query`, bare `react-map-gl`, or
      `eslint-plugin-import` remain.
- [ ] No Serverless 3/plugin-esbuild/native Prisma-engine packaging remains.
- [ ] `pnpm audit --audit-level high` has no actionable high/critical advisory
      with a compatible patch; residuals are explicitly documented.
- [ ] Runtime/package documentation matches the final manifests and workflows.
- [ ] `git status --short` contains no out-of-scope changes.
- [ ] `plans/README.md` marks Plan 001 DONE.

## STOP conditions

Stop and report back instead of improvising if:

- The Node 22 frozen baseline install/verify/build/package gates are not green.
- The operator does not approve Serverless v4's authentication/license terms or
  cannot provide a non-interactive CI credential strategy.
- Full production Node 26 is required before AWS Lambda and Vercel offer managed
  support.
- A newer target major appears after this plan and has migration requirements
  not covered here.
- TypeScript 7 is selected while any compiler/linter plugin still excludes it
  from its peer range, or ESLint 10 leaves an invalid peer dependency.
- Prisma 7 appears to require a SQL/data-model migration, changes public
  `@mcbroken/db` exports, or cannot be included in all three Lambda artifacts
  without restoring a native engine unexpectedly.
- Serverless v4 package output differs materially from current function/event/
  IAM/resource configuration.
- Any dependency upgrade requires changing public API response shapes or core
  product behavior.
- A step's verification fails twice after a reasonable migration correction.
- The fix requires an out-of-scope file or a production deployment.

## Maintenance notes

- Revisit Node 26 production adoption after October 2026 LTS and provider
  announcements. Runtime, Node types, esbuild target, Lambda runtime, Vercel
  setting, and CI should move as one tested unit.
- Revisit TypeScript 7 when `typescript-eslint` publishes a stable peer range
  that includes it. TypeScript 6 is deliberately the transition release; do not
  let `ignoreDeprecations` hide remaining work.
- Serverless v4 authentication is now part of developer onboarding and CI
  secret rotation. Reviewers should ensure no credential value enters git.
- Reviewers should scrutinize lockfile changes by wave, Prisma artifact contents,
  Serverless-generated CloudFormation diffs, Tailwind visual parity, and
  whether package-major fixes accidentally changed application behavior.
- After the migration, consider adding automated dependency PRs as a separate
  change so future upgrades stay small; that is intentionally outside this
  plan.
