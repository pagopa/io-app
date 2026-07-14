# Contributing to IO App

Thank you for your interest in contributing to **IO**, the Italian public services app. This document explains how to report issues, propose changes, and submit pull requests in a way that keeps the project healthy and moving forward.

---

## Table of contents

- [Code of Conduct](#code-of-conduct)
- [Before you start](#before-you-start)
- [Reporting bugs](#reporting-bugs)
- [Suggesting improvements](#suggesting-improvements)
- [Setting up the development environment](#setting-up-the-development-environment)
- [Development workflow](#development-workflow)
- [Coding conventions](#coding-conventions)
- [Commit messages](#commit-messages)
- [Pull request checklist](#pull-request-checklist)
- [Review process](#review-process)
- [Translations](#translations)
- [Security vulnerabilities](#security-vulnerabilities)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating you agree to uphold it. Please report unacceptable behaviour to the maintainers.

---

## Before you start

- Check the [open issues](https://github.com/pagopa/io-app/issues) and [pull requests](https://github.com/pagopa/io-app/pulls) to avoid duplicating existing work.
- For substantial changes (new features, architectural decisions), open an issue and discuss your approach with the maintainers **before** writing code.
- For bug fixes or small improvements, you can go straight to opening a pull request.

---

## Reporting bugs

Open a [GitHub Issue](https://github.com/pagopa/io-app/issues/new) and include:

1. A clear, descriptive title.
2. Steps to reproduce the issue.
3. Expected behaviour and actual behaviour.
4. App version, OS, and device model.
5. Relevant logs, screenshots, or recordings when possible.

> [!NOTE]
> For issues related to the design system components, please open the issue on the same repository and tag it with the `design-system` label.

---

## Suggesting improvements

Open a [GitHub Issue](https://github.com/pagopa/io-app/issues/new) with the `enhancement` label. Describe:

- The problem you are trying to solve or the opportunity you see.
- Your proposed solution at a high level.
- Any alternatives you considered.

---

## Setting up the development environment

Follow the setup instructions in the root [README.md](README.md#getting-started). Make sure the following complete without errors before starting work:

```bash
pnpm nx run main-app:sync
pnpm nx affected --target=lint,tsc-noemit
```

---

## Development workflow

1. **Fork** the repository and create a feature branch from `master`:
   ```bash
   git checkout -b fix/ISSUE-ID-short-description
   # or
   git checkout -b feat/ISSUE-ID-short-description
   ```

2. **Make your changes.** Follow the [coding conventions](#coding-conventions) below.

3. **Write tests** for new behaviour: cover the happy path, failure cases, and relevant edge cases.

4. **Run quality checks** from the repository root:
   ```bash
   pnpm nx affected --target=lint,tsc-noemit
   pnpm prettify
   pnpm nx run main-app:test-dev
   ```
   All checks must pass with zero errors before opening a PR.

5. **Rebase on `master`** to incorporate recent changes:
   ```bash
   git fetch origin
   git rebase origin/master
   ```
   Resolve any conflicts. If conflicts are complex, ask for guidance in your issue thread.

6. **Push your branch** and [open a pull request](#pull-request-checklist).

---

## Coding conventions

### General

- Use **TypeScript** for all new code. The `tsc-noemit` check must pass — never add `@ts-ignore` without a comment explaining why.
- Never use `fp-ts` in new code. Use native TypeScript equivalents.
- Never hardcode user-facing strings. Every string must have an `I18n.t(...)` key.
- Never use magic numbers or hardcoded values. Use enums, string literals, or well-named constants.

### Feature structure

Each feature lives under `ts/features/<feature>/` and must follow the [documented structure](apps/main-app/README.md#feature-structure). Keep all feature code self-contained; do not reach across feature boundaries directly.

### React Native / UI

- Use **`@io-app/design-system`** components first. Build custom components only when the design system has no suitable primitive.
- Use `useIOTheme()` to access colour tokens. Never use raw hex values.
- All interactive elements must have accessible labels (`accessibilityLabel`).

### State management

- Define Redux actions with `createAction` / `createAsyncAction` from `typesafe-actions`.
- Import saga effects from `typed-redux-saga/macro`, not bare `redux-saga/effects`.
- Use `useIOSelector`, `useIODispatch`, and `useIOStore` — never raw `useSelector`, `useDispatch`, or `useStore`.
- Define selectors in the feature's `store/selectors/` folder. Do not write inline selectors.
- Use `withRefreshApiCall` for authenticated endpoints that require automatic token refresh.

### State machines (XState)

- `machine.ts` must be **pure and portable**: no React, Redux, or navigation imports.
- Inject all side effects (navigation, Redux dispatch, toasts) via the machine provider.
- Define events as tagged union types with kebab-case `type` names.
- Use absolute state IDs for cross-hierarchy transitions (e.g. `#myMachine.Failure`).

### Testing

- Co-locate tests in `__tests__/` next to the implementation.
- Use `renderScreenWithNavigationStoreContext` for screen tests.
- Use `withStore` HOC for components that need store access.
- Use `expectSaga` for integration tests, `testSaga` for saga unit tests.
- Use `test.each` to cover multiple scenarios without repeating test code.
- Derive initial state from `appReducer(undefined, applicationChangeState("active"))`.

### Documentation

- Document all exported functions, hooks, and public APIs with JSDoc.
- Never write echo comments that just repeat the function name.
- Focus JSDoc on explaining business-logic constraints and non-obvious side effects.

---

## Commit messages

This project uses the [Conventional Commits](https://www.conventionalcommits.org/) specification.

**Format:** `type(scope): short description`

| Type | When to use |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or updating tests |
| `docs` | Documentation only changes |
| `chore` | Maintenance tasks (dependency updates, build tooling) |
| `perf` | Performance improvements |
| `ci` | CI configuration changes |

**Examples:**

```
feat(payments): add receipt download from transaction detail
fix(messages): prevent crash when attachment URL is malformed
refactor(onboarding): replace fp-ts with native Optional chain
docs: update main-app README with monorepo commands
```

- Use the present tense and imperative mood ("add", not "added" or "adds").
- Keep the subject line under 72 characters.
- Reference the issue ID in the subject when relevant: `fix: [IOPLT-1234] correct fiscal code parsing`.
- Never add yourself as a co-author on behalf of an AI assistant.

---

## Pull request checklist

Before requesting review, verify all of the following:

- [ ] The branch is rebased on `master` and has no merge conflicts.
- [ ] All tests pass: `pnpm nx run main-app:test-dev`.
- [ ] TypeScript check passes: `pnpm nx affected --target=tsc-noemit`.
- [ ] Lint passes: `pnpm nx affected --target=lint`.
- [ ] Code is formatted: `pnpm prettify`.
- [ ] `apps/main-app/definitions/` has not been manually edited (use `pnpm nx run main-app:generate`).
- [ ] Keystore check is re-enabled if you ran Android on an emulator: `pnpm nx run main-app:lollipop_checks-uncomment`.
- [ ] New public functions and components have JSDoc comments.
- [ ] New user-facing strings have `I18n.t()` keys in the locale files.
- [ ] The PR description clearly explains **what** changed and **why**.
- [ ] Steps to verify the change are included in the PR description.

### PR title format

```
type: [ISSUE-ID] short description
```

Example: `fix: [IOPLT-1234] prevent crash on missing attachment URL`

Keep the title under 70 characters.

---

## Review process

- A maintainer will review your PR within a few working days.
- Address all review comments before requesting a re-review.
- Keep the PR focused: one logical change per PR makes review faster and history cleaner.
- After approval, a maintainer will merge the PR (we use squash-merge or rebase-merge, depending on the change).

---

## Translations

IO App is localised in Italian and several other languages. Translation files live under `apps/main-app/locales/`.

See [apps/main-app/locales/README.md](apps/main-app/locales/README.md) for instructions on how to add or update translations.

---

## Security vulnerabilities

**Do not open a public GitHub issue for security vulnerabilities.**

Please follow the responsible disclosure process described in [`SECURITY.md`](.github/SECURITY.md) (if present) or contact the maintainers directly through the official PagoPA channels.
