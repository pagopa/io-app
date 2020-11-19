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
import { useLoadPotValue } from "../../../../utils/hooks/useLoadPotValue";
import {
  bpdPaymentMethodActivation,
  HPan
} from "../store/actions/paymentMethods";
import { bpdPaymentMethodValueSelector } from "../store/reducers/details/paymentMethods";
import { BpdToggle } from "./paymentMethodActivationToggle/base/BpdToggle";
import {
  calculateBpdToggleGraphicalState,
  GraphicalValue
} from "./paymentMethodActivationToggle/base/PaymentMethodBpdToggle";

type OwnProps = { hPan: HPan };

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
 *
 * @constructor
 */
const BpdCardCapability: React.FunctionComponent<Props> = props => {
  useLoadPotValue(props.hPan, props.bpdPotActivation, () =>
    props.loadActualValue(props.hPan)
  );
  const graphicalState: GraphicalValue = calculateBpdToggleGraphicalState(
    props.bpdPotActivation
  );

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <H4 weight={"SemiBold"} color={"bluegreyDark"}>
          {I18n.t("bonus.bpd.title")}
        </H4>
        <H5 color={"bluegrey"}>{I18n.t("bonus.bpd.description")}</H5>
      </View>
      <BpdToggle graphicalValue={graphicalState} />
    </View>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadActualValue: (hPan: HPan) =>
    dispatch(bpdPaymentMethodActivation.request(hPan))
});

const mapStateToProps = (state: GlobalState, props: OwnProps) => ({
  bpdPotActivation: bpdPaymentMethodValueSelector(state, props.hPan)
});

export default connect(mapStateToProps, mapDispatchToProps)(BpdCardCapability);
