/**
 * A screen to alert the user about the number of attempts remains
 */
import { Content } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { VSpacer } from "@pagopa/io-app-design-system";
import { Body } from "../../../components/core/typography/Body";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { AuthenticationParamsList } from "../../../navigation/params/AuthenticationParamsList";
import ROUTES from "../../../navigation/routes";
import { resetToAuthenticationRoute } from "../../../store/actions/navigation";

export type CieWrongCiePinScreenNavigationParams = {
  remainingCount: number;
};

type NavigationProps = IOStackNavigationRouteProps<
  AuthenticationParamsList,
  "CIE_WRONG_PIN_SCREEN"
>;

type Props = NavigationProps & ReturnType<typeof mapDispatchToProps>;

class CieWrongCiePinScreen extends React.PureComponent<Props> {
  // TODO: use redux to handle control?
  private navigateToCiePinScreen = async () => {
    this.props.navigation.navigate(ROUTES.AUTHENTICATION, {
      screen: ROUTES.CIE_PIN_SCREEN
    });
  };

  get ciePinRemainingCount() {
    return this.props.route.params.remainingCount;
  }

  private renderFooterButtons = () => {
    const cancelButtonProps = {
      bordered: true,
      onPress: resetToAuthenticationRoute,
      title: I18n.t("global.buttons.cancel")
    };
    const retryButtonProps = {
      primary: true,
      onPress: this.navigateToCiePinScreen,
      title: I18n.t("global.buttons.retry")
    };
    return (
      <FooterWithButtons
        type={"TwoButtonsInlineThird"}
        rightButton={retryButtonProps}
        leftButton={cancelButtonProps}
      />
    );
  };

  public render(): React.ReactNode {
    const remainingCount = this.ciePinRemainingCount;
    return (
      <TopScreenComponent
        goBack={false}
        headerTitle={I18n.t(
          "authentication.cie.pin.incorrectCiePinHeaderTitle"
        )}
      >
        <ScreenContentHeader
          title={I18n.t("authentication.cie.pin.incorrectCiePinTitle", {
            remainingCount
          })}
        />
        <Content>
          <Body>
            {I18n.t("authentication.cie.pin.incorrectCiePinContent1")}
          </Body>
          <VSpacer size={16} />
          <Body>
            {I18n.t("authentication.cie.pin.incorrectCiePinContent2")}
          </Body>
          <VSpacer size={16} />
        </Content>

        {this.renderFooterButtons()}
      </TopScreenComponent>
    );
  }
}
const mapDispatchToProps = (_: Dispatch) => ({});

export default connect(undefined, mapDispatchToProps)(CieWrongCiePinScreen);
