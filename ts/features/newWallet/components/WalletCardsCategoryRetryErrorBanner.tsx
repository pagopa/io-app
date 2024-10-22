import * as React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { BannerErrorState } from "../../../components/ui/BannerErrorState";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { idPayWalletInitiativeListSelector } from "../../idpay/wallet/store/reducers";
import { paymentsWalletUserMethodsSelector } from "../../payments/wallet/store/selectors";
import { cgnDetailSelector } from "../../bonus/cgn/store/reducers/details";
import { idPayWalletGet } from "../../idpay/wallet/store/actions";
import { getPaymentsWalletUserMethods } from "../../payments/wallet/store/actions";
import { cgnDetails } from "../../bonus/cgn/store/actions/details";
import { usePaymentsBackoffRetry } from "../../payments/common/hooks/usePaymentsBackoffRetry";
import I18n from "../../../i18n";

const WALLET_OTHER_CARDS_CATEGORY_BACKOFF =
  "WALLET_OTHER_CARDS_CATEGORY_BACKOFF";

/**
 * This component shows a retry error banner if any of the B&P request fails
 */
export const WalletCardsCategoryRetryErrorBanner = () => {
  const dispatch = useIODispatch();

  const isIdPayError = pot.isError(
    useIOSelector(idPayWalletInitiativeListSelector)
  );
  const isPaymentMethodsError = pot.isError(
    useIOSelector(paymentsWalletUserMethodsSelector)
  );
  const isCgnError = pot.isError(useIOSelector(cgnDetailSelector));

  const { canRetryRequest } = usePaymentsBackoffRetry(
    WALLET_OTHER_CARDS_CATEGORY_BACKOFF
  );

  const handleOnRetry = () => {
    if (canRetryRequest()) {
      if (isIdPayError) {
        dispatch(idPayWalletGet.request());
      }
      if (isPaymentMethodsError) {
        dispatch(getPaymentsWalletUserMethods.request());
      }
      if (isCgnError) {
        dispatch(cgnDetails.request());
      }
    }
  };

  if (isPaymentMethodsError || isCgnError || isIdPayError) {
    return (
      <BannerErrorState
        icon="warningFilled"
        label={I18n.t("features.wallet.home.otherMethods.error.banner.label")}
        actionText={I18n.t(
          "features.wallet.home.otherMethods.error.banner.cta"
        )}
        onPress={handleOnRetry}
      />
    );
  }
  return undefined;
};
