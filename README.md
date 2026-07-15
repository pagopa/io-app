<p align="center">
  <img src="apps/main-app/img/io-app-icon.png" width="100" style="display: block" /><br />
  <h3 align="center">IO — The Italian public services app</h3>
</p>

<p align="center">
  <a href="https://github.com/pagopa/io-app/actions/workflows/publish-app-build-nightly.yml">
    <img src="https://github.com/pagopa/io-app/actions/workflows/publish-app-build-nightly.yml/badge.svg?branch=master" alt="Nightly build" />
  </a>
  <a href="https://codecov.io/gh/pagopa/io-app">
    <img src="https://codecov.io/gh/pagopa/io-app/branch/master/graph/badge.svg" alt="Codecov" />
  </a>
  <img src="https://img.shields.io/github/contributors-anon/pagopa/io-app" alt="Contributors" />
  <img src="https://img.shields.io/github/repo-size/pagopa/io-app" alt="Repo size" />
</p>

<p align="center">
  <a href="https://apps.apple.com/it/app/io/id1501681835">
    <img height="50" src="apps/main-app/img/badges/app-store-badge.png" alt="Download on the App Store" />
  </a>
  <a href="https://play.google.com/store/apps/details?id=it.pagopa.io.app">
    <img height="50" src="apps/main-app/img/badges/google-play-badge.png" alt="Get it on Google Play" />
  </a>
</p>

---

# IO App — Monorepo

This repository hosts the source code of the **IO mobile app** and the shared packages that power it.

**IO** is the official app that enables Italian citizens to interact with public administration services: messages, payments, documents, and more, all in one place. It is developed and maintained by [PagoPA S.p.A.](https://www.pagopa.it).

The mobile app lives in [`apps/main-app`](apps/main-app/README.md). The root of this repository is the **Nx monorepo** that groups the app together with its companion shared libraries.

---

## Table of contents

- [Repository structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Daily development commands](#daily-development-commands)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [License](#license)

---

## Repository structure

```
io-app/
├── apps/
│   └── main-app/         # IO mobile app (React Native)
├── libs/
│   └── design-system/    # @pagopa/io-app-design-system component library
├── .github/              # CI workflows, templates, and automation
├── docs/                 # Architecture notes and additional documentation
├── patches/              # pnpm package patches
├── scripts/              # Shared tooling scripts
├── nx.json               # Nx workspace configuration
└── pnpm-workspace.yaml   # pnpm workspace definition
```

Each project contains its own `README.md` with project-specific instructions:

- [apps/main-app/README.md](apps/main-app/README.md) — IO mobile app
- [libs/design-system/README.md](libs/design-system/README.md) — Design system library

---

## Prerequisites

| Tool | Notes |
|------|-------|
| **Node.js** | Version pinned in [`.node-version`](.node-version); use [nodenv](https://github.com/nodenv/nodenv) or [nvm](https://github.com/nvm-sh/nvm) |
| **pnpm** | Managed via [Corepack](https://nodejs.org/api/corepack.html); version pinned in `package.json` |
| **Ruby** | Version pinned in `apps/main-app/.ruby-version`; use [rbenv](https://github.com/rbenv/rbenv) |
| **Xcode** | Required for iOS builds (macOS only) |
| **Android Studio** | Required for Android builds |

Follow the [React Native environment setup guide](https://reactnative.dev/docs/environment-setup?guide=native) for your OS before proceeding.

---

## Getting started

```bash
# 1. Clone the repository
git clone https://github.com/pagopa/io-app.git
cd io-app

# 2. Enable Corepack and activate pnpm
corepack enable
corepack prepare --activate

# 3. Install Ruby gems (from apps/main-app)
cd apps/main-app
gem install bundler
bundle install
cd ../..

# 4. Full project bootstrap (installs JS deps, pods, and generates code)
pnpm nx run main-app:sync
```

> [!NOTE]
> `main-app:sync` runs `pnpm install`, gem setup, iOS pod install, and code generation from OpenAPI specs and localisation files. Re-run it after pulling changes that affect any of those layers.

### Environment variables

Copy the appropriate `.env` file before running the app:

```bash
# Target the production backend
cp apps/main-app/.env.production apps/main-app/.env

# Or target the local dev API server (io-dev-api-server)
cp apps/main-app/.env.local apps/main-app/.env
```

---

## Daily development commands

Run all commands from the **repository root**.

### Run the app

```bash
# Start the Metro bundler
pnpm nx run main-app:start

# iOS simulator
pnpm nx run main-app:run-ios

# Android emulator (productionDebug, active architecture only)
pnpm nx run main-app:dev-run-android
```

> [!IMPORTANT]
> The Android emulator does not support hardware-backed keystore. Disable the check before running:
> ```bash
> pnpm nx run main-app:lollipop_checks-comment
> ```
> Re-enable it before committing:
> ```bash
> pnpm nx run main-app:lollipop_checks-uncomment
> ```

### Code generation

```bash
# Regenerate API models from OpenAPI specs and locale files
pnpm nx run main-app:generate
```

> [!CAUTION]
> Never manually edit files under `apps/main-app/definitions/`. Always regenerate them with the command above.

### Quality checks

```bash
# Type-check the whole workspace (no emit)
pnpm nx tsc-noemit main-app
pnpm nx tsc-noemit io-app-design-system

# Lint
pnpm nx lint main-app
pnpm nx lint io-app-design-system

# Run tests
pnpm nx run main-app:test-dev

# Run only affected projects
pnpm nx affected --target=lint,tsc-noemit

# Format code
pnpm prettify
```

---

## Architecture

| Layer | Technology |
|-------|-----------|
| Mobile app framework | React Native + Expo modules |
| Language | TypeScript |
| State management | Redux + Redux-Saga + XState v5 |
| UI components | `@io-app/design-system` (local workspace package) |
| Monorepo tooling | [Nx](https://nx.dev) + [pnpm workspaces](https://pnpm.io/workspaces) |

For a deeper dive into the app architecture and feature structure, see [apps/main-app/README.md](apps/main-app/README.md).

---

## Contributing

External contributions are welcome! Before you start:

1. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) for the full workflow.
2. Check the [open issues](https://github.com/pagopa/io-app/issues) for known bugs and planned work.
3. Ensure all quality checks pass before opening a pull request.

---

## License

[MIT](LICENSE)
