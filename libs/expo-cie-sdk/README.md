<p align="center">
  <img src="https://raw.githubusercontent.com/pagopa/io-app/master/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png" width="100"/></br>
  IO - The public services app
</p>

- [Italiano](#italiano)
- [English](#english)

# Italiano

Questo package contiene il porting a Expo Modules di `pagopa/io-cie-sdk`, eseguito dal team di <a href="https://github.com/pagopa/io-app">IO</a>, dell'SDK sviluppato da IPZS (<a href="https://docs.italia.it/italia/cie/cie-manuale-tecnico-docs/it/master/cieIDSDK.html">disponibile qui</a>). Il README originale italiano/inglese è mantenuto e aggiornato per l'integrazione nel monorepo.
<br />

## Installazione

Il modulo si trova in `libs/expo-cie-sdk`, con nome package `@io-app/expo-cie-sdk`. L'app lo usa tramite dipendenza workspace:

```json
"@io-app/expo-cie-sdk": "workspace:*"
```

Eseguire `pnpm install` dalla root. Expo Modules autolinking registra il modulo nativo `ExpoCieSdk` su Android e iOS: non sono necessari linking Gradle manuale, `CiePackage` o configurazione React Native legacy. Richiede un'app nativa con Expo Modules Core; non è disponibile in Expo Go.

La login con CIE può essere effettuata esclusivamente tramite tecnologia NFC su device reale. Il framework originale `ios/iociesdkios.framework` contiene solo il binario iOS device arm64 e viene incluso nel monorepo senza modifiche.

Per installare i pod per un device reale, dalla cartella `apps/main-app`:

```bash
pnpm cie-ios prod
```

Per lo sviluppo su simulatore:

```bash
pnpm cie-ios dev
```

Il comando dev esegue `pod install` con `NO_INTERNAL_MODULE=1`: il modulo Expo rimane registrato, ma non collega il framework originale. I controlli NFC restituiscono `false` e l'avvio rifiuta la Promise. Non rinominare cartelle o podspec. Quando si cambia modalità è necessario reinstallare i pod; `pnpm cie-ios ci` verifica solamente la presenza dei sorgenti. Questi comandi non avviano build.

L'app host deve mantenere gli entitlement NFC, `NFCReaderUsageDescription` e gli identificativi ISO7816 già configurati per CIE.

## Compatibilità

Non tutti i device sono compatibili con la login tramite CIE. La libreria espone dei metodi per sapere se il dispositivo è compatibile oppure no

### Android

Su Android, è necessario verificare la presenza dell'NFC, oltre che della versione minima dell'API (>= 23).
<br />
Recentemente, è stato scoperto che alcuni vendors disabilitano la funzionalità <strong>software extended APDU</strong>, rendendo impossibile la lettura/scrittura tramite NFC. <br />
Purtroppo, non è possibile determinare a priori questa possibilità, ma può essere gestito l'errore ritornato dall'SDK in fase di lettura.

### iOS

L'SDK originale richiede iOS >= 13; il modulo Expo segue il minimo iOS del monorepo (15.1). Verificare sempre `hasNFCFeature()` sul device: versione del sistema operativo e presenza hardware non sono equivalenti. Il simulatore e la modalità `NO_INTERNAL_MODULE=1` non supportano l'autenticazione.

## Utilizzo

Per effettuare l'autenticazione tramite CIE, sono necessari tre componenti:

- un URI di Autenticazione;
- il PIN della CIE;
- la carta da leggere;

Il recupero di queste tre componenti non dipendono dall'SDK.
<br />
Per utilizzare l'SDK, è necessario importarlo

```ts
import cieManager from "@io-app/expo-cie-sdk";
```

Una volta importato, è possibile accedere a tutti i suoi metodi.

## API

Di seguito sono elencate alcune delle funzionalità presenti. <br />
Il gestore TypeScript è in [index.ts](./index.ts) e i tipi degli eventi in [types.ts](./types.ts). I callback e i nomi degli eventi restano compatibili con il package originale. Le operazioni asincrone ora usano Promise native Expo, senza callback del bridge React Native.

| Function                                                                    | Return             | Descrizione                                                  |
| :-------------------------------------------------------------------------- | :----------------- | :----------------------------------------------------------- |
| `hasApiLevelSupport()`                                                      | `Promise<boolean>` | (Android) Verifica se l'OS supporta l'autenticazione con CIE |
| `hasNFCFeature()`                                                           | `Promise<boolean>` | Verifica se il device ha l'NFC                               |
| `setPin(pin: string)`                                                       | `Promise<void>`    | Set del PIN della CIE                                        |
| `setAuthenticationUrl(url: string)`                                         | `void`             | Set dell'Url di Autenticazione                               |
| `start(alertMessagesConfig?: Partial<Record<iOSAlertMessageKeys, string>>)` | `Promise<void>`    | Avvia l'utilizzo dell'SDK                                    |
| `startListeningNFC()`                                                       | `Promise<void>`    | (Android) Avvia la lettura dell'NFC                          |
| `stopListeningNFC()`                                                        | `Promise<void>`    | (Android) Stoppa la lettura dell'NFC                         |
| `openNFCSettings()`                                                         | `Promise<void>`    | (Android) Apre le impostazioni dell'OS per l'NFC             |
| `onEvent(callback: (event: Event) => void)`                                 | `void`             | Callback eseguita ad ogni evento di lettura/scrittura        |
| `onError(callback: (error: Error) => void)`                                 | `void`             | Callback eseguita ad ogni errore di lettura/scrittura        |
| `onSuccess(callback: (url: string) => void)`                                | `void`             | Callback eseguita in caso di success                         |

## Possibili eventi

Durante la lettura dell'NFC, i possibili errori sono i seguenti

| Error code                    | Descrizione                                                            |
| :---------------------------- | :--------------------------------------------------------------------- |
| `ON_TAG_DISCOVERED_NOT_CIE`   | (Android) La carta letta non è una CIE                                 |
| `TAG_ERROR_NFC_NOT_SUPPORTED` | (iOS) La carta letta non è una CIE                                     |
| `ON_TAG_DISCOVERED`           | E' stato riconosciuto un tag                                           |
| `ON_TAG_LOST`                 | Tag rimosso / allontanato                                              |
| `ON_CARD_PIN_LOCKED`          | (Android) Troppi inserimenti errati del PIN. La Card CIE è bloccata    |
| `PIN Locked`                  | (iOS) Troppi inserimenti errati del PIN. La Card CIE è bloccata        |
| `ON_PIN_ERROR`                | Pin errato. L'evento restituisce anche il numero di tentativi rimasti  |
| `PIN_INPUT_ERROR`             | Il PIN ha un formato errato (8 cifre numeriche)                        |
| `CERTIFICATE_EXPIRED`         | La CIE è scaduta                                                       |
| `CERTIFICATE_REVOKED`         | La CIE è stata revocata                                                |
| `AUTHENTICATION_ERROR`        | Errore di autenticazione con il server del Ministero                   |
| `ON_NO_INTERNET_CONNECTION`   | Nessuna connesione ad Internet                                         |
| `STOP_NFC_ERROR`              | Errore durante lo stop della lettura NFC                               |
| `START_NFC_ERROR`             | Errore durante lo start della lettura NFC                              |
| `EXTENDED_APDU_NOT_SUPPORTED` | Il dispositivo non supporta una caratteristica della lettura della CIE |
| `Transmission Error`          | (iOS) Errore durante la trasmissione NFC                               |

# English

This package ports `pagopa/io-cie-sdk` to Expo Modules for <a href="https://docs.italia.it/italia/cie/cie-manuale-tecnico-docs/it/master/cieIDSDK.html">CIE integration</a>, maintained by <a href="https://github.com/pagopa/io-app">IO</a>. This is the original bilingual README, updated for the monorepo integration.
<br />

## Installation

The package lives in `libs/expo-cie-sdk` and the app depends on it through the workspace:

```json
"@io-app/expo-cie-sdk": "workspace:*"
```

Run `pnpm install` at the repository root. Expo Modules autolinking registers `ExpoCieSdk` on Android and iOS. Manual Gradle linking, `CiePackage` registration and the legacy React Native configuration are no longer needed. A native app with Expo Modules Core is required; Expo Go is not supported.

CIE authentication requires NFC hardware on a physical device. The unchanged original `ios/iociesdkios.framework` only includes an arm64 iOS device binary.

**Physical device pod installation**, from `apps/main-app`:

```bash
pnpm cie-ios prod
```

**Simulator development**:

```bash
pnpm cie-ios dev
```

The dev command installs pods with `NO_INTERNAL_MODULE=1`: the Expo module remains registered without linking the original framework. NFC capability checks return `false` and starting authentication rejects the Promise. Do not rename directories or podspecs. Reinstall pods when switching modes. `pnpm cie-ios ci` only checks that sources are present. These commands do not build the app.

The host app must retain its NFC entitlements, `NFCReaderUsageDescription` and CIE ISO7816 identifiers.

## Compatibility

Note that not all the devices can allow the CIE login. This library provides you the methods to check that.

### Android

On Android, is mandatory to check if the device has the NFC feature and the minimum version for the API (>= 23).
<br />
Recently, it was discovered a new issue. Some vendors are disabling a feature called <strong>software extended APDU</strong>. This feature disable the writing/reading through the NFC.<br />
Unfortunately, it's not possible to determinate this possibility at beginning, but it's possible to handle the error returned by the SDK while reading the CIE.

### iOS

The original SDK requires iOS >= 13; this Expo module follows the monorepo minimum (15.1). Always check `hasNFCFeature()` on the device rather than assuming hardware support from the OS version. Simulators and installations with `NO_INTERNAL_MODULE=1` cannot authenticate.

## Usage

To provide the CIE authentication, 3 components are required:

- Authentication URI;
- CIE pin;
- the physical CIE to read;

It's up to you to get this components.
<br />
To use the library, just import it!

```ts
import cieManager from "@io-app/expo-cie-sdk";
```

Now you have access to all the methods.

## API

The TypeScript manager is in [index.ts](./index.ts), with event types in [types.ts](./types.ts). Public callbacks and native event names remain compatible with the original package. Async operations use Expo native Promises instead of React Native bridge callbacks.

| Function                                                                    | Return             | Desciption                                        |
| :-------------------------------------------------------------------------- | :----------------- | :------------------------------------------------ |
| `hasApiLevelSupport()`                                                      | `Promise<boolean>` | (Android) Check if OS has the minimum Api version |
| `hasNFCFeature()`                                                           | `Promise<boolean>` | Check if the device has the NFC                   |
| `setPin(pin: string)`                                                       | `Promise<void>`    | Set the pin of the CIE                            |
| `setAuthenticationUrl(url: string)`                                         | `void`             | Set the Authentication Url                        |
| `setCustomIdpUrl(url?: string \| null)`                                     | `void`             | Set a Custom IdP Url; null restores the default   |
| `enableLog(isEnabled: boolean)`                                             | `<void>`           | Enable the sdk logs                               |
| `start(alertMessagesConfig?: Partial<Record<iOSAlertMessageKeys, string>>)` | `Promise<void>`    | Start the SDK                                     |
| `startListeningNFC()`                                                       | `Promise<void>`    | (Android) Start the reading from the NFC          |
| `stopListeningNFC()`                                                        | `Promise<void>`    | (Android) Stop the reading from the NFC           |
| `openNFCSettings()`                                                         | `Promise<void>`    | (Android) Open the OS Settings for the NFC        |
| `onEvent(callback: (event: Event) => void)`                                 | `void`             | Callback after any events of reading/writing      |
| `onError(callback: (error: Error) => void)`                                 | `void`             | Callback after any errors of reading/writing      |
| `onSuccess(callback: (url: string) => void)`                                | `void`             | Success Callback                                  |

## Handle errors

You can handle the errors that happens while reading the NFC.

| Error code                    | Description                                                          |
| :---------------------------- | :------------------------------------------------------------------- |
| `ON_TAG_DISCOVERED_NOT_CIE`   | (Android) The card is not a CIE                                      |
| `TAG_ERROR_NFC_NOT_SUPPORTED` | (iOS) The card is not a CIE                                          |
| `ON_TAG_DISCOVERED`           | A tag is discovered.                                                 |
| `ON_TAG_LOST`                 | A tag is lost                                                        |
| `ON_CARD_PIN_LOCKED`          | (Android) The CIE is locked because of too many insert of wrong PIN  |
| `PIN Locked`                  | (iOS) The CIE is locked because of too many insert of wrong PIN      |
| `ON_PIN_ERROR`                | Wrong PIN. The error returns also the remaining attempts number      |
| `PIN_INPUT_ERROR`             | Wrong format for the PIN. It must be 8 numeric characters            |
| `CERTIFICATE_EXPIRED`         | Expired CIE                                                          |
| `CERTIFICATE_REVOKED`         | Revoked CIE                                                          |
| `AUTHENTICATION_ERROR`        | Authentication error during the communication with Government server |
| `ON_NO_INTERNET_CONNECTION`   | No Internet connection                                               |
| `STOP_NFC_ERROR`              | Error while stopping the NFC reading                                 |
| `START_NFC_ERROR`             | Error while starting the NFC reading                                 |
| `EXTENDED_APDU_NOT_SUPPORTED` | The device cannot read the CIE                                       |
| `Transmission Error`          | (iOS) Generic Error                                                  |
