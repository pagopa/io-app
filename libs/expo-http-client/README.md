# @io-app/expo-http-client

Local [Expo module](https://docs.expo.dev/modules/overview/) providing a custom HTTP client with controllable redirect behaviour, cookie management, and request cancellation. It wraps [Alamofire](https://github.com/Alamofire/Alamofire) on iOS and [Ktor](https://ktor.io/) on Android.

## Motivation

The standard `fetch` API and most React Native networking solutions automatically follow HTTP redirects without giving the caller any control. This library exposes a `followRedirects` flag so you can stop redirect chains mid-flight — useful when a redirect destination carries security-relevant information (e.g. authorization codes appended to a redirect URL) that must be inspected before the client proceeds.

## API

### `nativeRequest(config)`

Sends an HTTP request and returns a `Promise<HttpClientResponse>`.

#### Config

| Field                 | Type                     | Required | Default     | Description                                 |
| --------------------- | ------------------------ | -------- | ----------- | ------------------------------------------- |
| `url`                 | `string`                 | ✅       | —           | Full URL of the request                     |
| `verb`                | `'get' \| 'post'`        | ✅       | —           | HTTP method                                 |
| `headers`             | `Record<string, string>` | —        | `{}`        | Request headers                             |
| `body`                | `Record<string, string>` | —        | —           | Form-encoded body (POST only)               |
| `followRedirects`     | `boolean`                | —        | `true`      | Whether to follow HTTP redirects            |
| `timeoutMilliseconds` | `number`                 | —        | `60000`     | Request timeout in milliseconds             |
| `requestId`           | `string`                 | —        | random UUID | Identifier used to cancel the request later |

#### Response

All outcomes — including network errors — resolve (never reject) the promise with an `HttpClientResponse`:

**Success** — HTTP status code < 400:

```ts
{
  type: "success";
  status: number;
  body: string;
  headers: Record<string, string | undefined>;
}
```

**Failure** — HTTP status code ≥ 400, or a non-HTTP error:

```ts
{
  type: "failure";
  code: number; // HTTP status code, or 900 for non-HTTP errors
  message: string;
  headers: Record<string, string | undefined>;
}
```

Response headers are always normalised to lowercase keys.

##### Non-HTTP error codes

When a network-level failure occurs (not an HTTP error response), the `code` field is set to `900` (`NonHttpErrorCode`) and the `message` field identifies the cause:

| `message`                                          | Cause                                                                        |
| -------------------------------------------------- | ---------------------------------------------------------------------------- |
| `'Timeout'`                                        | Request exceeded `timeoutMilliseconds`                                       |
| `'Cancelled'`                                      | Request was cancelled via `cancelRequestWithId` / `cancelAllRunningRequests` |
| `'TLS Failure'`                                    | SSL/TLS handshake error                                                      |
| `'Serialization Failure'`                          | Response body could not be decoded as UTF-8                                  |
| `Bad configuration, missing 'verb'` / `'url'`      | Missing required field                                                       |
| `Unsupported configuration, unknown verb '<verb>'` | `verb` is neither `get` nor `post`                                           |
| Any other message                                  | Unexpected network or native error                                           |

### `setCookie(domain, path, name, value)`

Injects a cookie into the native HTTP client's cookie storage for the given domain.

```ts
setCookie("https://example.com", "/", "session", "abc123");
```

### `removeAllCookiesForDomain(domain)`

Removes all cookies stored for the given domain.

```ts
removeAllCookiesForDomain("https://example.com");
```

### `cancelRequestWithId(requestId)`

Cancels the in-flight request with the given `requestId`. The corresponding promise resolves with a `failure` response (`code: 900, message: 'Cancelled'`).

```ts
cancelRequestWithId("my-request-id");
```

### `cancelAllRunningRequests()`

Cancels all currently running requests.

```ts
cancelAllRunningRequests();
```

### `deallocate()`

Cancels all running requests and releases native resources (HTTP client instances, cookie storage). Call this when the component or screen that owns the client is unmounted.

```ts
deallocate();
```

## Type guards and helpers

```ts
import {
  isSuccessResponse,
  isFailureResponse,
  isCancelledFailure,
  isTimeoutFailure,
  isTLSFailure,
  isSerializationFailure,
  NonHttpErrorCode
} from "@io-app/expo-http-client";
```

| Helper                      | Description                                    |
| --------------------------- | ---------------------------------------------- |
| `isSuccessResponse(r)`      | `true` when `r.type === 'success'`             |
| `isFailureResponse(r)`      | `true` when `r.type === 'failure'`             |
| `isCancelledFailure(r)`     | `true` when the request was cancelled          |
| `isTimeoutFailure(r)`       | `true` when the request timed out              |
| `isTLSFailure(r)`           | `true` on a TLS/SSL error                      |
| `isSerializationFailure(r)` | `true` when the body could not be deserialized |

## Usage example

```ts
import {
  nativeRequest,
  cancelRequestWithId,
  isSuccessResponse,
  isTimeoutFailure,
  isCancelledFailure
} from "@io-app/expo-http-client";

// Simple GET
const response = await nativeRequest({
  verb: "get",
  url: "https://api.example.com/data",
  headers: { Authorization: "Bearer token" },
  timeoutMilliseconds: 10_000,
  requestId: "fetch-data"
});

if (isSuccessResponse(response)) {
  console.log(response.status, response.body);
} else if (isTimeoutFailure(response)) {
  console.warn("Request timed out");
} else if (isCancelledFailure(response)) {
  console.warn("Request was cancelled");
} else {
  console.error("HTTP error", response.code, response.message);
}

// POST with form-encoded body
const loginResponse = await nativeRequest({
  verb: "post",
  url: "https://auth.example.com/login",
  body: { username: "user", password: "secret" },
  followRedirects: false, // inspect redirect URL manually
  requestId: "login"
});

// Cancel a specific request
cancelRequestWithId("fetch-data");
```

## Testing

```sh
pnpm nx run-many -t oxlint,tsc-noemit,test -p @io-app/expo-http-client
```
