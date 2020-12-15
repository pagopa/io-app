import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
/**
 * Display the bpd capability for a payment method
 * @constructor
 */
import { H4 } from "../../core/typography/H4";
import { H5 } from "../../core/typography/H5";
import { IOStyles } from "../../core/variables/IOStyles";
import I18n from "../../../i18n";
import { PaymentMethod } from "../../../types/pagopa";

type OwnProps = { paymentMethod: PaymentMethod };

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  left: {
    ...IOStyles.flex,
    paddingRight: 8
  }
});

/**
 * Represent the bpd capability on a payment method.
 * The user can choose to activate o deactivate bpd on that payment method.
 * If the user is not enrolled to bpd, the activation triggers the onboarding to bpd.
 * @constructor
 */
const PagoPaPaymentMethodCapability: React.FunctionComponent<Props> = props => (
  <View style={styles.row}>
    <View style={styles.left}>
      <H4 weight={"SemiBold"} color={"bluegreyDark"}>
        {I18n.t("bonus.bpd.title")}
      </H4>
      <H5 color={"bluegrey"}>{I18n.t("bonus.bpd.description")}</H5>
    </View>
  </View>
);

const mapDispatchToProps = (dispatch: Dispatch) => ({});

const mapStateToProps = () => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PagoPaPaymentMethodCapability);
