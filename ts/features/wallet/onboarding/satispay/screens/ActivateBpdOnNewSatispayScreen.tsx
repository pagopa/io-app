import * as React from "react";
import { connect } from "react-redux";
import { GlobalState } from "../../../../../store/reducers/types";
import ActivateBpdOnNewPaymentMethodScreen from "../../common/screens/bpd/ActivateBpdOnNewPaymentMethodScreen";
import { onboardingSatispayAddedResultSelector } from "../store/reducers/addedSatispay";

type Props = ReturnType<typeof mapStateToProps>;

const ActivateBpdOnNewSatispayScreen = (props: Props) => (
  <ActivateBpdOnNewPaymentMethodScreen
    paymentMethods={props.newSatispay ? [props.newSatispay] : []}
  />
);

const mapStateToProps = (state: GlobalState) => ({
  newSatispay: onboardingSatispayAddedResultSelector(state)
});
export default connect(mapStateToProps)(ActivateBpdOnNewSatispayScreen);
