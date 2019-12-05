import { Container, H1, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import ScreenHeader from "../../../components/ScreenHeader";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import { ReduxProps } from "../../../store/actions/types";
import { GlobalState } from "../../../store/reducers/types";
import variables from "../../../theme/variables";
import { isNfcEnabled, openNFCSettings } from "../../../utils/cie";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}> &
  ReturnType<typeof mapStateToProps> &
  ReduxProps;

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

class CieNfcScreen extends React.Component<Props, State> {
  private idInterval?: number;
  constructor(props: Props) {
    super(props);
    this.state = { isNfcEnabled: false };
  }

  private updateNfcState = async () => {
    const isNfcOn = await isNfcEnabled();
    if (this.state.isNfcEnabled !== isNfcOn) {
      this.setState({ isNfcEnabled: isNfcOn });
    }
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
            cancel: false,
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
            cancel: false,
            onPress: this.handleOnPressActivateNFC,
            title: I18n.t("authentication.cie.enableNfcTitle"),
            block: true
          }}
        />
      );
    }
  };

  public render(): React.ReactNode {
    const heading = this.state.isNfcEnabled
      ? I18n.t("authentication.cie.nfcEnabledTitle")
      : I18n.t("authentication.cie.enableNfcTitle");

    const content = this.state.isNfcEnabled
      ? I18n.t("authentication.cie.nfcEnabledContent")
      : I18n.t("authentication.cie.enableNfcContent");

    return (
      <Container>
        <BaseScreenComponent goBack={true}>
          <ScreenHeader
            heading={<H1>{heading}</H1>}
            icon={require("../../../../img/icons/nfc-icon.png")}
          />
          <View style={styles.contentContainerStyle}>
            <Text style={styles.text}>{content}</Text>
          </View>
        </BaseScreenComponent>
        {this.renderFooter()}
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  appState: state.appState.appState
});
export default connect(mapStateToProps)(CieNfcScreen);
