import sha from "sha.js";
import { ProximityDetails } from "../utils/types";
import { ConsentData } from "./types";

/**
 * Returns the canonical payload used to identify a proximity consent.
 * Credentials and claims are sorted to keep the key deterministic regardless
 * of input ordering.
 */
const getCanonicalConsentPayload = (consent: ConsentData): string => {
  const sortedCredentials = [...consent.credentials]
    .sort((a, b) => a.credentialType.localeCompare(b.credentialType))
    .map(
      c =>
        `${c.credentialType}:${[...c.claimNames]
          .sort((a, b) => a.localeCompare(b))
          .join(",")}`
    )
    .join("::");

  return `${consent.rpId}::${sortedCredentials}`;
};

/**
 * Generates a deterministic compact key for a consent based on the RP ID and
 * the full credential claims combination.
 *
 * The returned key is the full SHA-256 hex digest of the canonical payload.
 * Consent details remain available in the stored value, keeping persisted keys
 * opaque while preserving exact lookup semantics.
 */
export const generateConsentKey = (consent: ConsentData): string =>
  sha("sha256").update(getCanonicalConsentPayload(consent)).digest("hex");

/**
 * Generates a consent data from the RP ID and proximity details
 *
 * @param proximityDetails List of requested credentials and claims from the
 * proximity presentation details.
 *
 * @returns A ConsentData structure representing the consent details,
 */
export const getConsentDataFromProximityDetails = (
  proximityDetails: ProximityDetails
): ConsentData => ({
  rpId: proximityDetails[0].rpId,
  credentials: proximityDetails.map(detail => ({
    credentialType: detail.credentialType,
    claimNames: detail.claimsToDisplay.map(claim => claim.id)
  }))
});
