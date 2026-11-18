# Incoming payment files

This local module wraps the experimental incoming-share support in
`expo-sharing`. Its config plugin registers Android intents and an iOS Share
Extension for one PDF or one image. The app accepts `application/pdf` and
`image/*` payloads, reads them with its existing barcode scanner, and starts
the pagoPA flow after authentication. These are the same document and image
categories offered by the in-app upload pickers.

The native projects currently checked into the repository include the plugin's
configuration. CNG can apply the plugin from `apps/main-app/app.json` when the
app's native projects are generated.

On Android the main activity uses `singleTask` so shared files and links reach
the existing app instance. Android may close activities above it when bringing
the app back to the foreground.

## iOS signing

Register the following App Groups and Share Extension identifiers with the
Apple development team and provision both the app and its extension:

| Build      | App Group                       | Extension bundle ID                      |
| ---------- | ------------------------------- | ---------------------------------------- |
| Production | `group.it.pagopa.app.io`        | `it.pagopa.app.io.ShareExtension`        |
| Canary     | `group.it.pagopa.app.io.canary` | `it.pagopa.app.io.canary.ShareExtension` |

The iOS extension uses Expo's experimental approach to opening the main app,
which Apple does not officially support. Validate it on a device and with the
release signing workflow before shipping.

## Accepted shares

- PDF files with MIME type `application/pdf`.
- Images with an `image/*` MIME type, including JPEG.
- One shared item at a time; all other MIME types and multiple-item payloads
  are rejected by the app.

The iOS extension activation predicate allows a single image or PDF. Android
registers `application/pdf` and `image/*` for `ACTION_SEND`.

## Testing

For a local iOS build, rebuild and reinstall IO from Xcode. No Expo prebuild
is needed: the checked-in Xcode project registers the app bundle identifier
as a URL scheme and sets `ExpoShareIntoAppGroupId` to the same App Group as
the extension's `AppGroupId`. To isolate URL routing from the Share Extension, open
`it.pagopa.app.io://expo-sharing` (or `it.pagopa.app.io.canary://expo-sharing`
for Canary) using Shortcuts. IO should open without starting a payment.

Rebuild and install the app, share a PDF and a JPEG containing pagoPA barcodes
from another app, select IO, and authenticate if prompted. The app should show
the payment or let you choose between multiple notices. Also test an image
format available in the in-app picker, an invalid PDF, an unsupported file
type, multiple shared items, and sharing while IO is already open.
