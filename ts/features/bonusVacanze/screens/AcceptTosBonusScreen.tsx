import * as React from "react";
import { connect } from "react-redux";
import I18n from "../../../i18n";
import { navigateBack } from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import { FooterTwoButtons } from "../components/markdown/FooterTwoButtons";
import { MarkdownBaseScreen } from "../components/markdown/MarkdownBaseScreen";

type Props = ReturnType<typeof mapDispatchToProps>;

/**
 * Component to show the TOS for the bonus activation flow
 */
const AcceptTosBonusScreen: React.FunctionComponent<Props> = props => {
  return (
    <MarkdownBaseScreen
      navigationTitle={I18n.t("bonus.tos.title")}
      markDown={I18n.t("bonus.tos.content")}
      hideHeader={true}
    >
      <FooterTwoButtons
        onCancel={props.navigateBack}
        onRight={props.acceptTos}
        title={I18n.t("onboarding.tos.accept")}
      />
    </MarkdownBaseScreen>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  acceptTos: () => null,
  navigateBack: () => dispatch(navigateBack())
});

export default connect(
  undefined,
  mapDispatchToProps
)(AcceptTosBonusScreen);
