import { ConsentData } from "./types";

/**
 * Generates a deterministic, human-readable key for a consent based on
 * the RP ID and the credential claims combination.
 *
 * Format: `rpId::credType1:claim1,claim2::credType2:claim3`
 *
 * All segments and claim names are sorted alphabetically to guarantee
 * the same combination always produces the same key, regardless of
 * the order in which credentials or claims are provided.
 */
export const generateConsentKey = (consent: ConsentData): string => {
  const sortedCredentials = [...consent.credentials]
    .sort((a, b) => a.credentialType.localeCompare(b.credentialType))
    .map(
      c =>
        `${c.credentialType}:${[...c.claimNames].sort((a, b) => a.localeCompare(b)).join(",")}`
    )
    .join("::");

  return `${consent.rpId}::${sortedCredentials}`;
};
