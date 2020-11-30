import * as React from "react";
import { connect } from "react-redux";
import { GlobalState } from "../../../../../store/reducers/types";
import { onboardingBancomatAddedPansSelector } from "../../bancomat/store/reducers/addedPans";
import ActivateBpdOnNewPaymentMethodScreen from "../../common/screens/bpd/ActivateBpdOnNewPaymentMethodScreen";

type Props = ReturnType<typeof mapStateToProps>;

const ActivateBpdOnNewSatispayScreen = (props: Props) => (
  <ActivateBpdOnNewPaymentMethodScreen paymentMethods={props.newSatispay} />
);

const mapStateToProps = (state: GlobalState) => ({
  // TODO : replace with onboarding satispay selector
  newSatispay: onboardingBancomatAddedPansSelector(state)
});
export default connect(mapStateToProps)(ActivateBpdOnNewSatispayScreen);
