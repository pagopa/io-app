import * as React from "react";
import { connect } from "react-redux";
import { onboardingBancomatAddedPansSelector } from "../store/reducers/addedPans";
import { GlobalState } from "../../../../../store/reducers/types";
import ActivateBpdOnNewPaymentMethodScreen from "../../common/screens/bpd/ActivateBpdOnNewPaymentMethodScreen";

type Props = ReturnType<typeof mapStateToProps>;

const ActivateBpdOnNewBancomatScreen = (props: Props) => (
  <ActivateBpdOnNewPaymentMethodScreen paymentMethods={props.newBancomat} />
);

const mapStateToProps = (state: GlobalState) => ({
  newBancomat: onboardingBancomatAddedPansSelector(state)
});
export default connect(mapStateToProps)(ActivateBpdOnNewBancomatScreen);
