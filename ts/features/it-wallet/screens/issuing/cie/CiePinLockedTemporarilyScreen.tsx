/**
 * A screen to alert the user about the number of attempts remains
 */
import { constNull } from "fp-ts/lib/function";
import { Content } from "native-base";
import * as React from "react";
import { Linking, Platform } from "react-native";
import { connect } from "react-redux";
import { ScreenContentHeader } from "../../../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import Markdown from "../../../../../components/ui/Markdown";
import I18n from "../../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import { ReduxProps } from "../../../../../store/actions/types";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { ItwParamsList } from "../../../navigation/params";
import { ITW_ROUTES } from "../../../navigation/routes";

type NavigationProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_CIE_PIN_TEMP_LOCKED_SCREEN"
>;

type Props = NavigationProps & ReduxProps;

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
      iconColor: IOColors.white,
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

  private handleGoBack = () =>
    this.props.navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ACTIVATION.INFO
    });

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
