import { addMonths, isPast } from "date-fns";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";
import { TopicKeys } from "../actions";

export const appFeedbackSelector = (state: GlobalState) =>
  state.features.appFeedback;

export const appReviewPositiveFeedbackLogSelector = (state: GlobalState) =>
  state.features.appFeedback.positiveFeedbackDate;

export const appReviewNegativeFeedbackLogSelector =
  (topic: TopicKeys) => (state: GlobalState) =>
    state.features.appFeedback.negativeFeedbackDate[topic];

const checkSixMonthPeriod = (date?: string) => {
  if (!date) {
    return true;
  }
  const logDate = new Date(date);
  const expirationDate = addMonths(logDate, 6);
  return isNaN(logDate.getTime()) && isPast(expirationDate);
};

export const canAskFeedbackSelector = (topic: TopicKeys = "general") =>
  createSelector(
    [
      appReviewPositiveFeedbackLogSelector,
      appReviewNegativeFeedbackLogSelector(topic)
    ],
    (positiveFeedbackDate, negativeFeedbackDate) =>
      checkSixMonthPeriod(positiveFeedbackDate) &&
      checkSixMonthPeriod(negativeFeedbackDate)
  );
