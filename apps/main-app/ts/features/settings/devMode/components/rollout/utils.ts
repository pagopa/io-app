import { Platform } from "react-native";

import { computeDeviceRolloutRatio } from "../../../../../utils/featureRollout";

export const DEFAULT_ROLLOUT_PERCENTAGE = "50";
// Default size of the synthetic dataset used to estimate the real-world
// distribution, kept small enough to compute instantly on every render.
export const DEFAULT_SAMPLE_SIZE = "1000";

const HEX_DIGITS = "0123456789abcdef";
// Android's Settings.Secure.ANDROID_ID is a 64-bit value serialized as a
// 16-character lowercase hex string (no dashes, no reserved version/variant
// bits like a UUID has). We mimic this exact format so the simulated
// distribution reflects the real device ID population as closely as possible.
const ANDROID_ID_HEX_LENGTH = 16;

const generateHexId = (length: number): string =>
  Array.from(
    { length },
    () => HEX_DIGITS[Math.floor(Math.random() * HEX_DIGITS.length)]
  ).join("");

const generateAndroidDeviceId = (): string =>
  generateHexId(ANDROID_ID_HEX_LENGTH);

// On iOS, react-native-device-info falls back to UIDevice.identifierForVendor
// (see DeviceUID.m, `appleIFV`), whose `UUIDString` is a standard,
// uppercase, dash-separated UUID (e.g. "68753A44-4D6F-1226-9C60-0C1810C8DEE1").
// Only the format matters for this simulation (not RFC 4122 compliance or
// cryptographic randomness), so a lightweight local generator is used
// instead of the `uuid` package: it avoids that dependency's extra overhead,
// which matters when generating up to millions of IDs in a tight loop (see
// `runDistributionSimulation`).
const UUID_SEGMENT_LENGTHS = [8, 4, 4, 4, 12];
const generateDefaultDeviceId = (): string =>
  UUID_SEGMENT_LENGTHS.map(generateHexId).join("-").toUpperCase();

export const generateDeviceId = (): string =>
  Platform.select({
    android: generateAndroidDeviceId(),
    default: generateDefaultDeviceId()
  });

// Number of device IDs generated and checked per chunk before yielding back
// to the JS event loop. Keeps each synchronous burst short enough that the
// progress indicator can still update between chunks, even though the
// overall computation remains on the JS thread and can still slow down the
// UI for very large sample sizes.
const CHUNK_SIZE = 2000;

// Hands control back to the JS event loop for a tick, letting React flush
// any pending render (e.g. the progress indicator) before the next chunk of
// synchronous work starts.
const yieldToEventLoop = (): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, 0));

// Width, in percentage points, of each bucket of the frequency distribution
// (e.g. [0, 1), [1, 2), ..., [99, 100)).
export const DISTRIBUTION_BUCKET_WIDTH = 1;
export const DISTRIBUTION_BUCKET_COUNT = 100 / DISTRIBUTION_BUCKET_WIDTH;

export type DistributionBucket = {
  count: number;
  // Lower bound (inclusive), in percentage points, of the device rollout
  // ratio range this bucket covers.
  rangeStart: number;
};

export type DistributionSimulationResult = {
  // Frequency distribution of the generated devices' rollout ratio
  // (see `computeDeviceRolloutRatio`), independent of `rolloutPercentage`:
  // bucket `i` counts devices whose ratio falls within
  // `[i * DISTRIBUTION_BUCKET_WIDTH, (i + 1) * DISTRIBUTION_BUCKET_WIDTH)`
  // percent. Used to visually verify the hash function is uniform.
  buckets: ReadonlyArray<DistributionBucket>;
  expectedPercentage: number;
  observedPercentage: number;
  sampleSize: number;
};

// Generates `sampleSize` device IDs and checks `isFeatureEnabled` on each
// one in a single combined pass (no intermediate array of the generated
// strings is kept in memory), yielding to the event loop between chunks so
// `onProgress` can update the UI. Plain indexed `for` loops are used instead
// of `Array.from`/`forEach` to avoid allocating a temporary array and a
// closure call per device ID, which matters when `sampleSize` is large.
export const runDistributionSimulation = async (
  sampleSize: number,
  rolloutPercentage: number,
  onProgress: (percentageComplete: number) => void
): Promise<DistributionSimulationResult> => {
  // eslint-disable-next-line functional/no-let -- imperative accumulator across chunks is simpler and faster than a functional fold here.
  let enabledCount = 0;
  const threshold = rolloutPercentage / 100;
  const bucketCounts = new Array<number>(DISTRIBUTION_BUCKET_COUNT).fill(0);
  // eslint-disable-next-line functional/no-let -- chunk cursor, mutated by the loop increment below.
  for (let chunkStart = 0; chunkStart < sampleSize; chunkStart += CHUNK_SIZE) {
    const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, sampleSize);
    // eslint-disable-next-line functional/no-let -- indexed loop avoids the array allocation and closure call overhead of Array.from/forEach.
    for (let j = chunkStart; j < chunkEnd; j++) {
      const ratio = computeDeviceRolloutRatio(generateDeviceId());
      if (ratio < threshold) {
        enabledCount++;
      }
      const bucketIndex = Math.min(
        DISTRIBUTION_BUCKET_COUNT - 1,
        Math.floor(ratio * DISTRIBUTION_BUCKET_COUNT)
      );
      // eslint-disable-next-line functional/immutable-data -- in-place increment on a plain accumulator array avoids per-device allocation in this hot loop (mirrors `enabledCount` above).
      bucketCounts[bucketIndex]++;
    }
    onProgress(Math.round((chunkEnd / sampleSize) * 100));
    await yieldToEventLoop();
  }
  const buckets: ReadonlyArray<DistributionBucket> = bucketCounts.map(
    (count, index) => ({
      rangeStart: index * DISTRIBUTION_BUCKET_WIDTH,
      count
    })
  );
  return {
    sampleSize,
    expectedPercentage: rolloutPercentage,
    observedPercentage: (enabledCount / sampleSize) * 100,
    buckets
  };
};

export const parseRolloutPercentage = (rawValue: string): number => {
  const parsed = Number.parseFloat(rawValue);
  if (Number.isNaN(parsed)) {
    return 0;
  }
  return Math.min(100, Math.max(0, parsed));
};

// Checks that `rawValue` parses to a number within the valid rollout
// percentage range ([0, 100]), for use as a `TextInputValidation` validator.
export const isRolloutPercentageInputValid = (rawValue: string): boolean => {
  const parsed = Number.parseFloat(rawValue);
  return !Number.isNaN(parsed) && parsed >= 0 && parsed <= 100;
};

export const parseSampleSize = (rawValue: string): number => {
  const parsed = Number.parseInt(rawValue, 10);
  return parsed > 0 ? parsed : 0;
};
