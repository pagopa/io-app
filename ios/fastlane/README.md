fastlane documentation
================
# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using
```
[sudo] gem install fastlane -NV
```
or alternatively using `brew cask install fastlane`

# Available Actions
## iOS
### ios certificates
```
fastlane ios certificates
```
Fetch certificates and provisioning profiles
### ios test
```
fastlane ios test
```
Runs all the tests
### ios register_new_device
```
fastlane ios register_new_device
```
Register new device
### ios refresh_profiles
```
fastlane ios refresh_profiles
```

### ios test_build
```
fastlane ios test_build
```

### ios do_adhoc_build
```
fastlane ios do_adhoc_build
```

### ios do_testflight_build
```
fastlane ios do_testflight_build
```

### ios beta
```
fastlane ios beta
```
Submit a new Beta Build to HockeyApp

This will also make sure the profile is up to date
### ios beta_testflight
```
fastlane ios beta_testflight
```
Submit a new Beta Build to TestFlight
### ios release
```
fastlane ios release
```
Deploy a new version to the App Store

----

This README.md is auto-generated and will be re-generated every time [fastlane](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
