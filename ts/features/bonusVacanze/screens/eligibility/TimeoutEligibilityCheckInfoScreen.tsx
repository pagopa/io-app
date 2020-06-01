import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../i18n";
import { navigateToWalletHome } from "../../../../store/actions/navigation";
import { InfoScreenComponent } from "../../components/InfoScreenComponent";

type Props = ReturnType<typeof mapDispatchToProps>;

const body = I18n.t("bonus.bonusVacanza.eligibility.timeout.description");
const confirmText = I18n.t("global.buttons.close");
const image = require("../../../../../img/wallet/errors/invalid-amount-icon.png");

/**
 * This screen informs the user that the request takes longer than necessary to be completed
 * and will receive a notification with the outcome of the verification when it is terminated.
 * The screen is tied to the business logic and is composed using {@link InfoScreenComponent}
 * @param props
 * @constructor
 */

const TimeoutEligibilityCheckInfoScreen: React.FunctionComponent<
  Props
> = props => {
  return (
    <InfoScreenComponent
      onConfirm={props.onConfirm}
      confirmText={confirmText}
      image={image}
      body={body}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // TODO: link with the right dispatch action
  onConfirm: () => dispatch(navigateToWalletHome())
});

export default connect(
  null,
  mapDispatchToProps
)(TimeoutEligibilityCheckInfoScreen);
