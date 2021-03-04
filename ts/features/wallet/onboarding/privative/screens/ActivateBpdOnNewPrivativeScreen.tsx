import * as React from "react";
import { connect } from "react-redux";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import ActivateBpdOnNewPaymentMethodScreen from "../../common/screens/bpd/ActivateBpdOnNewPaymentMethodScreen";
import { onboardingPrivativeAddedSelector } from "../store/reducers/addedPrivative";

type Props = ReturnType<typeof mapStateToProps>;

/**
 * The user can activate the cashback on the new added privative card
 * @param props
 * @constructor
 */
const ActivateBpdOnNewPrivativeScreen = (props: Props) => (
  <ActivateBpdOnNewPaymentMethodScreen
    paymentMethods={props.newPrivative ? [props.newPrivative] : []}
    title={I18n.t("wallet.onboarding.privative.headerTitle")}
    contextualHelp={emptyContextualHelp}
  />
);

const mapStateToProps = (state: GlobalState) => ({
  newPrivative: onboardingPrivativeAddedSelector(state)
});
export default connect(mapStateToProps)(ActivateBpdOnNewPrivativeScreen);
