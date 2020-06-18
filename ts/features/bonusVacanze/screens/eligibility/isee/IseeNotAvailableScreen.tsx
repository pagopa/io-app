import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import I18n from "../../../../../i18n";
import { cancelBonusRequest } from "../../../store/actions/bonusVacanze";
import { BaseIseeErrorComponent } from "./BaseIseeErrorComponent";

type Props = ReturnType<typeof mapDispatchToProps>;

const image = require("../../../../../../img/search/search-icon.png");

/**
 * This screen display some additional information when the ISEE is not available for the user.
 * It provides three CTA:
 * - goToDsu: goto INPS website to submit a new DSU
 * - goToSimulation: goto INPS website to do a simulation
 * - cancelRequest: abort the request
 * The screen is tied to the business logic and is composed using {@link MarkdownBaseScreen} and {@link FooterTwoButtons}
 * @param props
 * @constructor
 */

const IseeNotAvailableScreen: React.FunctionComponent<Props> = props => {
  const title = I18n.t("bonus.bonusVacanza.eligibility.iseeNotAvailable.title");
  const body = I18n.t("bonus.bonusVacanza.eligibility.iseeNotAvailable.text");

  return (
    <BaseIseeErrorComponent
      image={image}
      title={title}
      body={body}
      onCancel={props.onCancel}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onCancel: () => dispatch(cancelBonusRequest())
});

export default connect(
  null,
  mapDispatchToProps
)(IseeNotAvailableScreen);
