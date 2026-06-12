import { ActionType, createStandardAction } from "typesafe-actions";
import { ConsentData } from "../types";

/**
 * Grants a proximity presentation consent for a specific RP, credential types,
 * and claim names combination. If the exact same consent already exists, this is
 * a no-op in the reducer.
 */
export const itwGrantProximityConsent = createStandardAction(
  "ITW_PROXIMITY_CONSENT_GRANT"
)<ConsentData>();

/**
 * Revokes a single consent by its deterministic key.
 */
export const itwRevokeProximityConsentByKey = createStandardAction(
  "ITW_PROXIMITY_CONSENT_REVOKE_BY_KEY"
)<string>();

/**
 * Revokes all consents given to the specified RP ID.
 */
export const itwRevokeProximityConsentsByRpId = createStandardAction(
  "ITW_PROXIMITY_CONSENT_REVOKE_BY_RP_ID"
)<string>();

/**
 * Revokes all consents that involve the specified credential type.
 */
export const itwRevokeProximityConsentsByCredentialType = createStandardAction(
  "ITW_PROXIMITY_CONSENT_REVOKE_BY_CREDENTIAL_TYPE"
)<string>();

/**
 * Revokes all stored proximity presentation consents.
 */
export const itwRevokeAllProximityConsents = createStandardAction(
  "ITW_PROXIMITY_CONSENT_REVOKE_ALL"
)<void>();

export type ItwProximityActions =
  | ActionType<typeof itwGrantProximityConsent>
  | ActionType<typeof itwRevokeProximityConsentByKey>
  | ActionType<typeof itwRevokeProximityConsentsByRpId>
  | ActionType<typeof itwRevokeProximityConsentsByCredentialType>
  | ActionType<typeof itwRevokeAllProximityConsents>;
