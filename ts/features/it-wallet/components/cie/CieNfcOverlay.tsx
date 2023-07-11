/**
 * A screen to check if the NFC in enabled on the device.
 * If not, alert/guide the user to activate it from device settings
 */
import { Content } from "native-base";
import * as React from "react";
import { Alert } from "react-native";
import I18n from "../../../../i18n";
import { openNFCSettings } from "../../../../utils/cie";
import { ReduxProps } from "../../../../store/actions/types";
import TopScreenComponent from "../../../../components/screens/TopScreenComponent";
import { ScreenContentHeader } from "../../../../components/screens/ScreenContentHeader";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { Body } from "../../../../components/core/typography/Body";
import { ITW_ROUTES } from "../../navigation/routes";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../navigation/params";

type NavigationProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_CIE_CARD_READER_SCREEN"
>;

type Props = ReduxProps & NavigationProps;

export default class CieNfcOverlay extends React.PureComponent<Props> {
  private handleOnPressActivateNFC = async () => {
    await openNFCSettings();
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
              screen: ITW_ROUTES.ACTIVATION.INFO
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
          icon={require("../../../../../img/icons/nfc-icon.png")}
        />
        <Content>
          <Body>{I18n.t("authentication.cie.nfc.enableNfcContent")}</Body>
        </Content>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={{
            onPress: this.handleOnPressActivateNFC,
            title: I18n.t("authentication.cie.nfc.enableNfcTitle")
          }}
        />
      </TopScreenComponent>
    );
  }
}
