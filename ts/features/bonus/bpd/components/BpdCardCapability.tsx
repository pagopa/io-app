import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
/**
 * Display the bpd capability for a payment method
 * @constructor
 */
import { H4 } from "../../../../components/core/typography/H4";
import { H5 } from "../../../../components/core/typography/H5";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import { GlobalState } from "../../../../store/reducers/types";
import { BpdToggle } from "./paymentMethodActivationToggle/base/BpdToggle";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

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

const BpdCardCapability: React.FunctionComponent<Props> = () => (
  <View style={styles.row}>
    <View style={styles.left}>
      <H4 weight={"SemiBold"} color={"bluegreyDark"}>
        {I18n.t("bonus.bpd.title")}
      </H4>
      <H5 color={"bluegrey"}>{I18n.t("bonus.bpd.description")}</H5>
    </View>
    <BpdToggle graphicalValue={{ value: "active", state: "ready" }} />
  </View>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(BpdCardCapability);
