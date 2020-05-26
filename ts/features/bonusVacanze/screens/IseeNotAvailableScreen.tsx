import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { RTron } from "../../../boot/configureStoreAndPersistor";
import I18n from "../../../i18n";
import { FooterTwoButton } from "../components/markdown/FooterTwoButton";
import { MarkdownBaseScreen } from "../components/markdown/MarkdownBaseScreen";

type Props = ReturnType<typeof mapDispatchToProps>;

const markdownBody = I18n.t("bonus.bonusVacanza.iseeNotAvailable.text");
const title = I18n.t("bonus.bonusVacanza.iseeNotAvailable.title");
const subtitle = I18n.t("bonus.bonusVacanza.iseeNotAvailable.subtitle");
const gotoInps = I18n.t("bonus.bonusVacanza.iseeNotAvailable.goToINPSWebsite");

/**
 * This screen display some additional information when the ISEE is not available for the user.
 * It provides two CTA:
 * - Cancel: exit from the bonus request workflow
 * - Go to INPS website
 * The screen is tied to the business logic and is composed using {@link MarkdownBaseScreen} and {@link FooterTwoButton}
 * @param props
 * @constructor
 */

const IseeNotAvailableScreen: React.FunctionComponent<Props> = props => {
  return (
    <MarkdownBaseScreen
      title={title}
      subtitle={subtitle}
      markDown={markdownBody}
    >
      <FooterTwoButton
        onCancel={props.onCancel}
        onRight={props.onGoToINPSWebsite}
        title={gotoInps}
      />
    </MarkdownBaseScreen>
  );
};

const mapDispatchToProps = (_: Dispatch) => ({
  // TODO: link with the right dispatch action
  onCancel: () => {
    RTron.log("CANCEL");
  },
  // TODO: link with the right dispatch action
  onGoToINPSWebsite: () => {
    RTron.log("GOTO INPS");
  }
});

export default connect(mapDispatchToProps)(IseeNotAvailableScreen);
