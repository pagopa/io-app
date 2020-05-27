import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { RTron } from "../../../../boot/configureStoreAndPersistor";
import { ActivateBonusComponent } from "./ActivateBonusComponent";

type Props = ReturnType<typeof mapDispatchToProps>;

/**
 * This screen display some additional information when the ISEE is not available for the user.
 * It provides two CTA:
 * - Cancel: exit from the bonus request workflow
 * - Go to INPS website
 * The screen is tied to the business logic and is composed using {@link MarkdownBaseScreen} and {@link FooterTwoButtons}
 * @param props
 * @constructor
 */

const ActivateBonusScreen: React.FunctionComponent<Props> = props => {
  return <ActivateBonusComponent />;
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

export default connect(mapDispatchToProps)(ActivateBonusScreen);
