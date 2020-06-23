import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../../i18n";
import { cancelBonusRequest } from "../../../store/actions/bonusVacanze";
import { BaseIseeErrorComponent } from "./BaseIseeErrorComponent";

type Props = ReturnType<typeof mapDispatchToProps>;

const image = require("../../../../../../img/servicesStatus/error-detail-icon.png");

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

  return (
    <BaseIseeErrorComponent
      image={image}
      title={title}
      body={body}
      onCancel={props.onCancel}
      ctaText={goToDsu}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // TODO: link with the right dispatch action
  onCancel: () => dispatch(cancelBonusRequest())
});

export default connect(
  null,
  mapDispatchToProps
)(IseeNotEligibleScreen);
