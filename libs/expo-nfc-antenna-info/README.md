# NFC antenna information

`getNfcAntennaPosition()` returns
`Promise<{ position: "top" | "center" | "bottom"; source: "api" | "mapping"; confidence: "high" | "medium" | "low" } | undefined>`.
Public types are defined in `types.ts` and can be imported from `@io-app/expo-nfc-antenna-info`.

- iOS returns `undefined` without calling Android APIs.
- Android first reads `NfcAntennaInfo` (API 34+). The device height is split
  into equal thirds: `(0, height/3)`, `[height/3, 2*height/3)`, and
  `[2*height/3, height]`. All antennas must have valid coordinates and fall
  in the same third. API results have `high` confidence.
- If the native API reports an unsupported device, unavailable adapter,
  unavailable antenna information, invalid dimensions or coordinates, or no
  antennas, the function looks up `antennaMapping.ts` using Android
  `Build.BRAND` and `Build.MODEL`. Zero dimensions and zero X or Y coordinates
  are treated as invalid. Matching ignores case and surrounding whitespace.
  Unexpected native errors reject the promise.
- Antennas with valid coordinates spanning different thirds return `undefined`,
  without a mapping fallback.
- Unknown or unclassified models return `undefined`.

The mapping is based on an internal study that classifies NFC antenna
positions and assigns a confidence level to each model. The study's
classified marketing names are matched by brand against the
[Google Play supported devices catalog](https://storage.googleapis.com/play_public/supported_devices.html)
to obtain retail brands and model identifiers. Confidence is preserved (`Alta` →
`high`, `Media` → `medium`, `Bassa` → `low`). Pairs associated with conflicting
classifications or with additional unclassified marketing names are excluded.
The catalog's retail brand may differ from `Build.BRAND`, in which case there
is no match. The catalog does not prove that every regional variant has the
same antenna.

The current mapping uses the catalog of 2026-11-18 (CSV SHA-256
`1a298dda3a709b47719cd999bce69afc741dd9fd784d8a390c5f8399f34b1d5c`).
It covers 175 of 184 classified source rows; 32 ambiguous pairs are excluded.
The remaining rows include names without an exact catalog match. For example,
Reno6 5G is nevertheless represented by the separately listed CPH2251 code.

The main app's NFC Playground displays the result; no production flow uses it yet.
