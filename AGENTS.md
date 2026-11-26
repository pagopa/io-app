# Repository guidelines

Run any script in `apps/main-app/package.json` as `pnpm nx run main-app:<script>`; run `sync` after cloning or pulling.

## Guardrails

- `libs/api-types/generated/definitions/` is generated: change it only by running `pnpm nx run main-app:generate`.
- Before adding a user-facing string or touching `apps/main-app/locales/`, read `CODING_STANDARDS.md#i18n`: Lokalise owns every locale value, and CI rejects value edits outside Lokalise PRs.
- Before changing authentication or session behaviour (`apps/main-app/ts/features/authentication/`, `apps/main-app/ts/features/lollipop/`), read `docs/authentication/login-flows.md`; if the change alters what it describes (flows, request parameters, session lifecycle, error handling), update the doc in the same PR.
- When adding, removing, or upgrading a native dependency, or changing `AndroidManifest.xml`, `Info.plist`, entitlements, or permission config in `app.json`, review the "What permissions does the app request?" section of `apps/main-app/README.md` and update it in the same PR. On Android, check the merged manifest by running `./gradlew :app:processProductionReleaseManifest` in `apps/main-app/android`; `app/build/outputs/logs/manifest-merger-production-release-report.txt` lists each permission's sources.
- Before any `git commit`, `git push`, or `gh pr create`, read `CODING_STANDARDS.md#commits-and-pull-requests`.
- A task is complete only when `pnpm nx affected --targets=lint,oxlint,tsc-noemit` and `pnpm format` both finish with zero errors.

## Coding standards

Before writing code, read `CODING_STANDARDS.md#general` and every other section matching your change:

- Creating a feature or placing a new file → `CODING_STANDARDS.md#feature-structure`
- Adding a route or screen → `CODING_STANDARDS.md#navigation`
- Writing actions, reducers, selectors, sagas, or store access → `CODING_STANDARDS.md#redux-and-sagas`
- Writing an XState machine → `CODING_STANDARDS.md#state-machines`
- Building components or screens → `CODING_STANDARDS.md#ui`
- Using or adding colors → `CODING_STANDARDS.md#colors`
- Writing tests or fixing a bug → `CODING_STANDARDS.md#testing`
