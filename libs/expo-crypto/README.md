# Expo Crypto

Private `@io-app/expo-crypto` Expo module for hardware-backed key generation,
public-key retrieval, signing, deletion, StrongBox detection and X.509 chain/CRL
validation. Migrated from `@pagopa/io-react-native-crypto` 1.2.5.

The JavaScript API, key aliases/application tags, hardware-backed key policies,
legacy and strict JWK encodings, and signing algorithms are retained. Existing
keys do not need to be regenerated. iOS StrongBox detection continues to reject
with `UNSUPPORTED_DEVICE`.

The pnpm override maps the legacy package name used by
`@pagopa/io-react-native-wallet` to this workspace package. Both package names
load the `IOCrypto` Expo native module, not the legacy React Native bridge.

Android retains Bouncy Castle 1.77; iOS retains OpenSSL-Universal for CRL
verification. Expo autolinking registers the native implementations. Expo Go is
not supported.

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
