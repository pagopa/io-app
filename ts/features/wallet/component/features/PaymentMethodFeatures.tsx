import * as React from "react";

import { connect } from "react-redux";
import { isIdPayEnabledSelector } from "../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../store/reducers/types";
import { PaymentMethod } from "../../../../types/pagopa";
import PaymentMethodInitiatives from "./PaymentMethodInitiatives";
import PaymentMethodSettings from "./PaymentMethodSettings";

type OwnProps = { paymentMethod: PaymentMethod };

type Props = ReturnType<typeof mapStateToProps> & OwnProps;

/**
 * Display the features available for a payment method:
 * - vertical initiatives (eg: cashback, fa)
 * - global settings (payment capability, favourite, etc.)
 * @param props
 * @constructor
 */
const PaymentMethodFeatures: React.FunctionComponent<Props> = props => (
  <>
    {props.isIdpayEnabled ? (
      <PaymentMethodInitiatives paymentMethod={props.paymentMethod} />
    ) : null}
    <PaymentMethodSettings paymentMethod={props.paymentMethod} />
  </>
);

const mapStateToProps = (state: GlobalState) => ({
  isIdpayEnabled: isIdPayEnabledSelector(state)
});

export default connect(mapStateToProps)(PaymentMethodFeatures);
