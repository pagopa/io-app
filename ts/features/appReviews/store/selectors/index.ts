import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";
import { TopicKeys } from "../actions";
import { checkFourMonthPeriod } from "../../utils/date";

export const appFeedbackSelector = (state: GlobalState) =>
  state.features.appFeedback;

export const appReviewPositiveFeedbackLogSelector = (state: GlobalState) =>
  state.features.appFeedback.positiveFeedbackDate;

export const appReviewNegativeFeedbackLogSelector =
  (topic: TopicKeys) => (state: GlobalState) =>
    state.features.appFeedback.negativeFeedbackDate[topic];

export const canAskFeedbackSelector = (topic: TopicKeys = "general") =>
  createSelector(
    [
      appReviewPositiveFeedbackLogSelector,
      appReviewNegativeFeedbackLogSelector(topic)
    ],
    (positiveFeedbackDate, negativeFeedbackDate) =>
      checkFourMonthPeriod(positiveFeedbackDate) &&
      checkFourMonthPeriod(negativeFeedbackDate)
  );
