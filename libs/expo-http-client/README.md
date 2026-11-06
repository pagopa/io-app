# @io-app/expo-http-client

Local [Expo module](https://docs.expo.dev/modules/overview/) that exposes a native HTTP client with controllable redirects, an in-memory cookie storage and request cancellation. It wraps [Alamofire](https://github.com/Alamofire/Alamofire) on iOS and [Ktor](https://ktor.io/) on Android.

It is used by the FIMS single sign-on flow, which needs to stop redirect chains and inspect each hop.

## Platforms

| Platform | Implementation                                  | Requirements           |
| -------- | ----------------------------------------------- | ---------------------- |
| iOS      | Swift, Alamofire `5.11.2` via Swift Package Mgr | iOS 15.1               |
| Android  | Kotlin, Ktor `3.2.3` (Android engine)           | `INTERNET` permission¹ |

¹ Declared in the module `AndroidManifest.xml`, merged into the app.

On any other platform the native module is not loaded: `nativeRequest` rejects and the other functions throw an `Error`.

## API

```ts
import {
  cancelAllRunningRequests,
  cancelRequestWithId,
  deallocate,
  nativeRequest,
  removeAllCookiesForDomain,
  setCookie
} from "@io-app/expo-http-client";
```

| Function                               | Description                                                                                              |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `nativeRequest(config)`                | Sends a request, see below.                                                                              |
| `setCookie(domain, path, name, value)` | Adds a cookie to the native cookie storage. `domain` is a URL such as `https://example.com`.             |
| `removeAllCookiesForDomain(domain)`    | Removes the cookies stored for `domain`.                                                                 |
| `cancelRequestWithId(requestId)`       | Cancels a running request: its promise resolves with a `Cancelled` failure.                              |
| `cancelAllRunningRequests()`           | Cancels every running request.                                                                           |
| `deallocate()`                         | Cancels every running request. On Android it also closes the Ktor clients and clears the cookie storage. |

### `nativeRequest(config)`

| Field                 | Type                     | Required | Default     | Notes                                          |
| --------------------- | ------------------------ | -------- | ----------- | ---------------------------------------------- |
| `verb`                | `"get" \| "post"`        | ✅       | —           |                                                |
| `url`                 | `string`                 | ✅       | —           |                                                |
| `headers`             | `Record<string, string>` | —        | `{}`        |                                                |
| `body`                | `Record<string, string>` | —        | —           | POST only, `application/x-www-form-urlencoded` |
| `followRedirects`     | `boolean`                | —        | `true`      |                                                |
| `timeoutMilliseconds` | `number`                 | —        | `60000`     |                                                |
| `requestId`           | `string`                 | —        | random UUID | Used by `cancelRequestWithId`                  |

The promise **always resolves** with an `HttpClientResponse`, whose `headers` keys are lowercase:

- `{ type: "success", status, body, headers }` for HTTP status `< 400`;
- `{ type: "failure", code, message, headers }` for HTTP status `>= 400`, or for non-HTTP errors with `code: 900` (`NonHttpErrorCode`).

| Non-HTTP `message`                                 | Cause                                | Guard                    |
| -------------------------------------------------- | ------------------------------------ | ------------------------ |
| `Timeout`                                          | `timeoutMilliseconds` elapsed        | `isTimeoutFailure`       |
| `Cancelled`                                        | `cancelRequestWithId` / `cancelAll…` | `isCancelledFailure`     |
| `TLS Failure`                                      | TLS handshake failed                 | `isTLSFailure`           |
| `Serialization Failure`                            | Body is not valid UTF-8              | `isSerializationFailure` |
| `Bad configuration, missing 'verb'` / `'url'`      | Missing required field               | —                        |
| `Unsupported configuration, unknown verb '<verb>'` | `verb` is neither `get` nor `post`   | —                        |
| Any other message                                  | Unexpected network or native error   | —                        |

`isSuccessResponse` and `isFailureResponse` narrow the response type.

All native functions are async and share the same serial queue, so they run in call order, as in the original TurboModule: a cancel issued right after a request always finds it registered, and a cookie set right after `deallocate` is sent by the next request. Apart from `nativeRequest`, the wrappers stay synchronous (`void`), as in the original library.

## Testing

`mocks/ExpoHttpClient.ts` mocks the native module, as described in [Mocking native calls](https://docs.expo.dev/modules/mocking/). The main app does not use the `jest-expo` preset, so `apps/main-app/jestSetup.js` mocks `src/ExpoHttpClientModule` inline with `jest.fn`: type guards and wrappers run their real code.

```sh
pnpm nx run-many -t oxlint,tsc-noemit,test -p @io-app/expo-http-client
```
