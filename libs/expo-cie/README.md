# @io-app/expo-cie

Private Expo module for CIE (Electronic Identity Card) NFC operations in the IO app. It is maintained in this monorepo and consumed by `@io-app/main-app` through a pnpm workspace dependency.

## Table of Contents

- [Monorepo Setup](#monorepo-setup)
- [Native Requirements](#native-requirements)
- [API](#api)
- [Usage](#usage)
  - [Check NFC Status](#check-nfc-status)
  - [Logs](#logs)
  - [Reading CIE Data](#reading-cie-data)
    - [Reading Attributes](#reading-attributes)
    - [Authentication](#authentication)
  - [Event System](#event-system)
    - [Event Listeners](#event-listeners)
    - [Example Usage](#example-usage)
    - [NFC read events](#nfc-read-events)
    - [NFC error events](#nfc-error-events)
  - [Alert Messages](#alert-messages)
    - [Available Alert Messages](#available-alert-messages)
- [NFC Events](#nfc-events)
  - [iOS](#ios)
  - [Android](#android)
- [NFC Errors](#nfc-errors)
  - [iOS](#ios-1)
  - [Android](#android-1)
- [Types](#types)
- [Errors](#errors)
- [Contributing](#contributing)
- [License](#license)

## Monorepo Setup

The main app declares `@io-app/expo-cie` as a workspace dependency. Install dependencies from the repository root with `pnpm install`; Expo Autolinking discovers the Android and Apple modules from `expo-module.config.json`.

After changing native module code or configuration, regenerate iOS pods from the app's iOS directory:

```sh
cd apps/main-app/ios && bundle exec pod install
```

The module requires a native app build and is not available in Expo Go.

## Native Requirements

### Android

The consuming Android app must declare NFC and internet access in its manifest. The main app already declares these permissions. See the [Android NFC documentation](https://developer.android.com/develop/connectivity/nfc/nfc).

```xml
  <!-- Required to access NFC hardware -->
  <uses-permission android:name="android.permission.NFC" />
  <!-- Required for authentication process -->
  <uses-permission android:name="android.permission.INTERNET" />
```

### iOS

1. Enable the Near Field Communication Tag Reading capability for the app target.
2. Add `NFCReaderUsageDescription` to the app's `Info.plist`:
   ```xml
   <key>NFCReaderUsageDescription</key>
   <string>We need to use NFC</string>
   ```

See Apple's [NFCReaderUsageDescription documentation](https://developer.apple.com/documentation/bundleresources/information-property-list/nfcreaderusagedescription). 3. Add the required ISO7816 identifiers to the app's `Info.plist`. The identifier order is significant:

```xml
<key>com.apple.developer.nfc.readersession.iso7816.select-identifiers</key>
<array>
	<string>A0000002471001</string>
	<string>A0000000308000000009816001</string>
	<string>A00000000039</string>
	<string>A0000002472001</string>
	<string>00000000000000</string>
</array>
```

See Apple's [NFCISO7816Tag documentation](https://developer.apple.com/documentation/corenfc/nfciso7816tag).

## API

List of available functions

| Function                                                                                                             | Return             | Description                                                                    |
| :------------------------------------------------------------------------------------------------------------------- | :----------------- | :----------------------------------------------------------------------------- |
| `hasNFCFeature()`                                                                                                    | `Promise<boolean>` | (Android) Checks if the device supports NFC feature                            |
| `isNfcEnabled()`                                                                                                     | `Promise<boolean>` | (Android) Checks if the NFC is currently enabled                               |
| `isCieAuthenticationSupported()`                                                                                     | `Promise<boolean>` | (Android) Checks if the device supports CIE autentication                      |
| `openNfcSettings()`                                                                                                  | `Promise<void>`    | (Android) Opens NFC system settings page                                       |
| `addListener(event: CieEvent, listener: CieEventHandlers)`                                                           | `() => void`       | Adds a NFC event listener and returns a function to unsubscribe from the event |
| `removeListener(event: CieEvent)`                                                                                    | `void`             | Removes all listeners for the specified event                                  |
| `removeAllListeners()`                                                                                               | `void`             | Removes all registered listeners                                               |
| `setCustomIdpUrl(url?: string)`                                                                                      | `void`             | Updates IDP url, if `undefined` will use the default IDP url                   |
| `setAlertMessage(key: AlertMessageKey, value: string)`                                                               | `void`             | (iOS) Updates iOS NFC modal alert message                                      |
| `setCurrentAlertMessage(value: string)`                                                                              | `void`             | (iOS) Updates currently displayed iOS NFC modal alert message                  |
| `startInternalAuthentication(challenge: string, resultEncoding?: ResultEncoding, timeout?: number)`                  | `Promise<void>`    | Start the CIE IAS/NIS Internal Authentication                                  |
| `startMRTDReading(can: string, resultEncoding?: ResultEncoding, timeout?: number)`                                   | `Promise<void>`    | Start PACE MRTD reading (reads MRTD data using CAN)                            |
| `startInternalAuthAndMRTDReading(can: string, challenge: string, resultEncoding?: ResultEncoding, timeout?: number)` | `Promise<void>`    | Start combined Internal Authentication + PACE MRTD reading                     |
| `startReadingAttributes(timeout: number)`                                                                            | `Promise<void>`    | Start the CIE attributes reading process                                       |
| `startReading(pin: string, authenticationUrl: string, timeout: number)`                                              | `Promise<void>`    | Start the CIE reading process fro authentication                               |
| `stopReading()`                                                                                                      | `Promise<void>`    | (Android) Stops all reading process                                            |
| `setLogMode(mode: LogMode)`                                                                                          | `void`             | (iOS) Sets the log mode for the CIE SDK                                        |
| `getLogsFilePath()`                                                                                                  | `Promise<string>`  | (iOS) Returns file path of CIE SDK logs                                        |
| `getLogs()`                                                                                                          | `Promise<string>`  | (iOS) Returns content of CIE SDK logs                                          |

## Usage

The package is split into three modules:

- [CieUtils](/src/utils): Provides functions to check the NFC status of the device.
- [CieManager](/src/manager): Provides CIE read and authentication capabilities.
- [CieLogger](/src/logger): Provides logging utils

### Check NFC Status

**Note:** These methods are applicable only for Android devices, as iOS devices always have NFC available.

```typescript
import { CieUtils } from "@pagopa/io-react-native-cie";

// Check if the device has NFC
await CieUtils.hasNfcFeature();
// Check if NFC is enabled
await CieUtils.isNfcEnabled();
// Convenient method to check if CIE authentication is supported
await CieUtils.isCieAuthenticationSupported();
```

### Logs

**Note:** Logging is only supported on iOS. On Android, these methods will throw an error.

```typescript
import { CieLogger } from "@pagopa/io-react-native-cie";

// Enable logging to local file
CieLogger.setLogMode("localFile");

// Enable logging to console
CieLogger.setLogMode("console");

// Disable logging
CieLogger.setLogMode("disabled");

// Get logs file path
const path = await CieLogger.getLogsFilePath();

// Get logs content
const logs = await CieLogger.getLogs();
```

### Reading CIE Data

#### Internal Authentication

Start the CIE Internal Authentication

```typescript
import { CieManager } from "@pagopa/io-react-native-cie";

CieManager.startInternalAuthentication("challenge")
  .then(() => console.log("Reading started"))
  .catch(error => console.error("Error:", error));
```

#### Reading Attributes

Read CIE attributes (card type and base64-encoded data) with optional timeout (Android only)

```typescript
import { CieManager } from "@pagopa/io-react-native-cie";

CieManager.startReadingAttributes()
  .then(() => console.log("Reading started"))
  .catch(error => console.error("Error:", error));
```

#### Authentication

Start the CIE authentication process:

```typescript
CieManager.startReading("12345678", "https//auth-url.it")
  .then(() => console.log("Authentication started"))
  .catch(error => console.error("Error:", error));
```

### Event System

The library uses an event-driven approach for NFC operations and read results. Events are emitted to notify your application about progress, success, or failure. Each listener method returns a cleanup function that should be called when the operation is complete or when your component unmounts.

#### Available events

| Listener Type        | Description                                                                           |
| -------------------- | ------------------------------------------------------------------------------------- |
| `onEvent`            | NFC events emitted during the reading process which indicates the reading progression |
| `onError`            | NFC error events emitted if the reading process fails                                 |
| `onSuccess`          | Authentication success event                                                          |
| `onAttributeSuccess` | Successful attribute reads                                                            |

#### Listening for events

You can register an event listiner with CieManager.addListener and remove it with the returned unregister function or by using CieManager.removeListener

```typescript
const unsubscribe = CieManager.addListener('onEvent', (event) => {
  console.log(event);
});

// remove the listener with
unsubscribe()
// or
CieManager.removeListener("onEvent);
```

#### Example Usage

```typescript
import { CieManager } from "@pagopa/io-react-native-cie";
import { useEffect } from "react";

// ...

useEffect(() => {
  // Register all event listeners
  const cleanup = [
    CieManager.addListener("onEvent", event => {
      console.info("NFC Event", event);
    }),
    CieManager.addListener("onError", error => {
      console.error("NFC Error", error);
    }),
    CieManager.addListener("onSuccess", url => {
      console.log("Auth url:", url);
    })
  ];

  // Cleanup all listeners on unmount
  return () => cleanup.forEach(remove => remove());
}, []);
```

To remove all listeners at once:

```typescript
CieManager.removeAllListeners();
```

#### NFC read events

List of events that are emitted during CIE reading process. Event names may differs based on the platform

<details>
  <summary>iOS</summary>

| Event                       | Description                                                |
| --------------------------- | ---------------------------------------------------------- |
| ON_TAG_DISCOVERED           | Tag has been discovered                                    |
| ON_TAG_DISCOVERED_NOT_CIE   | Discovered tag is not a CIE                                |
| CONNECTED                   | Connected to tag                                           |
| GET_SERVICE_ID              | Get CIE serviceId                                          |
| SELECT_IAS                  | Select IAS Application                                     |
| SELECT_CIE                  | Select CIE Application                                     |
| DH_INIT_GET_G               | Get DiffieHellman G parameter                              |
| DH_INIT_GET_P               | Get DiffieHellman P parameter                              |
| DH_INIT_GET_Q               | Get DiffieHellman Q parameter                              |
| READ_CHIP_PUBLIC_KEY        | Retrive internal authentication key                        |
| SELECT_FOR_READ_FILE        | Select file                                                |
| READ_FILE                   | Read file                                                  |
| GET_D_H_EXTERNAL_PARAMETERS | Retrive Diffie Hellman external authenticationl parameters |
| SET_D_H_PUBLIC_KEY          | Set Diffie Hellman internal key                            |
| GET_ICC_PUBLIC_KEY          | Retrive ICC Public Key                                     |
| CHIP_SET_KEY                | Select key for certificate validation                      |
| CHIP_VERIFY_CERTIFICATE     | Certificate validation                                     |
| CHIP_SET_CAR                | Select key for external authentication                     |
| CHIP_GET_CHALLENGE          | Get challenge for external authentication                  |
| CHIP_ANSWER_CHALLENGE       | Responds to challenge for external authentication          |
| SELECT_KEY                  | Select key                                                 |
| VERIFY_PIN                  | Verify CIE Pin                                             |
| SIGN                        | Sign data                                                  |
| READ_CERTIFICATE            | Read CIE User Certificate                                  |
| SELECT_ROOT                 | Select Root Application                                    |

</details>

<details>

  <summary>Android</summary>

| Event                         | Description                                            |
| ----------------------------- | ------------------------------------------------------ |
| ON_TAG_DISCOVERED             | Tag has been discovered                                |
| ON_TAG_DISCOVERED_NOT_CIE     | Discovered tag is not a CIE                            |
| CONNECTED                     | Connected to tag                                       |
| SELECT_IAS_SERVICE_ID         | Selects internal authentication service for service ID |
| SELECT_CIE_SERVICE_ID         | Selects CIE service ID                                 |
| SELECT_READ_FILE_SERVICE_ID   | Selects read file service ID                           |
| READ_FILE_SERVICE_ID_RESPONSE | Reads file service ID response                         |
| SELECT_IAS                    | Selects internal authentication service                |
| SELECT_CIE                    | Selects CIE application                                |
| DH_INIT_GET_G                 | Gets G for Diffie-Hellman initialization               |
| DH_INIT_GET_P                 | Gets P for Diffie-Hellman initialization               |
| DH_INIT_GET_Q                 | Gets Q for Diffie-Hellman initialization               |
| SELECT_FOR_READ_FILE          | Selects for reading a file                             |
| READ_FILE                     | Reads a file                                           |
| INIT_EXTERNAL_AUTHENTICATION  | Initializes external authentication                    |
| SET_MSE                       | Sets MSE                                               |
| D_H_KEY_EXCHANGE_GET_DATA     | Exchanges Diffie-Hellman data                          |
| SIGN1_SELECT                  | Selects SIGN1 message                                  |
| SIGN1_VERIFY_CERT             | Verifies SIGN1 certificate                             |
| SET_CHALLENGE_RESPONSE        | Sets challenge response                                |
| GET_CHALLENGE_RESPONSE        | Gets challenge response                                |
| EXTERNAL_AUTHENTICATION       | Performs external authentication                       |
| INTERNAL_AUTHENTICATION       | Performs internal authentication                       |
| GIVE_RANDOM                   | Provides random data                                   |
| VERIFY_PIN                    | Verifies PIN                                           |
| READ_FILE_SM                  | Reads file with secure messaging                       |
| SIGN                          | Signs data                                             |
| SIGN_WITH_CIPHER              | Signs with cipher                                      |
| SELECT_ROOT                   | Selects root                                           |

</details>

#### NFC error events

List of error event that may be emitted during CIE reading process

| Error                  | Description                            |
| ---------------------- | -------------------------------------- |
| NOT_A_CIE              | Discovered tag is not a CIE            |
| TAG_LOST               | Tag was lost during read operation     |
| CANCELLED_BY_USER      | (iOS only) Read was cancelled by user  |
| APDU_ERROR             | Protocol error or not supported        |
| CARD_BLOCKED           | Too many PIN attempts, card is blocked |
| WRONG_PIN              | Wrong PIN                              |
| WRONG_CAN              | Wrong CAN                              |
| NO_INTERNET_CONNECTION | Missing internet connection            |
| CERTIFICATE_EXPIRED    | CIE expired                            |
| CERTIFICATE_REVOKED    | CIE revoked                            |
| AUTHENTICATION_ERROR   | unable to complete authentication      |
| GENERIC_ERROR          | Unmapped or unexpected error           |

### Alert Messages

**Note:** This feature is iOS-only; Android does not support alert messages.

<img src="https://github.com/user-attachments/assets/eaebf481-f5db-476e-977e-25653606ab8f" width="200" />
<img src="https://github.com/user-attachments/assets/dc7c5a81-954e-43dc-a468-6a2c17620eb1" width="200" />
<img src="https://github.com/user-attachments/assets/f473b67f-c5a5-4954-9e85-f2b414db53f2" width="200" />

Customize the NFC dialog messages using `CieManager.setAlertMessage(key, value)`:

```typescript
CieManager.setAlertMessage(
  "readingInstructions",
  "Hold your iPhone near your CIE card to begin scanning."
);
```

You can update the currently displayed alert message (for example, during the reading process) using `CieManager.setCurrentAlertMessage(value)`:

```typescript
CieManager.setCurrentAlertMessage("Reading in progress, 80% completed");
```

#### Available Alert Messages

| Key                    | Description              | Default Message                                                                                   |
| ---------------------- | ------------------------ | ------------------------------------------------------------------------------------------------- |
| `readingInstructions`  | Pre-scan instructions    | "Tieni la tua carta d'identità elettronica sul retro dell'iPhone, nella parte in alto."           |
| `moreTags`             | Multiple tags detected   | "Sono stati individuate più carte NFC. Per favore avvicina una carta alla volta."                 |
| `readingInProgress`    | Reading status           | "Lettura in corso, tieni ferma la carta ancora per qualche secondo..."                            |
| `readingSuccess`       | Success message          | "Lettura avvenuta con successo. Puoi rimuovere la carta mentre completiamo la verifica dei dati." |
| `invalidCard`          | Invalid card error       | "La carta utilizzata non sembra essere una Carta di Identità Elettronica (CIE)."                  |
| `tagLost`              | Card removed error       | "Hai rimosso la carta troppo presto."                                                             |
| `cardLocked`           | Card locked error        | "Carta CIE bloccata"                                                                              |
| `wrongPin1AttemptLeft` | PIN warning (1 attempt)  | "PIN errato, hai ancora 1 tentativo"                                                              |
| `wrongPin2AttemptLeft` | PIN warning (2 attempts) | "PIN errato, hai ancora 2 tentativi"                                                              |
| `genericError`         | Generic error            | "Qualcosa è andato storto"                                                                        |
| `wrongCan`             | CAN warning              | "CAN errato"                                                                                      |

## Types

```typescript
type CieAttributes = {
  type: string;
  base64: string;
};
```

Contains the CIE type (NFC manufacturer) and the attributres in base64 encoded string format.
CIE type can be one of the following: `NXP`, `GEMALTO`, `GEMALTO_2`, `ACTALIS`, `ST`, `UNKNOWN`

```typescript
type NfcEvent = {
  name: string;
  progress: number;
};
```

Event sent during the CIE reading process. Contains the name of the event and the progress associated. Event names and order may vary based on the platform.

```typescript
type NfcError = {
  name: NfcErrorName;
  message?: string;
};
```

Error event that may be sent during the CIE reading process. Contains the name of the error and an optional message. Error names and order may vary based on the platform.

```typescript
type InternalAuthResponse = {
  nis: string,
  publicKey: string,
  sod: string,
  signedChallenge: string,
});
```

Represent the CIE response coming from NIS Internal Auth.
All string value are Hex, Base64 or Base64 url encoded

```typescript
type MrtdResponse = {
  dg1: string,
  dg11: string,
  sod: string,
});
```

Represent the CIE response coming from MRTD with PACE reading
All string value are Hex, Base64 or Base64 url encoded.

```typescript
type InternalAuthAndMrtdResponse = {
  nis_data: {
    nis: string,
    publicKey: string,
    sod: string,
    signedChallenge: string,
  },
  mrtd_data: {
    dg1: string,
    dg11: string,
    sod: string,
  },
});
```

Represent the CIE response coming from NIS Internal Auth and MRTD with PACE reading during the same NFC session.
All string value are Hex, Base64 or Base64 url encoded.

```typescript
type ResultEncoding = "hex" | "base64" | "base64url";
```

Supported types of encoding for Internal Auth and Mrtd reponse payloads.

```typescript
type LogMode = "localFile" | "console" | "disabled";
```

Log mode for the CIE SDK:

- `localFile`: Logs saved to device for later retrieval
- `console`: Logs output to console for real-time monitoring
- `disabled`: Disables all logging

```typescript
type CertificateData = {
  name?: string;
  surname?: string;
  fiscalCode?: string;
  docSerialNumber?: string;
};
```

Contains CIE certificate data read from the card.

## Errors

The CIE reading function may throw exceptions if the reading process cannot be initiated. These exceptions indicate issues with input validation or system compatibility.
Below is a comprehensive list of possible exceptions that may be thrown during initialization:

| Error Code            | Platform    | Description                       |
| --------------------- | ----------- | --------------------------------- |
| `PIN_REGEX_NOT_VALID` | iOS/Android | Invalid PIN format                |
| `INVALID_AUTH_URL`    | iOS/Android | Invalid auth url format           |
| `THREADING_ERROR`     | iOS         | Unexpected error                  |
| `UNSUPPORTED`         | Android     | Feature not supported on platform |
| `UNKNOWN_EXCEPTION`   | iOS/Android | Unexpected error                  |

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
