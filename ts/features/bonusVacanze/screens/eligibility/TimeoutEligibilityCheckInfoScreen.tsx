import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../i18n";
import { navigateToWalletHome } from "../../../../store/actions/navigation";
import { cancelButtonProps } from "../../components/buttons/ButtonConfigurations";
import { FooterStackButton } from "../../components/buttons/FooterStackButtons";
import { renderRasterImage } from "../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../components/infoScreen/InfoScreenComponent";

type Props = ReturnType<typeof mapDispatchToProps>;

const image = require("../../../../../img/wallet/errors/payment-expired-icon.png");

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
  const title = I18n.t("bonus.bonusVacanza.eligibility.timeout.title");
  const body = I18n.t("bonus.bonusVacanza.eligibility.timeout.description");
  const confirmText = I18n.t("global.buttons.exit");
  return (
    <>
      <InfoScreenComponent
        image={renderRasterImage(image)}
        title={title}
        body={body}
      />
      <FooterStackButton
        buttons={[cancelButtonProps(props.onConfirm, confirmText)]}
      />
    </>
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
