import * as React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useIOToast } from "@pagopa/io-app-design-system";
import { BannerErrorState } from "../../../components/ui/BannerErrorState";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { idPayWalletInitiativeListSelector } from "../../idpay/wallet/store/reducers";
import { paymentsWalletUserMethodsSelector } from "../../payments/wallet/store/selectors";
import { cgnDetailSelector } from "../../bonus/cgn/store/reducers/details";
import { idPayWalletGet } from "../../idpay/wallet/store/actions";
import { getPaymentsWalletUserMethods } from "../../payments/wallet/store/actions";
import { cgnDetails } from "../../bonus/cgn/store/actions/details";
import { paymentsBackoffRetrySelector } from "../../payments/common/store/selectors";
import { increasePaymentsBackoffRetry } from "../../payments/common/store/actions";
import {
  canRetry,
  getTimeRemainingText
} from "../../payments/common/utils/backoffRetry";
import I18n from "../../../i18n";

const WALLET_OTHER_CARDS_CATEGORY_BACKOFF =
  "WALLET_OTHER_CARDS_CATEGORY_BACKOFF";

/**
 * This component shows a retry error banner if any of the B&P request fails
 */
export const WalletCardsCategoryRetryErrorBanner = () => {
  const dispatch = useIODispatch();
  const toast = useIOToast();

  const isIdPayError = pot.isError(
    useIOSelector(idPayWalletInitiativeListSelector)
  );
  const isPaymentMethodsError = pot.isError(
    useIOSelector(paymentsWalletUserMethodsSelector)
  );
  const isCgnError = pot.isError(useIOSelector(cgnDetailSelector));

  const otherCardsBackoff = useIOSelector(
    paymentsBackoffRetrySelector(WALLET_OTHER_CARDS_CATEGORY_BACKOFF)
  );

  const handleOnRetry = () => {
    if (
      otherCardsBackoff?.allowedRetryTimestamp &&
      !canRetry(otherCardsBackoff?.allowedRetryTimestamp)
    ) {
      toast.error(
        I18n.t("features.payments.backoff.retryCountDown", {
          time: getTimeRemainingText(otherCardsBackoff?.allowedRetryTimestamp)
        })
      );
      return;
    }
    dispatch(increasePaymentsBackoffRetry(WALLET_OTHER_CARDS_CATEGORY_BACKOFF));
    if (isIdPayError) {
      dispatch(idPayWalletGet.request());
    }
    if (isPaymentMethodsError) {
      dispatch(getPaymentsWalletUserMethods.request());
    }
    if (isCgnError) {
      dispatch(cgnDetails.request());
    }
  };

  if (isPaymentMethodsError || isCgnError || isIdPayError) {
    return (
      <BannerErrorState
        icon="warningFilled"
        label="Non siamo riusciti a caricare alcuni elementi della lista."
        actionText="Prova di nuovo"
        onPress={handleOnRetry}
      />
    );
  }
  return undefined;
};
