import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { StyleSheet } from "react-native";
import { bpdRemoteConfigSelector } from "../../../store/reducers/backendStatus";
import { GlobalState } from "../../../store/reducers/types";
import { PaymentMethod } from "../../../types/pagopa";
import PaymentMethodInitiatives from "./PaymentMethodInitiatives";
import PaymentMethodSettings from "./PaymentMethodSettings";

type OwnProps = { paymentMethod: PaymentMethod };

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const styles = StyleSheet.create({
  initiatives: {
    paddingBottom: 24
  }
});

/**
 * Display the features available for a payment method:
 * - vertical initiatives (eg: cashback, fa)
 * - global settings (payment capability, favourite, etc.)
 * @param props
 * @constructor
 */
const PaymentMethodFeatures: React.FunctionComponent<Props> = props => (
  <>
    <PaymentMethodInitiatives
      paymentMethod={props.paymentMethod}
      style={styles.initiatives}
    />
    <PaymentMethodSettings paymentMethod={props.paymentMethod} />
  </>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  bpdRemoteConfig: bpdRemoteConfigSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentMethodFeatures);
