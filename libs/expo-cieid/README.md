# @io-app/expo-cieid

An Expo module to integrate CieID authentication into your app. It provides native module methods to interact with the CieID app on Android and iOS.

This is the monorepo port of `@pagopa/io-react-native-cieid`. It uses Expo Modules API while preserving the exported TypeScript types, synchronous availability check and Android callback API.

## Installation

The package is private and lives in `libs/expo-cieid`. Add it as a workspace dependency of the consuming app (already configured in `main-app`):

```json
{
  "dependencies": {
    "@io-app/expo-cieid": "workspace:*"
  }
}
```

From the monorepo root, install dependencies and update the iOS pods:

```sh
pnpm install
pnpm --filter @io-app/main-app dev-pod-install
```

Expo autolinking registers the native module as `ExpoCieId` on both platforms. Rebuild the native app after installing the package. Expo Go is not supported.

## Usage

### Native Module Methods

:arrow_forward: `isCieIdAvailable` - Check if the CieID app is installed on the device.

#### Android:

Due to Android 11's package visibility restrictions, apps need to declare the packages they intend to query in their `AndroidManifest.xml` within the `<queries>` element. However, this library already includes the necessary package visibility declarations in its own manifest. Thanks to the manifest merging feature of Android, your app automatically inherits these declarations, and you don't need to add them manually.

#### iOS:

To check if the CieID app can be opened via its `URL` scheme, you need to declare the URL scheme in your `Info.plist` file (already configured in `main-app`). The scheme is the same for every environment.

