import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../i18n";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../components/buttons/ButtonConfigurations";
import { FooterStackButton } from "../../components/buttons/FooterStackButtons";
import { renderRasterImage } from "../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../components/infoScreen/InfoScreenComponent";

type Props = ReturnType<typeof mapDispatchToProps>;

const image = require("../../../../../img/servicesStatus/error-detail-icon.png");

/**
 * This screen display some additional information when the ISEE is not eligible for the bonus vacanza.
 * It provides three CTA:
 * - goToDsu: goto INPS website to submit a new DSU
 * - goToSimulation: goto INPS website to do a simulation
 * - cancelRequest: abort the request
 * The screen is tied to the business logic and is composed using {@link InfoScreenComponent} and {@link FooterStackButton}
 * @param props
 * @constructor
 */

const IseeNotEligibleScreen: React.FunctionComponent<Props> = props => {
  const title = I18n.t("bonus.bonusVacanza.eligibility.iseeNotEligible.title");
  const body = I18n.t("bonus.bonusVacanza.eligibility.iseeNotEligible.text");
  const goToDsu = I18n.t(
    "bonus.bonusVacanza.eligibility.iseeNotEligible.goToNewDSU"
  );
  const goToSimulation = I18n.t(
    "bonus.bonusVacanza.eligibility.iseeNotEligible.goToNewSimulation"
  );

  const cancelRequest = I18n.t("bonus.bonusVacanza.cta.cancelRequest");

  return (
    <>
      <InfoScreenComponent
        image={renderRasterImage(image)}
        title={title}
        body={body}
      />
      <FooterStackButton
        buttons={[
          confirmButtonProps(props.onGoToDsu, goToDsu),
          confirmButtonProps(props.onGoToSimulation, goToSimulation),
          cancelButtonProps(props.onCancel, cancelRequest)
        ]}
      />
    </>
  );
};

const mapDispatchToProps = (_: Dispatch) => ({
  // TODO: link with the right dispatch action
  onGoToDsu: () => undefined,
  // TODO: link with the right dispatch action
  onGoToSimulation: () => undefined,
  // TODO: link with the right dispatch action
  onCancel: () => undefined
});

export default connect(mapDispatchToProps)(IseeNotEligibleScreen);
