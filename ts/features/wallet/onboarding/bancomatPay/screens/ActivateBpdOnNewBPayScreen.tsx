import * as React from "react";
import { connect } from "react-redux";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import ActivateBpdOnNewPaymentMethodScreen from "../../common/screens/bpd/ActivateBpdOnNewPaymentMethodScreen";
import { onboardingBPayAddedAccountSelector } from "../store/reducers/addedBPay";

type Props = ReturnType<typeof mapStateToProps>;

/**
 * The user can activate the cashback on the new added BPay account
 * @param props
 * @constructor
 */
const ActivateBpdOnNewBPayScreen = (props: Props) => (
  <ActivateBpdOnNewPaymentMethodScreen
    paymentMethods={props.newBPay}
    title={I18n.t("wallet.onboarding.bPay.headerTitle")}
    contextualHelp={emptyContextualHelp}
  />
);

const mapStateToProps = (state: GlobalState) => ({
  newBPay: onboardingBPayAddedAccountSelector(state)
});
export default connect(mapStateToProps)(ActivateBpdOnNewBPayScreen);
