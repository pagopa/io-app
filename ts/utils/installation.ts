/**
 * Utility methods for generating installation IDs for Notification Hubs
 */

import uuid from "uuid/v4";

// DO NOT CHANGE THIS UNLESS YOU KNOW WHAT YOU ARE DOING
const UUID_VERSION_PREFIX = "001";

/**
 * Generates a new random installation ID with the following format:
 *
 * <VERSION_PREFIX><UUID>
 *
 * Where:
 *   VERSION_PREFIX is \d{3}
 *   UUID is [a-z0-9]{32}
 */
export function generateInstallationId(): string {
  return `${UUID_VERSION_PREFIX}${uuid().replace(/-/g, "")}`;
}
