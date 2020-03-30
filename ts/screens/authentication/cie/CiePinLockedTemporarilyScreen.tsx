/**
 * A screen to alert the user about the number of attempts remains
 */
import { Content } from "native-base";
import * as React from "react";
import { Linking } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import Markdown from "../../../components/ui/Markdown";
import I18n from "../../../i18n";
import { resetToAuthenticationRoute } from "../../../store/actions/navigation";
import { ReduxProps } from "../../../store/actions/types";

type Props = NavigationScreenProps & ReduxProps;

type State = Readonly<{
  isLoadingCompleted: boolean;
}>;

class CiePinLockedTemporarilyScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isLoadingCompleted: false };
  }
  private goToCieID() {
    const url = "https://play.google.com/store/apps/details?id=it.ipzs.cieid";
    Linking.openURL(url).catch(_ => undefined);
  }
  private renderFooterButtons = () => {
    const cancelButtonProps = {
      cancel: true,
      onPress: this.handleGoBack,
      title: I18n.t("global.buttons.cancel")
    };
    const retryButtonProps = {
      primary: true,
      iconName: "io-cie",
      onPress: this.goToCieID, // TODO: if the app is installed, redirect to the page dedicated to rpin recovery
      title: I18n.t("authentication.cie.pinTempLocked.button")
    };
    return (
      <FooterWithButtons
        type={"TwoButtonsInlineThird"}
        rightButton={retryButtonProps}
        leftButton={cancelButtonProps}
      />
    );
  };
  private handleGoBack = () => this.props.dispatch(resetToAuthenticationRoute);

  public render(): React.ReactNode {
    return (
      <TopScreenComponent
        goBack={this.handleGoBack}
        headerTitle={I18n.t("authentication.cie.pinTempLocked.header")} // TODO: validate
      >
        <ScreenContentHeader
          title={I18n.t("authentication.cie.pinTempLocked.title")}
        />
        <Content>
          <Markdown
            onLoadEnd={() => {
              this.setState({ isLoadingCompleted: true });
            }}
          >
            {I18n.t("authentication.cie.pinTempLocked.content")}
          </Markdown>
        </Content>

        {this.state.isLoadingCompleted && this.renderFooterButtons()}
      </TopScreenComponent>
    );
  }
}

export default connect()(CiePinLockedTemporarilyScreen);
