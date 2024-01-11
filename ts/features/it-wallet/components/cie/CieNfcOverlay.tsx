/**
 * A screen to check if the NFC in enabled on the device.
 * If not, alert/guide the user to activate it from device settings
 */
import { Content } from "native-base";
import * as React from "react";
import { Alert } from "react-native";
import { Body, FooterWithButtons } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { ReduxProps } from "../../../../store/actions/types";
import TopScreenComponent from "../../../../components/screens/TopScreenComponent";
import { ScreenContentHeader } from "../../../../components/screens/ScreenContentHeader";
import { ITW_ROUTES } from "../../navigation/ItwRoutes";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { itwOpenNFCSettings } from "../../utils/itwCieUtils";

type NavigationProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_ISSUANCE_PID_CIE_CARD_READER_SCREEN"
>;

type Props = ReduxProps & NavigationProps;

export default class CieNfcOverlay extends React.PureComponent<Props> {
  private handleOnPressActivateNFC = async () => {
    await itwOpenNFCSettings();
  };

  // FIX ME: the same alert is displayed during all the onboarding
  private handleGoBack = () =>
    Alert.alert(
      I18n.t("onboarding.alert.title"),
      I18n.t("onboarding.alert.description"),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.exit"),
          style: "default",
          onPress: () =>
            this.props.navigation.navigate(ITW_ROUTES.MAIN, {
              screen: ITW_ROUTES.ISSUANCE.PID.AUTH_INFO
            })
        }
      ]
    );

  public render(): React.ReactNode {
    return (
      <TopScreenComponent
        goBack={this.handleGoBack}
        headerTitle={I18n.t("authentication.cie.nfc.enableNfcHeader")}
      >
        <ScreenContentHeader
          title={I18n.t("authentication.cie.nfc.enableNfcTitle")}
          rasterIcon={require("../../../../../img/icons/nfc-icon.png")}
        />
        <Content>
          <Body>{I18n.t("authentication.cie.nfc.enableNfcContent")}</Body>
        </Content>
        <FooterWithButtons
          primary={{
            type: "Outline",
            buttonProps: {
              color: "primary",
              accessibilityLabel: I18n.t(
                "authentication.cie.nfc.enableNfcTitle"
              ),
              onPress: () => this.handleOnPressActivateNFC,
              label: I18n.t("authentication.cie.nfc.enableNfcTitle")
            }
          }}
          type="SingleButton"
        />
      </TopScreenComponent>
    );
  }
}
