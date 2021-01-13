import * as React from "react";
import { connect } from "react-redux";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import ActivateBpdOnNewPaymentMethodScreen from "../../common/screens/bpd/ActivateBpdOnNewPaymentMethodScreen";
import { onboardingSatispayAddedResultSelector } from "../store/reducers/addedSatispay";

type Props = ReturnType<typeof mapStateToProps>;

const ActivateBpdOnNewSatispayScreen = (props: Props) => (
  <ActivateBpdOnNewPaymentMethodScreen
    paymentMethods={props.newSatispay ? [props.newSatispay] : []}
    title={I18n.t("wallet.onboarding.satispay.headerTitle")}
    contextualHelp={emptyContextualHelp}
  />
);

const mapStateToProps = (state: GlobalState) => ({
  newSatispay: onboardingSatispayAddedResultSelector(state)
});
export default connect(mapStateToProps)(ActivateBpdOnNewSatispayScreen);
