import { ActionType, createStandardAction } from "typesafe-actions";

export const itwCloseFeedbackBanner = createStandardAction(
  "ITW_CLOSE_FEEDBACK_BANNER"
)<{ withFeedback?: boolean }>();

export type ItwPreferencesActions = ActionType<typeof itwCloseFeedbackBanner>;
