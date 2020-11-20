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
import { getValueOrElse } from "../model/RemoteValue";
import { bpdOnboardingStart } from "../store/actions/onboarding";
import {
  bpdPaymentMethodActivation,
  bpdUpdatePaymentMethodActivation,
  HPan
} from "../store/actions/paymentMethods";
import { bpdEnabledSelector } from "../store/reducers/details/activation";
import { bpdPaymentMethodValueSelector } from "../store/reducers/details/paymentMethods";
import { BpdToggle } from "./paymentMethodActivationToggle/base/BpdToggle";
import {
  calculateBpdToggleGraphicalState,
  GraphicalValue
} from "./paymentMethodActivationToggle/base/PaymentMethodBpdToggle";
import { useChangeActivationConfirmationBottomSheet } from "./paymentMethodActivationToggle/bottomsheet/BpdChangeActivationConfirmationScreen";
import { useNotActivableInformationBottomSheet } from "./paymentMethodActivationToggle/bottomsheet/BpdNotActivableInformation";

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

const handleValueChanged = (props: Props) => {
  console.log(props.bpdEnabled);
  if (getValueOrElse(props.bpdEnabled, false)) {
  } else {
    props.onboardToBpd();
  }
};

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

  const askConfirmation = useChangeActivationConfirmationBottomSheet(props)
    .present;

  const showExplanation = useNotActivableInformationBottomSheet(props).present;

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <H4 weight={"SemiBold"} color={"bluegreyDark"}>
          {I18n.t("bonus.bpd.title")}
        </H4>
        <H5 color={"bluegrey"}>{I18n.t("bonus.bpd.description")}</H5>
      </View>
      <BpdToggle
        graphicalValue={graphicalState}
        onPress={showExplanation}
        onValueChanged={_ => handleValueChanged(props)}
      />
    </View>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadActualValue: (hPan: HPan) =>
    dispatch(bpdPaymentMethodActivation.request(hPan)),
  updateValue: (hPan: HPan, value: boolean) =>
    dispatch(bpdUpdatePaymentMethodActivation.request({ hPan, value })),
  onboardToBpd: () => dispatch(bpdOnboardingStart())
});

const mapStateToProps = (state: GlobalState, props: OwnProps) => ({
  bpdPotActivation: bpdPaymentMethodValueSelector(state, props.hPan),
  bpdEnabled: bpdEnabledSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(BpdCardCapability);
