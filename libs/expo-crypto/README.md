# Expo Crypto

[`@pagopa/expo-crypto`](https://www.npmjs.com/package/@pagopa/expo-crypto)
Expo module for hardware-backed key generation,
public-key retrieval, signing, deletion, StrongBox detection and X.509 chain/CRL
validation. Migrated from `@pagopa/io-react-native-crypto` 1.2.5.

The JavaScript API, key aliases/application tags, hardware-backed key policies,
legacy and strict JWK encodings, and signing algorithms are retained. Existing
keys do not need to be regenerated. iOS StrongBox detection continues to reject
with `UNSUPPORTED_DEVICE`.

The app imports this workspace package through the `@io-app/expo-crypto` alias.
The pnpm override also maps the package name used by
`@pagopa/io-react-native-wallet` to this workspace package. Both names load the
`IOCrypto` Expo native module, not the legacy React Native bridge. The app excludes
the legacy `@pagopa/io-react-native-crypto` name from Expo autolinking to register
the module only once, through the app's alias.

Android retains Bouncy Castle 1.77; iOS retains OpenSSL-Universal for CRL
verification. Expo autolinking registers the native implementations. Expo Go is
not supported.

## Installation

This package requires Expo SDK 55 with `expo-modules-core` and a native rebuild.
Install `@pagopa/expo-crypto` in an Expo project, or configure Expo
modules in an existing React Native project before installing it. Its
TypeScript sources are consumed directly by Metro; no JavaScript build step is
required.

## Releasing to npm

Nx manages this package independently in the `expo-crypto` release group, using
`expo-crypto-v{version}` Git tags and a project changelog. It does not bump the
app or design system.

The new npm package starts at `1.0.0`; it does not publish new versions of
`@pagopa/io-react-native-crypto`.

Bootstrap the new package once using an npm account with publishing permission
in the `@pagopa` organization. Preview the package first, then authenticate and
publish it using Nx:

```sh
pnpm nx release publish --group=expo-crypto --first-release --dry-run
npm login
pnpm nx release publish --group=expo-crypto --first-release
```

Once the package exists, configure a GitHub Actions trusted publisher in its
[npm package settings](https://www.npmjs.com/package/@pagopa/expo-crypto/access)
before the first automated publication:

- Organization: `pagopa`
- Repository: `io-app`
- Workflow: `expo-crypto-release.yml`
- Environment: `prod-libs`
- Allowed action: direct publishing with `npm publish`

The publishing job uses OIDC with `id-token: write`; no npm token is needed.
Trusted publishing automatically generates provenance. Complete an automated
publication within two days of configuring the trusted publisher, before the
unvalidated configuration expires.

Preview the first GitHub release:

```sh
pnpm nx release 1.0.0 --group=expo-crypto --first-release --skip-publish --dry-run
```

After reviewing the preview, remove `--dry-run` to update the version and
changelog, commit, tag, push and create the GitHub release. Authenticate locally
with GitHub before running it, and follow the repository's commit and push
guidelines. For subsequent releases, use a semver increment such as `patch` and
omit `--first-release`:

```sh
pnpm nx release patch --group=expo-crypto --skip-publish --dry-run
```

Publishing a GitHub release whose tag starts with `expo-crypto-v` triggers
`.github/workflows/expo-crypto-release.yml`. It checks that the tag matches the
package version, then runs `pnpm nx release publish --group=expo-crypto`.
Stable versions use the npm `latest` tag; prereleases use `next`. Use a personal
GitHub credential when creating the release: releases created with the default
Actions `GITHUB_TOKEN` do not trigger another workflow.
Nx skips publishing a version that is already on npm, including the bootstrapped
`1.0.0`.

Preview the npm package contents without publishing:

```sh
pnpm nx release publish --group=expo-crypto --dry-run
```

## Validation

```sh
pnpm nx test @io-app/expo-crypto --runInBand
pnpm nx run @io-app/expo-crypto:tsc-noemit
pnpm nx affected --targets=lint,oxlint,tsc-noemit
pnpm format
```

Before running the app, refresh CocoaPods with the usual main-app pod-install
target. Native builds and simulator/device execution are intentionally left to
the migration owner. On a physical device, verify retrieval and signing with an
existing key, new key generation, duplicate-key rejection, deletion, StrongBox
detection and certificate-chain validation with and without required CRLs.
