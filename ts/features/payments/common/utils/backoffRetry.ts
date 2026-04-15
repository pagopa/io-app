import I18n from "i18next";

/**
 * This constant defines the seconds delays between each retry attempt.
 */
export const PAYMENTS_BACKOFF_SECONDS_DELAYS = [1, 10, 60, 180];

/**
 * Constant to define the default value of 1 second in milliseconds
 */
export const SECONDS_TO_MILLISECONDS = 1000;

/**
 * This function returns the time remaining between the current date and the target date.
 * @returns A string with the time remaining in seconds or minutes.
 */
export const getTimeRemainingText = (targetDate: number | Date): string => {
  const now = new Date().getTime();

  const targetTime =
    targetDate instanceof Date ? targetDate.getTime() : targetDate;

  const timeDifference = targetTime - now;

  if (timeDifference <= 0) {
    // If the target date is in the past, return an empty string
    return "";
  }

  const secondsRemaining = Math.ceil(timeDifference / SECONDS_TO_MILLISECONDS);

  if (secondsRemaining < 60) {
    return secondsRemaining === 1
      ? I18n.t("features.payments.backoff.second")
      : I18n.t("features.payments.backoff.seconds", {
          seconds: secondsRemaining
        });
  }

  const minutesRemaining = Math.ceil(secondsRemaining / 60);
  return minutesRemaining === 1
    ? I18n.t("features.payments.backoff.minute")
    : I18n.t("features.payments.backoff.minutes", {
        minutes: minutesRemaining
      });
};

export const isBackoffRetryTimeElapsed = (
  allowRetryTimestamp?: number
): boolean =>
  allowRetryTimestamp === undefined || allowRetryTimestamp < Date.now();
