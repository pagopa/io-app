import sha from "sha.js";

// Maximum value representable by the first 32 bits (8 hex chars) of a SHA-256 digest.
const MAX_UINT32 = 4294967295;

/**
 * Computes the deterministic position of a device within the [0, 1) rollout
 * distribution for a given feature. The same `deviceId`/`featureName` pair
 * always maps to the same ratio, which is the intrinsic "activation
 * threshold" of that device: it becomes enabled as soon as
 * `rolloutPercentage / 100` exceeds this value, and never again disabled as
 * the rollout percentage increases.
 *
 * @param deviceId The unique and persistent identifier of the device.
 * @param featureName The name of the feature (used as a salt to isolate tests).
 */
export function computeDeviceRolloutRatio(
  deviceId: string,
  featureName = "OneIdentityRollout"
): number {
  // 1. Test isolation via concatenation
  const inputString = `${deviceId}-${featureName}`;

  // 2. SHA-256 hash calculation. Read the raw digest bytes directly instead
  // of hex-encoding the full 32-byte digest and re-parsing a substring of
  // it: same result, without the wasted encode/decode round-trip (relevant
  // when this runs in a tight loop, e.g. `runDistributionSimulation`).
  const digest = sha("sha256").update(inputString, "utf8").digest();

  // 3. Extract the first 32 bits as an integer
  const hashInteger = digest.readUInt32BE(0);

  // 4. Divide the integer by the maximum possible 32-bit value (0xffffffff)
  return hashInteger / MAX_UINT32; // Generates a float between 0.0 and 1.0
}

/**
 * Determines whether a feature should be enabled for a specific device,
 * ensuring a deterministic, uniform, and monotonically increasing rollout.
 *
 * The same `deviceId`/`featureName` pair always maps to the same position
 * within the [0, 1) distribution, so increasing `rolloutPercentage` over
 * time can only add devices to the enabled set, never remove them.
 *
 * @param deviceId The unique and persistent identifier of the device.
 * @param rolloutPercentage The current remote rollout percentage (0-100).
 * @param featureName The name of the feature (used as a salt to isolate tests).
 */
export function isFeatureEnabled(
  deviceId: string,
  rolloutPercentage: number,
  featureName = "OneIdentityRollout"
): boolean {
  // 1. Optimization (Short-Circuit)
  if (rolloutPercentage <= 0) {
    return false;
  }
  if (rolloutPercentage >= 100) {
    return true;
  }

  const userRatio = computeDeviceRolloutRatio(deviceId, featureName);

  // 2. Convert the percentage into a decimal threshold (e.g., 20 -> 0.20)
  const threshold = rolloutPercentage / 100;

  // 3. Threshold validation
  return userRatio < threshold;
}
