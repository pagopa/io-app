fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios beta_testflight

```sh
[bundle exec] fastlane ios beta_testflight
```

Submit a new Beta Build to TestFlight

### ios canary_testflight

```sh
[bundle exec] fastlane ios canary_testflight
```

Submit a new Canary Build to TestFlight (requires a prebuild with APP_VARIANT=canary)

### ios distribute_beta_testflight

```sh
[bundle exec] fastlane ios distribute_beta_testflight
```

Distribute previously uploaded beta to TestFlight, using GA

---

## Android

### android current_canary_version_code

```sh
[bundle exec] fastlane android current_canary_version_code
```

Get current canary version code from Google Play

### android build_release

```sh
[bundle exec] fastlane android build_release
```

Build the App in release mode

### android build_canary_release

```sh
[bundle exec] fastlane android build_canary_release
```

Build the App in release mode for Canary (requires a prebuild with APP_VARIANT=canary)

### android alpha

```sh
[bundle exec] fastlane android alpha
```

Build the App in release mode and deploy a new alpha version to the Google Play Store

### android alpha_canary

```sh
[bundle exec] fastlane android alpha_canary
```

Build the App in release mode and deploy a new alpha version to the Google Play Store (Canary)

### android promote_internal_to_alpha

```sh
[bundle exec] fastlane android promote_internal_to_alpha
```

Promote the internal version to alpha

### android download_apk

```sh
[bundle exec] fastlane android download_apk
```

Download universal APK file from Google Play

### android download_canary_apk

```sh
[bundle exec] fastlane android download_canary_apk
```

Download universal APK file from Google Play (Canary)

---

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
