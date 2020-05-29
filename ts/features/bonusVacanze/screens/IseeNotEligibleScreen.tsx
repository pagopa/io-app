import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { RTron } from "../../../boot/configureStoreAndPersistor";
import I18n from "../../../i18n";
import { FooterSingleButton } from "../components/markdown/FooterSingleButton";
import { MarkdownBaseScreen } from "../components/markdown/MarkdownBaseScreen";

type Props = ReturnType<typeof mapDispatchToProps>;

const markdownBody = I18n.t("bonus.bonusVacanza.iseeNotEligible.text");
const title = I18n.t("bonus.bonusVacanza.iseeNotEligible.title");
const subtitle = I18n.t("bonus.bonusVacanza.iseeNotEligible.subtitle");

/**
 * This screen display some additional information when the ISEE is not eligible for the bonus vacanza.
 * It provides one CTA:
 * - Cancel: exit from the bonus request workflow
 * The screen is tied to the business logic and is composed using {@link MarkdownBaseScreen} and {@link FooterSingleButton}
 * @param props
 * @constructor
 */

const IseeNotEligibleScreen: React.FunctionComponent<Props> = props => {
  return (
    <MarkdownBaseScreen
      navigationTitle={title}
      title={title}
      subtitle={subtitle}
      markDown={markdownBody}
    >
      <FooterSingleButton onCancel={props.onCancel} />
    </MarkdownBaseScreen>
  );
};

const mapDispatchToProps = (_: Dispatch) => ({
  // TODO: link with the right dispatch action
  onCancel: () => {
    RTron.log("CANCEL");
  }
});

export default connect(mapDispatchToProps)(IseeNotEligibleScreen);
