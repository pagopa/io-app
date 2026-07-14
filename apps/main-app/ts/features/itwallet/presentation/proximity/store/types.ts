/**
 * Represents the claims associated with a specific credential type within a
 * proximity presentation consent.
 */
export type ConsentCredentialInfo = {
  claimNames: Array<string>;
  credentialType: string;
};

/**
 * Represents a consent given by the user to share specific credential claims
 * with a Relying Party during a proximity presentation session. A consent is
 * uniquely identified by the combination of RP, credential types, and claim
 * names requested.
 */
export type ConsentData = {
  credentials: Array<ConsentCredentialInfo>;
  rpId: string;
};

/**
 * Represents the collection of consents given by the user, indexed by their
 * deterministic lookup key. Each key maps to the readable consent details,
 * including the RP ID and the specific credentials and claims that the user has
 * agreed to share.
 */
export type ProximityConsents = Record<string, ConsentData>;
