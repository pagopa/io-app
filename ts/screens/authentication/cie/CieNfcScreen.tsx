/**
 * A screen to check if the NFC in enabled on the device.
 * If not, alert/guide the user to activate it from device settings
 */
import { Container, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import variables from "../../../theme/variables";
import { isNfcEnabled, openNFCSettings } from "../../../utils/cie";

type Props = NavigationInjectedProps;

type State = {
  isNfcEnabled: boolean;
};

const styles = StyleSheet.create({
  contentContainerStyle: {
    padding: variables.contentPadding
  },
  text: {
    fontSize: variables.fontSizeBase
  }
});

export default class CieNfcScreen extends React.Component<Props, State> {
  private idInterval?: number;
  constructor(props: Props) {
    super(props);
    this.state = { isNfcEnabled: false };
  }

  private updateNfcState = async () => {
    const isNfcOn = await isNfcEnabled();
    this.setState({ isNfcEnabled: isNfcOn });
  };

  private checkNfcState = async () => {
    // it is executed repeatedly to check the nfc state
    // we avoid to listen app state change because in most case, when user opens
    // the nfc settings and then comes back the app doesn't change state
    // tslint:disable-next-line: no-object-mutation
    this.idInterval = setTimeout(async () => {
      await this.updateNfcState();
      await this.checkNfcState();
    }, 300);
  };

  public async componentDidMount() {
    await this.checkNfcState();
  }

  public componentWillUnmount() {
    clearTimeout(this.idInterval);
  }

  private handleOnPressActivateNFC = async () => {
    await openNFCSettings();
  };

  private handleOnPressContinue = () => {
    clearTimeout(this.idInterval);
    this.props.navigation.navigate(ROUTES.CIE_PIN_SCREEN);
  };

  private renderFooter = () => {
    if (this.state.isNfcEnabled) {
      return (
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={{
            cancel: true,
            onPress: this.props.navigation.goBack,
            title: I18n.t("global.buttons.cancel"),
            block: true
          }}
          rightButton={{
            onPress: this.handleOnPressContinue,
            title: I18n.t("global.buttons.continue"),
            block: true
          }}
        />
      );
    } else {
      return (
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={{
            cancel: true,
            onPress: this.props.navigation.goBack,
            title: I18n.t("global.buttons.cancel"),
            block: true
          }}
          rightButton={{
            onPress: this.handleOnPressActivateNFC,
            title: I18n.t("authentication.cie.nfc.enableNfcTitle"),
            block: true
          }}
        />
      );
    }
  };

  public render(): React.ReactNode {
    const heading = this.state.isNfcEnabled
      ? I18n.t("authentication.cie.nfc.nfcEnabledTitle")
      : I18n.t("authentication.cie.nfc.enableNfcTitle");

    const content = this.state.isNfcEnabled
      ? I18n.t("authentication.cie.nfc.nfcEnabledContent")
      : I18n.t("authentication.cie.nfc.enableNfcContent");

    return (
      <Container>
        <TopScreenComponent
          goBack={true}
          title={I18n.t("authentication.cie.nfc.enableNfcHeader")}
        >
          <ScreenContentHeader
            title={heading}
            icon={require("../../../../img/icons/nfc-icon.png")}
          />
          <View style={styles.contentContainerStyle}>
            <Text style={styles.text}>{content}</Text>
          </View>
        </TopScreenComponent>
        {this.renderFooter()}
      </Container>
    );
  }
}
