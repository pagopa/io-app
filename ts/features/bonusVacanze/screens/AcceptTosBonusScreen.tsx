import { Content } from "native-base";
import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../../components/screens/EdgeBorderComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import Markdown from "../../../components/ui/Markdown";
import I18n from "../../../i18n";
import { navigateBack } from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";

type Props = ReturnType<typeof mapDispatchToProps>;

type State = {
  isMarkdownLoaded: boolean;
};
class AcceptTosBonusScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isMarkdownLoaded: false
    };
  }

  public render() {
    const { isMarkdownLoaded } = this.state;

    const ContainerComponent = withLoadingSpinner(() => (
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("bonus.tos.title")}
      >
        <Content>
          <Markdown onLoadEnd={() => this.setState({ isMarkdownLoaded: true })}>
            {/* TODO Replace with correct TOS */
            I18n.t("bonus.tos.content")}
          </Markdown>
          {isMarkdownLoaded && <EdgeBorderComponent />}
          <View spacer={true} large={true} />
        </Content>
        {isMarkdownLoaded && (
          <FooterWithButtons
            type={"TwoButtonsInlineHalf"}
            rightButton={{
              block: true,
              primary: true,
              onPress: this.props.acceptTos,
              title: I18n.t("onboarding.tos.accept")
            }}
            leftButton={{
              cancel: true,
              block: true,
              onPress: this.props.navigateBack,
              title: I18n.t("global.buttons.cancel")
            }}
          />
        )}
      </BaseScreenComponent>
    ));
    return <ContainerComponent isLoading={!isMarkdownLoaded} />;
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  acceptTos: () => null,
  navigateBack: () => dispatch(navigateBack())
});

export default connect(
  undefined,
  mapDispatchToProps
)(AcceptTosBonusScreen);
