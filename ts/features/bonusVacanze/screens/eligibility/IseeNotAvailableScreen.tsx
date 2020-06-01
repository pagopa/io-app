import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import I18n from "../../../../i18n";
import { FooterTwoButtons } from "../../components/markdown/FooterTwoButtons";
import { MarkdownBaseScreen } from "../../components/markdown/MarkdownBaseScreen";

type Props = ReturnType<typeof mapDispatchToProps>;

const markdownBody = I18n.t(
  "bonus.bonusVacanza.eligibility.iseeNotAvailable.text"
);
const title = I18n.t("bonus.bonusVacanza.eligibility.iseeNotAvailable.title");
const subtitle = I18n.t(
  "bonus.bonusVacanza.eligibility.iseeNotAvailable.subtitle"
);
const gotoInps = I18n.t(
  "bonus.bonusVacanza.eligibility.iseeNotAvailable.goToINPSWebsite"
);

/**
 * This screen display some additional information when the ISEE is not available for the user.
 * It provides two CTA:
 * - Cancel: exit from the bonus request workflow
 * - Go to INPS website
 * The screen is tied to the business logic and is composed using {@link MarkdownBaseScreen} and {@link FooterTwoButtons}
 * @param props
 * @constructor
 */

const IseeNotAvailableScreen: React.FunctionComponent<Props> = props => {
  return (
    <MarkdownBaseScreen
      navigationTitle={title}
      title={title}
      subtitle={subtitle}
      markDown={markdownBody}
    >
      <FooterTwoButtons
        onCancel={props.onCancel}
        onRight={props.onGoToINPSWebsite}
        title={gotoInps}
      />
    </MarkdownBaseScreen>
  );
};

const mapDispatchToProps = (_: Dispatch) => ({
  // TODO: link with the right dispatch action
  onCancel: () => undefined,
  // TODO: link with the right dispatch action
  onGoToINPSWebsite: () => undefined
});

export default connect(mapDispatchToProps)(IseeNotAvailableScreen);
