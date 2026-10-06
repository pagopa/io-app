# Repository guidelines

Uses TypeScript, React Native + Expo modules, Redux, Redux-Saga, XState v5
Package manager: `pnpm`

## Build, Lint, Test

- `pnpm nx run main-app:sync` - full setup (first time / after pull)
- `pnpm nx run main-app:start` - Start Metro bundler
- `pnpm nx run main-app:run-ios` - Run on iOS simulator
- `pnpm nx run main-app:dev-run-android` - Run on Android emulator
- `pnpm nx run main-app:generate` - Generate API models from OpenAPI
- `pnpm nx run main-app:test-dev` - Run tests
- `pnpm nx tsc-noemit main-app` - TypeScript type-check (no emit)
- `pnpm nx lint main-app` - Lint
- `pnpm nx run main-app:lint-autofix` - Lint + autofix
- `pnpm format` - Format code

## Guidelines

- `libs/api-types/generated/definitions/` is generated: regenerate it with `pnpm nx run main-app:generate` and never edit it by hand.
- A task is complete only when `pnpm nx affected --targets=lint,oxlint,tsc-noemit` and `pnpm format` both finish with zero errors.
- Write new code with native TypeScript equivalents instead of `fp-ts`.
- Suppress a type error only with `// @ts-expect-error <reason>`; oxlint rejects `@ts-ignore` and directives without a reason.

## Coding standards

Before writing code, read every section of `CODING_STANDARDS.md` that matches your change:

- Creating a feature or placing a new file in one → `CODING_STANDARDS.md#feature-structure`
- Adding a route or screen → `CODING_STANDARDS.md#navigation`
- Writing actions, reducers, selectors, sagas, or store access from components → `CODING_STANDARDS.md#redux-and-sagas`
- Writing an XState machine → `CODING_STANDARDS.md#state-machines`
- Building components or screens, or adding user-facing strings, colors, or constants → `CODING_STANDARDS.md#ui`
- Fixing a bug or writing tests → `CODING_STANDARDS.md#testing`
- Writing comments or JSDoc → `CODING_STANDARDS.md#comments`

## I18n

Lokalise owns every locale value under `apps/main-app/locales/`; CI rejects value changes outside Lokalise `lok_*` PRs.

- Add new keys only to the base locale `apps/main-app/locales/it/index.json`. Lokalise fills in the other languages.
- Leave existing values untouched. When a copy change is requested, report each full dotted key path (e.g. `features.wallet.title`) with its locale and tell the user to edit it on Lokalise.

## Commits

- Use conventional commits specification
- Focus commit messages on user impact rather than implementation details.
- **NEVER** add Co-Authored-By with yourself as co-author of the commit. Agents cannot be authors, humans can be, Agents are assistants.
- Work on a dedicated branch for the issue; **NEVER** push to master.

## Pull requests

Before pushing:

1. Review the full diff and keep only intentional, task-related changes.
2. Run the Guidelines completion checks and all relevant tests; continue only when everything passes.
3. Rebase your branch onto master. Resolve all conflicts. If conflicts are complex, stop and ask for guidance.

Then push the branch to the remote, open the PR creation page in the browser with title and body pre-filled, and stop immediately after it opens:

```
gh pr create --web --title <title> --body <body>
```

- Use title format `type: [ISSUE-ID] short description`, under 70 characters, using conventional commit types.
- Fill every section of `.github/PULL_REQUEST_TEMPLATE.md`.
- In "How to test", give steps to verify the changes, expected behavior, and relevant edge cases. Add "Steps to Reproduce" for bugs.
