import sha from "sha.js";

// Maximum value representable by the first 32 bits (8 hex chars) of a SHA-256 digest.
const MAX_UINT32 = 4294967295;

/**
 * Determines whether a feature should be enabled for a specific device,
 * ensuring a deterministic, uniform, and monotonically increasing rollout.
 *
 * @param deviceId - The unique identifier of the device.
 * @param rolloutPercentage - The current remote rollout threshold (0-100).
 * @param featureName - The feature name, used as a salt to ensure independent distributions across features.
 * @returns `true` if the feature is enabled for the device; otherwise `false`.
 */
export const isFeatureEnabled = (
  deviceId: string,
  rolloutPercentage: number,
  featureName: string
): boolean => {
  // Short-circuit evaluations for boundaries
  if (rolloutPercentage <= 0) {
    return false;
  }
  if (rolloutPercentage >= 100) {
    return true;
  }

  // Calculate the device's fixed rollout ratio and compare it to the target threshold
  const userRatio = computeDeviceRolloutRatio(deviceId, featureName);
  const threshold = rolloutPercentage / 100;

  return userRatio < threshold;
};

/**
 * Computes a deterministic float between 0.0 (inclusive) and 1.0 (exclusive)
 * for a given device and feature combination.
 *
 * @param deviceId - The unique identifier of the device.
 * @param featureName - The feature name used as a cryptographic salt.
 * @returns A predictable decimal value representing the device's rollout bucket.
 */
const computeDeviceRolloutRatio = (
  deviceId: string,
  featureName: string
): number => {
  const inputString = `${deviceId}-${featureName}`;

  // Compute the SHA-256 hash
  const digest = sha("sha256").update(inputString, "utf8").digest();

  // Extract the first 32 bits as an integer
  const hashInteger = digest.readUInt32BE(0);

  // Normalize the integer to a float between 0.0 and 1.0
  return hashInteger / MAX_UINT32;
};
