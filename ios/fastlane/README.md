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

### ios certificates

```sh
[bundle exec] fastlane ios certificates
```

Fetch certificates and provisioning profiles

### ios test

```sh
[bundle exec] fastlane ios test
```

Runs all the tests

### ios do_testflight_build

```sh
[bundle exec] fastlane ios do_testflight_build
```



### ios beta_circleci_testflight

```sh
[bundle exec] fastlane ios beta_circleci_testflight
```

Submit a new Beta Build to TestFlight

### ios canary_ci_testflight

```sh
[bundle exec] fastlane ios canary_ci_testflight
```

Submit a new Canary Build to TestFlight

### ios distribute_beta_testflight

```sh
[bundle exec] fastlane ios distribute_beta_testflight
```

Distribute previously uploaded beta to TestFlight, using GA

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
