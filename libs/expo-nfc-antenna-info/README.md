# NFC antenna information

`getNfcAntennaPosition()` returns
`Promise<{ position: "top" | "center" | "bottom"; source: "api" | "mapping"; confidence: "high" | "medium" | "low" } | undefined>`.
Public types are defined in `types.ts` and can be imported from `@io-app/expo-nfc-antenna-info`.

- iOS returns `undefined` without calling Android APIs.
- Android first reads `NfcAntennaInfo` (API 34+). The device height is split
  into equal thirds: `[0, height/3)`, `[height/3, 2*height/3)`, and
  `[2*height/3, height]`. All antennas must have valid coordinates and fall
  in the same third. API results have `high` confidence.
- If the native API reports an unsupported device, unavailable adapter, or
  unavailable antenna information, the function looks up `antennaMapping.ts`
  using `Build.MODEL` and its marketing names from
  [DeviceMarketingNames](https://github.com/Boehrsi/DeviceMarketingNames)
  (e.g. `SM-A546B` → `Galaxy A54 5G`), also without a leading manufacturer or
  brand (e.g. `HUAWEI P30 lite` → `P30 lite`). Matching ignores case and
  surrounding whitespace. Candidates mapped to different positions return
  `undefined`. Unexpected native errors reject the promise.
- Successful API responses with invalid geometry, no antennas, or antennas
  spanning different thirds return `undefined`, without a mapping fallback.
- Unknown or unclassified models return `undefined`.

The mapping comes from attachment **144256** of
[SIW-5555](https://pagopa.atlassian.net/browse/SIW-5555):
_Lettura CIE con NFC - NFC Devices distribution - Prima mappatura.csv_.
Confidence is preserved (`Alta` → `high`, `Media` → `medium`, `Bassa` → `low`).
Only classified rows are included, including codes explicitly written in
parentheses and individual models separated by `/`. No family/prefix matches are
inferred.

The Android dependency `de.boehrsi:devicemarketingnames` is pinned to 1.0.3,
without transitive dependencies: 1.0.4+ ships Kotlin 2.3 metadata and 1.0.8+
requires compileSdk 37.

The main app's NFC Playground displays the result and the marketing names; no production flow uses it yet.