Add the following value to [LSApplicationQueriesSchemes](https://developer.apple.com/documentation/uikit/uiapplication/1622952-canopenurl#discussion) key inside your `Info.plist`:

```xml
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>CIEID</string>
</array>
```

#### Example:

```typescript
import { isCieIdAvailable } from "@io-app/expo-cieid";

// Check if the CieID app is installed (default is production environment)
const isInstalled = isCieIdAvailable();

// Optionally, check for a non-production environment
const isPreprodInstalled = isCieIdAvailable("preprod");
const isCollInstalled = isCieIdAvailable("coll");
```

**Parameters**:

- `environment` _(`CieIdEnvironment`)_: Optional. Default is `'production'`. Selects which package name is checked on `android` devices, and whether the app production signature is passed as second parameter (it is only passed for `'production'`):

| `environment`  | Android package name     | Signature check |
| -------------- | ------------------------ | --------------- |
| `'production'` | `it.ipzs.cieid`          | yes             |
| `'preprod'`    | `it.ipzs.cieid.collaudo` | no              |
| `'coll'`       | `it.ipzs.cieid.coll`     | no              |

**Returns**:

- `boolean`: Returns `true` if the CieID app is installed and, on Android production, its certificate matches the expected signature; `false` otherwise.

<hr/>

:arrow_forward: `openCieIdApp` - Allow you to open the CieID app when needed during the authentication process. It supports callback functions to handle the result of the operation.

#### Example:

```ts
import { openCieIdApp } from "@io-app/expo-cieid";

// Open the CieID app
openCieIdApp("https://your-app.com/auth-callback", result => {
  if (result.id === "URL") {
    console.log("Authentication on CieID succeeded with URL:", result.url);
  } else if (result.id === "ERROR") {
    console.error(
      "Authentication on CieID failed with error code:",
      result.code
    );
  }
});
```

**Parameters**:

- `forwardUrl` _(string)_: The `URL` that the CieID app will use to continue the authentication process.
- `callback` _(function)_: A callback function that receives the result of the operation either success or failure.
- `environment` _(`CieIdEnvironment`)_: Optional. Default is `'production'`. Tells the method which package name to use: `'it.ipzs.cieid'` for `'production'`, `'it.ipzs.cieid.collaudo'` for `'preprod'`, `'it.ipzs.cieid.coll'` for `'coll'`. For every non-production environment the `CieID` app signature is omitted, since it's related to the `'it.ipzs.cieid'` package name only; the calling app is also expected to use the `'xx_servizicie_coll'` service provider IdP id instead of `'xx_servizicie'`.

**Returns**:

- On **success**, the callback will receive an object with the `id` property set to `'URL'` and a `url` property containing the returned `URL`.
- On **failure**, the callback will receive an object with the `id` property set to `'ERROR'` and a `code` property containing one of the error codes from the `CieIdModuleErrorCodes` type.

The function returns `void`. The native Expo implementation resolves a Promise internally, and the TypeScript wrapper forwards its result to the callback. Additional error details may be available in `userInfo`.

#### Android:

This method uses the Android package name to open the CieID app and requires the app's package visibility in the manifest. The method will automatically pick the package name matching the `environment` parameter: `'it.ipzs.cieid'` for `'production'`, `'it.ipzs.cieid.collaudo'` for `'preprod'` and `'it.ipzs.cieid.coll'` for `'coll'`.

Only one authentication can be pending at a time. A concurrent launch receives `CIEID_OPERATION_NOT_SUCCESSFUL` through its callback without replacing the pending operation. Cancellation returns `CIEID_OPERATION_CANCEL`.

#### iOS:

:warning: This method is not available on iOS. Use `Linking.openURL` to open the CieID app on iOS.

In case you need to open the CieID app on iOS, you can use the following code:

```ts
import { Linking } from "react-native";

Linking.openURL(urlForCieId).catch(err => {
  console.error("---- --> (App CieID not installed?) An error occurred", err);
});
```

Be aware to subscribe to the `url` event in your app to handle the CieID app callback coming from the deep linking.

```ts
import { Linking } from "react-native";

Linking.addEventListener("url", event => {
  console.log(event.url);
});
```

The host app must register its callback URL scheme and forward incoming URLs to React Native Linking. This is already configured in `main-app`. For a host app with an Objective-C `AppDelegate.m`, the forwarding code is:

```objc
// https://reactnative.dev/docs/linking#open-links-and-deep-links-universal-links
- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}
```

Remove the Linking event subscription when the screen unmounts, as shown below. If a redirect can launch the app from a terminated state, handle `Linking.getInitialURL()` as well.

The authentication and wallet identification features in `main-app` contain complete integrations on both platforms. The following excerpt is retained from the original package's sample app; its state, WebView and navigation helpers belong to the consuming screen. Import `openCieIdApp` from `@io-app/expo-cieid`.

#### Example:

```ts
[...]

  React.useEffect(() => {
    // https://reactnative.dev/docs/linking#open-links-and-deep-links-universal-links
    const urlListenerSubscription = Linking.addEventListener(
      'url',
      ({ url }) => {
        console.log('-- -->URL from Deep Liking', url);
        // if the url is of this format: iologincie:https://idserver.servizicie.interno.gov.it/idp/login/livello2mobile?value=e1s2
        // extract the part after iologincie: and dispatch the action to handle the login
        if (url.startsWith('iologincie:')) {
          const continueUrl = url.split('iologincie:')[1];

          if (continueUrl) {
            console.log('-- --> iOS continue URL', continueUrl);
            // https://idserver.servizicie.interno.gov.it/cieiderror?cieid_error_message=Operazione_annullata_dall'utente
            // We check if the continueUrl is an error
            if (continueUrl.indexOf('cieiderror') !== -1) {
              // And we extract the error message and show it in an alert
              const errorMessage = continueUrl.split('cieid_error_message=')[1];
              Alert.alert('Login error ❌', errorMessage ?? 'error');
            } else {
              setAuthenticatedUrl(continueUrl);
            }
          }
        }
      }
    );

    return () => urlListenerSubscription.remove();
  }, []);

[...]

  const handleOnShouldStartLoadWithRequest = (
    event: WebViewNavigation
  ): boolean => {
    const url = event.url;
    console.log('--> url', url);

    if (url.indexOf('token=') !== -1) {
      console.log('-^^- --> Login token found', url);
      const token = url.split('token=')[1];
      if (token) {
        console.log('-^^- --> Login token extracted', token);
        // show success alert with dismiss button navigatin back
        Alert.alert('Login success ✅🥳', token, [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      }
      return false;
    }

    if (
      url.indexOf('livello1') >= 0 || // SpidL1
      (url.indexOf('livello2') >= 0 && url.indexOf('livello2mobile') === -1) || // SpidL2
      url.indexOf('nextUrl') >= 0 || // SpidL3 iOS
      url.indexOf('openApp') >= 0 // SpidL3 Android
    ) {
      console.log('SPID URL found: ', url);
      if (Platform.OS === 'ios') {
        const urlForCieId = `CIEID://${url}&sourceApp=iologincie`;
        console.log('---- --> iOS forward URL: ', url, urlForCieId);
        Linking.openURL(urlForCieId).catch((err) => {
          console.error(
            '---- --> (App CieID not installed?) An error occurred',
            err
          );
          navigation.goBack();
        });
      } else {
        openCieIdApp(
          url,
          (result) => {
            if (result.id === 'ERROR') {
              console.error('^--^ -->', JSON.stringify(result, null, 2));
              navigation.goBack();
            } else {
              console.log('^--^ -->', result.id, result.url);
              setAuthenticatedUrl(result.url);
            }
          },
          environment
        );
      }
      return false;
    }
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webView}
        startInLoadingState={true}
        userAgent={defaultUserAgent}
        javaScriptEnabled={true}
        originWhitelist={originSchemasWhiteList}
        onShouldStartLoadWithRequest={handleOnShouldStartLoadWithRequest}
        source={
          { uri: authenticatedUrl ?? filledServiceProviderUrl } as WebViewSource
        }
      />
    </SafeAreaView>
  );

[...]
```

Testing the CieID login process with the same account can invalidate your existing session on App IO.

## Development

From the monorepo root:

```sh
pnpm nx test @io-app/expo-cieid
pnpm nx tsc-noemit @io-app/expo-cieid
pnpm nx lint @io-app/expo-cieid
```

On a device, verify availability with and without CieID installed, successful authentication, cancellation, and all supported environments. The production certificate check requires the official production application.
