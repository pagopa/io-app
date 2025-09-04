import { useIOToast } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { paymentsBackoffRetrySelector } from "../store/selectors";
import { PaymentsBackoffRetry } from "../types/PaymentsBackoffRetry";
import {
  getTimeRemainingText,
  isBackoffRetryTimeElapsed
} from "../utils/backoffRetry";
import { increasePaymentsBackoffRetry } from "../store/actions";

export const usePaymentsBackoffRetry = (id: PaymentsBackoffRetry) => {
  const toast = useIOToast();
  const dispatch = useIODispatch();
  const backoff = useIOSelector(paymentsBackoffRetrySelector(id));

  /**
   * This function check if the user can retry the request meaning that the exponential backoff time is elapsed
   * If the time is not elapsed, by default a toast error will be shown
   * @param showToast If true it shows automatically a toast with the time remaining to retry
   * @returns true if the request can be retried, otherwise false
   */
  const canRetryRequest = (showToast: boolean = true) => {
    if (
      backoff?.allowedRetryTimestamp &&
      !isBackoffRetryTimeElapsed(backoff?.allowedRetryTimestamp)
    ) {
      if (showToast) {
        toast.error(
          I18n.t("features.payments.backoff.retryCountDown", {
            time: getTimeRemainingText(backoff?.allowedRetryTimestamp)
          })
        );
      }
      return false;
    }
    dispatch(increasePaymentsBackoffRetry(id));
    return true;
  };

  return {
    backoff,
    canRetryRequest
  };
};
