import { ActionType, createStandardAction } from "typesafe-actions";

export const itwGrantProximityConsent = createStandardAction(
  "ITW_PROXIMITY_CONSENT_GRANT"
)<string>();

export const itwRevokeProximityConsent = createStandardAction(
  "ITW_PROXIMITY_CONSENT_CLEAR"
)<string>();

export type ItwProximityActions =
  | ActionType<typeof itwGrantProximityConsent>
  | ActionType<typeof itwRevokeProximityConsent>;
