import { ActionType, createStandardAction } from "typesafe-actions";

export const itwCloseFeedbackBanner = createStandardAction(
  "ITW_CLOSE_FEEDBACK_BANNER"
)();

export const itwCloseDiscoveryBanner = createStandardAction(
  "ITW_CLOSE_DISCOVERY_BANNER"
)();

export const itwFlagCredentialAsRequested = createStandardAction(
  "ITW_FLAG_CREDENTIAL_AS_REQUESTED"
)<string>();

export const itwUnflagCredentialAsRequested = createStandardAction(
  "ITW_UNFLAG_CREDENTIAL_AS_REQUESTED"
)<string>();

export type ItwPreferencesActions =
  | ActionType<typeof itwCloseFeedbackBanner>
  | ActionType<typeof itwCloseDiscoveryBanner>
  | ActionType<typeof itwFlagCredentialAsRequested>
  | ActionType<typeof itwUnflagCredentialAsRequested>;
