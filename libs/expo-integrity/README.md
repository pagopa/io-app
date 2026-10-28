# Expo Integrity

Local Expo module migrated from `@pagopa/io-react-native-integrity` 0.3.2.
The TypeScript entry point preserves the named functions and the
`IntegrityError` (`message`, `userInfo`) and `DecodedAttestation` types.
Errors retain the legacy values, including `CHALLANGE_ERROR` and Android's
`PREPARE_TOKEN_EXCEPTION`.

## Native APIs

| Function                                 | iOS                       | Android                                        |
| ---------------------------------------- | ------------------------- | ---------------------------------------------- |
| `isAttestationServiceAvailable`          | App Attest availability   | Unsupported                                    |
| `generateHardwareKey`                    | App Attest key identifier | Unsupported                                    |
| `getAttestation`                         | App Attest attestation    | Hardware-backed key and certificate chain      |
| `generateHardwareSignatureWithAssertion` | App Attest assertion      | Unsupported                                    |
| `decodeAssertion`                        | CBOR assertion decoding   | Unsupported                                    |
| `isPlayServicesAvailable`                | Unsupported               | Google Play Services availability              |
| `prepareIntegrityToken`                  | Unsupported               | Prepare Play Integrity standard token provider |
| `requestIntegrityToken`                  | Unsupported               | Request Play Integrity standard token          |

Unsupported operations reject with `PLATFORM_NOT_SUPPORTED`.
Call `prepareIntegrityToken` with the Google Cloud project number before requesting
tokens. The optional request hash is forwarded unchanged.

Android retains the AndroidKeyStore aliases, P-256/SHA-256 keys, StrongBox-to-TEE
fallback, hardware-backing checks, and base64-encoded comma-separated certificate
chain format. It intentionally does not set `unlockedDeviceRequired`, matching
the original module's workaround for Android 14 and earlier.
iOS retains SHA-256 hashing of UTF-8 challenges and client data and base64-encoded
attestations, assertions, signatures, and authenticator data.

## Integration

The app depends on `@io-app/expo-integrity` through `workspace:*`. Expo autolinking
registers `ExpoIntegrity` on both platforms. Android uses Play Integrity 1.3.0 and
Play Services Base 18.3.0; iOS uses DeviceCheck, CryptoKit, and SwiftCBOR.
No React Native bridge package, Objective-C shim, or Expo config plugin is needed.
Existing App Attest entitlements and Google Cloud/Play Console configuration
remain required. Expo Go is not supported; rebuild the native app after migration.

## Validation

Run `pnpm nx test @io-app/expo-integrity --runInBand` for the wrapper contract tests.
Run `pnpm nx run main-app:dev-pod-install` after installing workspace dependencies.

On physical devices, verify wallet issuance and signing on both platforms:
App Attest availability, key generation, attestation, assertion generation and
decoding on iOS; Play Services availability, token preparation and requests, and
hardware key attestation on Android. Verify backend acceptance of the resulting
attestations and signatures and signing with existing Android key aliases.
Android devices with and without StrongBox should both be exercised, along with
unavailable services and requesting a token before preparation.
