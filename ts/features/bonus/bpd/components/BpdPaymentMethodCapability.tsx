/**
 * Display the bpd capability for a payment method
 * @constructor
 */
import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { useState } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../i18n";
import { GlobalState } from "../../../../store/reducers/types";
import { PaymentMethod } from "../../../../types/pagopa";
import { useLoadPotValue } from "../../../../utils/hooks/useLoadPotValue";
import { getPaymentMethodHash } from "../../../../utils/paymentMethod";
import { BasePaymentFeatureListItem } from "../../../wallet/component/features/BasePaymentFeatureListItem";
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

type OwnProps = { paymentMethod: PaymentMethod };

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const handleValueChanged = (props: Props, changeActivation: () => void) => {
  if (pot.getOrElse(props.bpdEnabled, false)) {
    changeActivation();
  } else {
    props.onboardToBpd();
  }
};

const InnerBpdPaymentMethodCapability = (
  props: Props & { hash: string }
): React.ReactElement => {
  const { hash } = props;
  useLoadPotValue(hash, props.bpdPotActivation, () =>
    props.loadActualValue(hash as HPan)
  );
  const graphicalState: GraphicalValue = calculateBpdToggleGraphicalState(
    props.bpdPotActivation
  );
  const [toggleValue, setToggleValue] = useState<boolean>(
    graphicalState.value === "active"
  );

  const {
    present: askConfirmation,
    bottomSheet: changeActivationConfirmationBottomSheet
  } = useChangeActivationConfirmationBottomSheet(
    {
      caption: props.paymentMethod.caption,
      icon: props.paymentMethod.icon
    },
    toggleValue,
    () => props.updateValue(hash as HPan, toggleValue)
  );

  const {
    present: showExplanation,
    bottomSheet: notActivableInformationBottomSheet
  } = useNotActivableInformationBottomSheet(
    {
      caption: props.paymentMethod.caption,
      icon: props.paymentMethod.icon
    },
    "NotActivable"
  );

  const bpdToggle = (
    <BpdToggle
      graphicalValue={graphicalState}
      onPress={() => showExplanation()}
      onValueChanged={newVal => {
        setToggleValue(newVal);
        handleValueChanged(props, askConfirmation);
      }}
    />
  );

  return (
    <>
      <BasePaymentFeatureListItem
        testID={"BpdPaymentMethodCapability"}
        title={I18n.t("bonus.bpd.title")}
        description={I18n.t("bonus.bpd.description")}
        rightElement={bpdToggle}
      />
      {changeActivationConfirmationBottomSheet}
      {notActivableInformationBottomSheet}
    </>
  );
};

/**
 * Represent the bpd capability on a payment method.
 * The user can choose to activate o deactivate bpd on that payment method.
 * If the user is not enrolled to bpd, the activation triggers the onboarding to bpd.
 * @constructor
 */
const BpdPaymentMethodCapability: React.FunctionComponent<Props> = props => {
  const hash = getPaymentMethodHash(props.paymentMethod);
  // Without hash we cannot asks the state for bpd
  if (hash === undefined) {
    return null;
  }
  return <InnerBpdPaymentMethodCapability {...props} hash={hash} />;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadActualValue: (hPan: HPan) =>
    dispatch(bpdPaymentMethodActivation.request(hPan)),
  updateValue: (hPan: HPan, value: boolean) =>
    dispatch(bpdUpdatePaymentMethodActivation.request({ hPan, value })),
  onboardToBpd: () => dispatch(bpdOnboardingStart())
});

const mapStateToProps = (state: GlobalState, props: OwnProps) => ({
  bpdPotActivation: bpdPaymentMethodValueSelector(
    state,
    getPaymentMethodHash(props.paymentMethod) as HPan
  ),
  bpdEnabled: bpdEnabledSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpdPaymentMethodCapability);
