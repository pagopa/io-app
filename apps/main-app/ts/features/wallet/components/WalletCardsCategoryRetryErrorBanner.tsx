import { BannerErrorState } from "@io-app/design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "i18next";
import { View } from "react-native";

import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { cdcStatusSelector } from "../../bonus/cdc/wallet/store/selectors";
import { cgnDetails } from "../../bonus/cgn/store/actions/details";
import { cgnDetailSelector } from "../../bonus/cgn/store/reducers/details";
import { idPayWalletGet } from "../../idpay/wallet/store/actions";
import { idPayWalletInitiativeListSelector } from "../../idpay/wallet/store/reducers";
import { usePaymentsBackoffRetry } from "../../payments/common/hooks/usePaymentsBackoffRetry";
import { getPaymentsWalletUserMethods } from "../../payments/wallet/store/actions";
import { paymentsWalletUserMethodsSelector } from "../../payments/wallet/store/selectors";
import { SERVICES_ROUTES } from "../../services/common/navigation/routes";

const WALLET_OTHER_CARDS_CATEGORY_BACKOFF =
  "WALLET_OTHER_CARDS_CATEGORY_BACKOFF";

/** This component shows a retry error banner if any of the B&P request fails */
export const WalletCardsCategoryRetryErrorBanner = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const isIdPayError = pot.isError(
    useIOSelector(idPayWalletInitiativeListSelector)
  );
  const isPaymentMethodsError = pot.isError(
    useIOSelector(paymentsWalletUserMethodsSelector)
  );
  const isCgnError = pot.isError(useIOSelector(cgnDetailSelector));

  const isCdcError = pot.isError(useIOSelector(cdcStatusSelector));
  const isBonusError = isIdPayError || isCgnError || isCdcError;

  const { canRetryRequest } = usePaymentsBackoffRetry(
    WALLET_OTHER_CARDS_CATEGORY_BACKOFF
  );

  const handleOnAction = () => {
    if (isCdcError) {
      navigation.navigate(SERVICES_ROUTES.SERVICES_HOME);
      return;
    }

    if (!canRetryRequest()) {
      return;
    }

    if (isPaymentMethodsError) {
      dispatch(getPaymentsWalletUserMethods.request());
    }
    if (isCgnError) {
      dispatch(cgnDetails.request());
    }
    if (isIdPayError) {
      dispatch(idPayWalletGet.request());
    }
  };

  return (
    (isPaymentMethodsError || isBonusError) && (
      <View
        style={{ marginTop: 16 }}
        testID="walletCardsCategoryRetryErrorBannerTestID"
      >
        <BannerErrorState
          actionText={I18n.t(
            isCdcError
              ? "features.wallet.home.otherMethods.error.banner.bonus.cta"
              : "features.wallet.home.otherMethods.error.banner.cta"
          )}
          icon="warningFilled"
          label={I18n.t(
            isCdcError
              ? "features.wallet.home.otherMethods.error.banner.bonus.label"
              : "features.wallet.home.otherMethods.error.banner.label"
          )}
          onPress={handleOnAction}
          testID="walletCardsCategoryRetryErrorBannerActionTestID"
        />
      </View>
    )
  );
};
