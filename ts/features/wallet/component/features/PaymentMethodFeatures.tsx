import { Alert } from "@pagopa/io-app-design-system";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { View } from "react-native";

import I18n from "../../../../i18n";
import { isIdPayEnabledSelector } from "../../../../store/reducers/backendStatus";
import { PaymentMethod } from "../../../../types/pagopa";
import { isPaymentMethodExpired } from "../../../../utils/paymentMethod";

import { useIOSelector } from "../../../../store/hooks";
import PaymentMethodInitiatives from "./PaymentMethodInitiatives";
import PaymentMethodSettings from "./PaymentMethodSettings";

type Props = { paymentMethod: PaymentMethod };

/**
 * Display the features available for a payment method:
 * - vertical initiatives (eg: cashback, fa)
 * - global settings (payment capability, favourite, etc.)
 */
const PaymentMethodFeatures = ({ paymentMethod }: Props) => {
  const isMethodExpired = pipe(
    paymentMethod,
    isPaymentMethodExpired,
    E.getOrElse(() => false)
  );
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

export default PaymentMethodFeatures;
