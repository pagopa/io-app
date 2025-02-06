import { ActionType, createStandardAction } from "typesafe-actions";
import { AppFeedbackUri } from "../../../../../definitions/content/AppFeedbackUri";

export type TopicKeys = keyof AppFeedbackUri;

export const appReviewPositiveFeedback = createStandardAction(
  "APP_REVIEW_POSITIVE_FEEDBACK"
)();

export const appReviewNegativeFeedback = createStandardAction(
  "APP_REVIEW_NEGATIVE_FEEDBACK"
)<TopicKeys>();

export type AppFeedbackActions =
  | ActionType<typeof appReviewPositiveFeedback>
  | ActionType<typeof appReviewNegativeFeedback>;
