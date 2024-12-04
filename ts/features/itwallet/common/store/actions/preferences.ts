import { ActionType, createStandardAction } from "typesafe-actions";

export const itwCloseFeedbackBanner = createStandardAction(
  "ITW_CLOSE_FEEDBACK_BANNER"
)();

export const itwCloseDiscoveryBanner = createStandardAction(
  "ITW_CLOSE_DISCOVERY_BANNER"
)();

export type ItwPreferencesActions =
  | ActionType<typeof itwCloseFeedbackBanner>
  | ActionType<typeof itwCloseDiscoveryBanner>;
