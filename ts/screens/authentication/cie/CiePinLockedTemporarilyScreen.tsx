/**
 * A screen to alert the user about the number of attempts remains
 */
import { Content } from "native-base";
import * as React from "react";
import { Linking, Platform } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import { constNull } from "fp-ts/lib/function";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import Markdown from "../../../components/ui/Markdown";
import I18n from "../../../i18n";
import { resetToAuthenticationRoute } from "../../../store/actions/navigation";
import { ReduxProps } from "../../../store/actions/types";
import variables from "../../../theme/variables";

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
    Linking.openURL(
      Platform.select({
        ios: "https://apps.apple.com/it/app/cieid/id1504644677",
        default: "https://play.google.com/store/apps/details?id=it.ipzs.cieid"
      })
    ).catch(constNull);
  }

  private getContextualHelp = () => ({
    title: I18n.t("authentication.cie.pin.contextualHelpTitle"),
    body: () => (
      <Markdown>{I18n.t("authentication.cie.pin.contextualHelpBody")}</Markdown>
    )
  });

  private renderFooterButtons = () => {
    const cancelButtonProps = {
      bordered: true,
      onPress: this.handleGoBack,
      title: I18n.t("global.buttons.cancel")
    };
    const retryButtonProps = {
      primary: true,
      iconColor: variables.colorWhite,
      iconName: "io-cie",
      onPress: this.goToCieID,
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
        contextualHelp={this.getContextualHelp()}
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
