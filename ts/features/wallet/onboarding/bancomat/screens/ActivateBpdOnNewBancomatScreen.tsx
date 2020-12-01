import * as React from "react";
import { connect } from "react-redux";
import I18n from "../../../../../i18n";
import { onboardingBancomatAddedPansSelector } from "../store/reducers/addedPans";
import { GlobalState } from "../../../../../store/reducers/types";
import ActivateBpdOnNewPaymentMethodScreen from "../../common/screens/bpd/ActivateBpdOnNewPaymentMethodScreen";

type Props = ReturnType<typeof mapStateToProps>;

const ActivateBpdOnNewBancomatScreen = (props: Props) => (
  <ActivateBpdOnNewPaymentMethodScreen
    paymentMethods={props.newBancomat}
    title={I18n.t("wallet.onboarding.bancomat.headerTitle")}
  />
);

const mapStateToProps = (state: GlobalState) => ({
  newBancomat: onboardingBancomatAddedPansSelector(state)
});
export default connect(mapStateToProps)(ActivateBpdOnNewBancomatScreen);
