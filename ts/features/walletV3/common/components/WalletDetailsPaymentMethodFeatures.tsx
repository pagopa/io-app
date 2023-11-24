import { Alert } from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";

import I18n from "../../../../i18n";
import { isIdPayEnabledSelector } from "../../../../store/reducers/backendStatus";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";

import { isPaymentMethodExpired } from "../utils";
import { useIOSelector } from "../../../../store/hooks";
import PaymentMethodInitiatives from "./WalletDetailsPaymentMethodInitiatives";
import PaymentMethodSettings from "./WalletDetailsPaymentMethodSettings";

type Props = { paymentMethod: WalletInfo };

/**
 * Display the features available for a payment method:
 * - vertical initiatives (eg: cashback, fa)
 * - global settings (payment capability, favourite, etc.)
 */
const WalletDetailsPaymentMethodFeatures = ({ paymentMethod }: Props) => {
  const isMethodExpired = isPaymentMethodExpired(paymentMethod);
  const isIdpayEnabled = useIOSelector(isIdPayEnabledSelector);

  if (isMethodExpired) {
    const viewRef = React.createRef<View>();
    return (
      <Alert
        viewRef={viewRef}
        variant="error"
        content={I18n.t("wallet.methodDetails.expired")}
      />
    );
  }

  return (
    <>
      {isIdpayEnabled ? (
        <PaymentMethodInitiatives paymentMethod={paymentMethod} />
      ) : null}
      <PaymentMethodSettings paymentMethod={paymentMethod} />
    </>
  );
};

export default WalletDetailsPaymentMethodFeatures;
