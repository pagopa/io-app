import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../i18n";
import { confirmButtonProps } from "../../components/buttons/ButtonConfigurations";
import { FooterStackButton } from "../../components/buttons/FooterStackButtons";
import { renderRasterImage } from "../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../components/infoScreen/InfoScreenComponent";

type Props = ReturnType<typeof mapDispatchToProps>;

const image = require("../../../../../img/servicesStatus/error-detail-icon.png");

/**
 * This screen informs the user that the bonus cannot be activated because another active or redeemed
 * bonus related to this user was found.
 * It allows only one CTA: exit
 * The screen is tied to the business logic and is composed using {@link InfoScreenComponent}
 * @param props
 * @constructor
 */

const BonusAlreadyExists: React.FunctionComponent<Props> = props => {
  const title = I18n.t(
    "bonus.bonusVacanza.eligibility.activate.alreadyRedeemed.title"
  );
  const body = I18n.t(
    "bonus.bonusVacanza.eligibility.activate.alreadyRedeemed.body"
  );
  const cancel = I18n.t("bonus.bonusVacanza.cta.cancelRequest");

  return (
    <>
      <InfoScreenComponent
        image={renderRasterImage(image)}
        title={title}
        body={body}
      />
      <FooterStackButton
        buttons={[confirmButtonProps(props.onCancel, cancel)]}
      />
    </>
  );
};

const mapDispatchToProps = (_: Dispatch) => ({
  onCancel: () => undefined
});

export default connect(
  null,
  mapDispatchToProps
)(BonusAlreadyExists);
