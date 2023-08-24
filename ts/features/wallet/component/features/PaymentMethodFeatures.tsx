import * as React from "react";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import { View } from "react-native";
import { Alert } from "@pagopa/io-app-design-system";

import { connect } from "react-redux";
import { isIdPayEnabledSelector } from "../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../store/reducers/types";
import { PaymentMethod } from "../../../../types/pagopa";
import { isPaymentMethodExpired } from "../../../../utils/paymentMethod";
import I18n from "../../../../i18n";

import PaymentMethodInitiatives from "./PaymentMethodInitiatives";
import PaymentMethodSettings from "./PaymentMethodSettings";

type OwnProps = { paymentMethod: PaymentMethod };

type Props = ReturnType<typeof mapStateToProps> & OwnProps;

/**
 * Display the features available for a payment method:
 * - vertical initiatives (eg: cashback, fa)
 * - global settings (payment capability, favourite, etc.)
 */
const PaymentMethodFeatures = ({ isIdpayEnabled, paymentMethod }: Props) => {
  const isMethodExpired = pipe(
    paymentMethod,
    isPaymentMethodExpired,
    E.getOrElse(() => false)
  );

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

const mapStateToProps = (state: GlobalState) => ({
  isIdpayEnabled: isIdPayEnabledSelector(state)
});

export default connect(mapStateToProps)(PaymentMethodFeatures);
