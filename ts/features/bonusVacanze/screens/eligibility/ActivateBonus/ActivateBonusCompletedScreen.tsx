import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../../i18n";
import { InfoScreenComponent } from "../../../components/InfoScreenComponent";

type Props = ReturnType<typeof mapDispatchToProps>;

const body = I18n.t(
  "bonus.bonusVacanza.eligibility.activate.completed.description"
);
const confirmText = I18n.t(
  "bonus.bonusVacanza.eligibility.activate.goToDetails"
);
const image = require("../../../../../../img/wallet/errors/payment-duplicated-icon.png");

/**
 * This screen informs the user that the bonus has been activated!
 * It allows only one CTA: goto -> display bonus details
 * The screen is tied to the business logic and is composed using {@link InfoScreenComponent}
 * @param props
 * @constructor
 */

const ActivateBonusCompletedScreen: React.FunctionComponent<Props> = props => {
  return (
    <InfoScreenComponent
      onConfirm={props.onConfirm}
      confirmText={confirmText}
      image={image}
      body={body}
    />
  );
};

const mapDispatchToProps = (_: Dispatch) => ({
  // TODO: goto bonus details
  onConfirm: () => undefined
});

export default connect(
  null,
  mapDispatchToProps
)(ActivateBonusCompletedScreen);
