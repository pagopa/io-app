import { Switch, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Body } from "../../../../components/core/typography/Body";
import { H4 } from "../../../../components/core/typography/H4";
import { GlobalState } from "../../../../store/reducers/types";
import image from "../../../../../img/wallet/cards-icons/pagobancomat.png";

type OwnProps = {};

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 48
  },
  cardIcon: {
    width: 40,
    height: 25
  }
});

/**
 * This component represents the activation state of bpd on a payment method.
 * - Load the initial value (is bpd active on the payment method)
 * - The toggle allows the user to enable or disable bpd on the payment method
 * - Sync the remote communication with the graphical states
 * @constructor
 */
const PaymentMethodBpdToggle: React.FunctionComponent<Props> = () => (
  <>
    <View style={styles.row}>
      <View style={{ flexDirection: "row", flex: 1 }}>
        <Image source={image} style={styles.cardIcon} />
        <View hspacer={true} />
        <Body>Intesa San Paolo </Body>
      </View>
      <Switch />
    </View>
  </>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentMethodBpdToggle);
