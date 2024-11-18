import { ActionType, createStandardAction } from "typesafe-actions";

export const itwCloseFeedbackBanner = createStandardAction(
  "ITW_CLOSE_FEEDBACK_BANNER"
)();

export type ItwPreferencesActions = ActionType<typeof itwCloseFeedbackBanner>;
