import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { View } from "react-native";
import { BannerErrorState } from "../../../components/ui/BannerErrorState";
import I18n from "../../../i18n";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { cgnDetails } from "../../bonus/cgn/store/actions/details";
import { cgnDetailSelector } from "../../bonus/cgn/store/reducers/details";
import { idPayWalletGet } from "../../idpay/wallet/store/actions";
import { idPayWalletInitiativeListSelector } from "../../idpay/wallet/store/reducers";
import { usePaymentsBackoffRetry } from "../../payments/common/hooks/usePaymentsBackoffRetry";
import { getPaymentsWalletUserMethods } from "../../payments/wallet/store/actions";
import { paymentsWalletUserMethodsSelector } from "../../payments/wallet/store/selectors";

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

  return (
    (isPaymentMethodsError || isCgnError || isIdPayError) && (
      <View style={{ marginTop: 16 }}>
        <BannerErrorState
          icon="warningFilled"
          label={I18n.t("features.wallet.home.otherMethods.error.banner.label")}
          actionText={I18n.t(
            "features.wallet.home.otherMethods.error.banner.cta"
          )}
          onPress={handleOnRetry}
        />
      </View>
    )
  );
};
