/**
 * A screen to alert the user about the number of attempts remains
 */
import { Content } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Body, FooterWithButtons, VSpacer } from "@pagopa/io-app-design-system";
import { ScreenContentHeader } from "../../../../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../../../../components/screens/TopScreenComponent";
import I18n from "../../../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../../../navigation/ItwRoutes";

export type ItwCieWrongPinScreenNavigationParams = {
  remainingCount: number;
};

type NavigationProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_ISSUANCE_PID_CIE_WRONG_PIN_SCREEN"
>;

type Props = NavigationProps & ReturnType<typeof mapDispatchToProps>;

class ItwCieWrongPinScreen extends React.PureComponent<Props> {
  // TODO: use redux to handle control?
  private navigateToCiePinScreen = async () => {
    this.props.navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.PID.CIE.PIN_SCREEN
    });
  };

  private resetAuthentication = () => {
    this.props.navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.PID.AUTH_INFO
    });
  };

  get ciePinRemainingCount() {
    return this.props.route.params.remainingCount;
  }

  private renderFooterButtons = () => (
    <FooterWithButtons
      primary={{
        type: "Outline",
        buttonProps: {
          color: "primary",
          accessibilityLabel: I18n.t("global.buttons.cancel"),
          onPress: () => this.resetAuthentication(),
          label: I18n.t("global.buttons.cancel")
        }
      }}
      secondary={{
        type: "Solid",
        buttonProps: {
          color: "primary",
          accessibilityLabel: I18n.t("global.buttons.retry"),
          onPress: () => this.navigateToCiePinScreen(),
          label: I18n.t("global.buttons.retry")
        }
      }}
      type="TwoButtonsInlineHalf"
    />
  );

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

export default connect(undefined, mapDispatchToProps)(ItwCieWrongPinScreen);
