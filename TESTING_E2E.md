# E2E testing

As of today, only IOS is supported via Detox.

## IOS

### Requirements

* [Wix AppleSimulatorUtils](https://github.com/wix/AppleSimulatorUtils)
* a running instance of [io-dev-api-server
](https://github.com/pagopa/io-dev-api-server) at `http://127.0.0.1:3000` (with the same config available at https://github.com/pagopa/io-app/blob/master/scripts/api-config.json)

### Running

Please note that as of now only the `ios.sim.release` configuration is setup and available
 because is the one we run on the CI.

Since Detox is installed as an NPM package, you can run every command using `yarn detox _args_`.

Preparing a build to test:

```
RN_SRC_EXT=e2e.ts yarn detox build --configuration ios.sim.release
```

Launching the test suite:

```
yarn detox test --configuration ios.sim.release
```

To run in _debug_ mode use `ios.sim.debug` as configuration target and `--loglevel verbose` to see more
logs from the tests.

Important: the tests run in a **headless simulator**. You must open it by yourself **before running them** if 
you want to see what happens on the UI on your machine.

Please look at [CircleCI config](./circleci/config.yml) for more options and to see how the
 different parts interact.

## Android

This part is still missing, contributions are welcome!
