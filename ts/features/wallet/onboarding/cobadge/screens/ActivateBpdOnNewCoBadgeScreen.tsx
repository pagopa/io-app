import * as React from "react";
import { connect } from "react-redux";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import ActivateBpdOnNewPaymentMethodScreen from "../../common/screens/bpd/ActivateBpdOnNewPaymentMethodScreen";
import { onboardingCoBadgeAddedSelector } from "../store/reducers/addedCoBadge";

type Props = ReturnType<typeof mapStateToProps>;

/**
 * The user can activate the cashback on the new added coBadge card
 * @param props
 * @constructor
 */
const ActivateBpdOnNewCoBadgeScreen = (props: Props) => (
  <ActivateBpdOnNewPaymentMethodScreen
    paymentMethods={props.newCoBadge}
    title={I18n.t("wallet.onboarding.coBadge.headerTitle")}
    contextualHelp={emptyContextualHelp}
  />
);

const mapStateToProps = (state: GlobalState) => ({
  newCoBadge: onboardingCoBadgeAddedSelector(state)
});
export default connect(mapStateToProps)(ActivateBpdOnNewCoBadgeScreen);
