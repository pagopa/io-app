import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../../i18n";
import { cancelButtonProps } from "../../../components/buttons/ButtonConfigurations";
import { FooterStackButton } from "../../../components/buttons/FooterStackButtons";
import { renderIconImage } from "../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";

type Props = ReturnType<typeof mapDispatchToProps>;

/**
 * This screen informs the user that the bonus has been activated!
 * It allows only one CTA: goto -> display bonus details
 * The screen is tied to the business logic and is composed using {@link InfoScreenComponent}
 * @param props
 * @constructor
 */

const ActivateBonusCompletedScreen: React.FunctionComponent<Props> = props => {
  const body = I18n.t(
    "bonus.bonusVacanza.eligibility.activate.completed.description"
  );
  const confirmText = I18n.t(
    "bonus.bonusVacanza.eligibility.activate.goToDetails"
  );

  return (
    <>
      <InfoScreenComponent image={renderIconImage("io-complete")} body={body} />
      <FooterStackButton
        buttons={[cancelButtonProps(props.onConfirm, confirmText)]}
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
