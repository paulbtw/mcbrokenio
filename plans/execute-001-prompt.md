# Executor prompt for Plan 001

Copy and paste the prompt below into the coding agent that will implement the
migration.

```text
Implement the complete migration described in:

  plans/001-node-26-and-dependency-upgrade.md

Repository:

  /Users/paulvatiche/conductor/workspaces/mcbrokenio/cairo

Target branch for comparisons: origin/master. Stay on the current branch and do
not rename it.

This is an implementation task, not a request to summarize or rewrite the plan.
Read these files completely before changing anything:

1. CLAUDE.md
2. plans/README.md
3. plans/001-node-26-and-dependency-upgrade.md
4. The package manifests, CI workflows, and configuration files referenced by
   the plan

Then implement Plan 001 step by step and in its stated order. Treat each step as
a separate migration wave. Run its verification gate and get it green before
continuing. Do not perform one blind repository-wide latest-version update.

Operating rules:

- Start with the plan's drift check against commit 90dd23c. If the repository
  has materially drifted, stop and report the mismatches before editing.
- Preserve unrelated and pre-existing user changes. Never reset, overwrite, or
  revert work you did not create.
- Establish the frozen Node 22.11.0 / pnpm 10.25.0 baseline first. If the
  baseline install, verification, frontend build, or Lambda packaging fails,
  stop and report the exact failure before making migration changes.
- Use pnpm only. Keep workspace dependencies as workspace:* and keep duplicated
  tool versions coherent across workspaces.
- Use the newest compatible stable package versions available when executing,
  but re-read official migration notes before adopting any major newer than the
  plan's dated version snapshot.
- Node 26 is the local-development and CI target. Use the latest patched 26.x
  version available. Keep AWS Lambda and Vercel managed production on Node 24
  until both platforms officially support Node 26. Do not introduce a custom
  runtime or container to force Node 26.
- Keep TypeScript on the newest version supported by the installed
  typescript-eslint peer range. Do not force TypeScript 7 while the peer range
  excludes it, and do not hide migration work with ignoreDeprecations.
- For ESLint 10, replace eslint-plugin-import with eslint-plugin-import-x as
  specified in the plan, while preserving the existing import/* rule names.
- Serverless Framework 4 requires operator-approved authentication/licensing.
  Never commit a credential. If the policy or non-interactive CI secret strategy
  is unavailable, stop at that gate and clearly list what remains.
- Do not change Prisma models or create/edit SQL migrations. Preserve the public
  @mcbroken/db exports and verify the Prisma 7 client is present in all Lambda
  packages.
- Preserve product behavior, public API response shapes, map behavior, styling,
  rate limiting, logging, and Sentry behavior. Only make changes required by
  the migration.
- Do not deploy to staging or production, change cloud resources, push, or open
  a pull request. Treat the plan's suggested commits as logical checkpoints;
  create commits only if explicitly authorized in this session.
- If a STOP condition in the plan occurs, stop instead of broadening scope or
  improvising.

Testing and review requirements:

- Add or update focused tests where the plan requests characterization of
  Serverless configuration, p-queue behavior, or Sentry behavior.
- Run pnpm verify after every completed wave.
- Run the Next.js production build after every frontend wave.
- Run serverless package for mcall, mcus, and mcau after the Prisma and
  Serverless waves, and inspect the generated artifacts/configuration.
- Before finishing, run every command in the plan's final verification block,
  including frozen install, full verification, frontend build, all Lambda
  packages, direct dependency listing, outdated check, and security audit.
- Do not use blanket overrides to hide audit findings. Document every residual
  high/critical advisory or intentionally held package with its dependency path
  and reason.
- Review the final diff for out-of-scope changes and run git diff --check.

Progress handling:

- Mark Plan 001 IN PROGRESS in plans/README.md once the baseline and policy
  gates pass and implementation begins.
- Keep working through all safe, in-scope waves. Do not stop merely because the
  migration is large.
- Mark the plan DONE only when every done criterion in the plan holds. If a plan
  STOP condition prevents completion, leave a concise BLOCKED reason in the
  index and report the exact evidence and the next required decision.

At completion, provide a concise handoff containing:

1. The final Node, pnpm, TypeScript, ESLint, Next, React, Prisma, Serverless,
   Tailwind, AWS Lambda runtime, and major library versions.
2. The files and migration waves changed.
3. Every verification command run and whether it passed.
4. Any remaining outdated packages or audit advisories and why they remain.
5. Confirmation that no production deployment occurred and whether Plan 001 is
   DONE or BLOCKED.
```
