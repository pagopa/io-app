import { AppFeedbackUri } from "@io-app/api-types/generated/definitions/content/AppFeedbackUri";
import { ActionType, createStandardAction } from "typesafe-actions";

export type TopicKeys = keyof AppFeedbackUri;

export const appReviewPositiveFeedback = createStandardAction(
  "APP_REVIEW_POSITIVE_FEEDBACK"
)();

export const appReviewNegativeFeedback = createStandardAction(
  "APP_REVIEW_NEGATIVE_FEEDBACK"
)<TopicKeys>();

// Reset feedback data just for testing purposes
export const clearFeedbackDatas = createStandardAction(
  "APP_REVIEW_RESET_FEEDBACK"
)();

export type AppFeedbackActions =
  | ActionType<typeof appReviewNegativeFeedback>
  | ActionType<typeof appReviewPositiveFeedback>
  | ActionType<typeof clearFeedbackDatas>;
