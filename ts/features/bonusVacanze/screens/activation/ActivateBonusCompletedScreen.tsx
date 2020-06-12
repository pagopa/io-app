import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../i18n";
import { confirmButtonProps } from "../../components/buttons/ButtonConfigurations";
import { FooterStackButton } from "../../components/buttons/FooterStackButtons";
import { renderRasterImage } from "../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../components/infoScreen/InfoScreenComponent";

type Props = ReturnType<typeof mapDispatchToProps>;

const image = require("../../../../../img/bonus/bonusVacanze/vacanze.png");

/**
 * This screen informs the user that the bonus has been activated!
 * It allows only one CTA: goto -> display bonus details
 * The screen is tied to the business logic and is composed using {@link InfoScreenComponent}
 * @param props
 * @constructor
 */

const ActivateBonusCompletedScreen: React.FunctionComponent<Props> = props => {
  const title = I18n.t(
    "bonus.bonusVacanza.eligibility.activate.completed.title"
  );
  const body = I18n.t(
    "bonus.bonusVacanza.eligibility.activate.completed.description"
  );
  const goToBonusDetail = I18n.t(
    "bonus.bonusVacanza.eligibility.activate.goToDetails"
  );

  return (
    <>
      <InfoScreenComponent
        image={renderRasterImage(image)}
        title={title}
        body={body}
      />
      <FooterStackButton
        buttons={[confirmButtonProps(props.onConfirm, goToBonusDetail)]}
      />
    </>
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
