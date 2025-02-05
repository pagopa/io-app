import { ActionType, createStandardAction } from "typesafe-actions";
import { AppFeedbackUriFeature } from "../../../../../definitions/content/AppFeedbackUriFeature";

export const appReviewPositiveFeedback = createStandardAction(
  "APP_REVIEW_POSITIVE_FEEDBACK"
)();

export const appReviewNegFeedback = createStandardAction(
  "APP_REVIEW_NEGATIVE_FEEDBACK"
)<keyof AppFeedbackUriFeature>();

export type AppFeedbackActions =
  | ActionType<typeof appReviewPositiveFeedback>
  | ActionType<typeof appReviewNegFeedback>;
