import { Container, H1, Text, View } from "native-base";
import * as React from "react";
import { Alert, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import ScreenHeader from "../../components/ScreenHeader";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { ReduxProps } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import { isNfcEnabled, openNFCSettings } from "../../utils/cie";

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

class NfcDisabledScreen extends React.Component<Props, State> {
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

  public async componentDidMount() {
    await this.updateNfcState();
  }

  private handlePressContinue = async () => {
    // TODO: use CIE-module to open the NFC-OS settings page and then refresh the status
    // (if nfc is enabled or not) to
    // handle the navigation properly
    await openNFCSettings();
  };

  public async componentDidUpdate(prevProps: Props, prevState: State) {
    // When app becomes active from background the state of nfc
    // must be updated
    if (
      prevProps.appState === "background" &&
      this.props.appState === "active"
    ) {
      await this.updateNfcState();
    }
    if (!prevState.isNfcEnabled && this.state.isNfcEnabled) {
      this.props.navigation.navigate(ROUTES.CIE_NFC_ENABLED);
    }
  }

  public render(): React.ReactNode {
    return (
      <Container>
        <BaseScreenComponent goBack={true}>
          <ScreenHeader
            heading={<H1>{I18n.t("authentication.cie.enableNfcTitle")}</H1>}
            icon={require("../../../img/icons/nfc-icon.png")}
          />
          <View style={styles.contentContainerStyle}>
            <Text style={styles.text}>
              {I18n.t("authentication.cie.enableNfcContent")}
            </Text>
            <View spacer={true} />
            <Text
              link={true}
              // TODO Add redirect to SPID and CIE information screen https://www.pivotaltracker.com/story/show/169167508
              onPress={() => Alert.alert(I18n.t("global.notImplemented"))}
            >
              {I18n.t("authentication.cie.enableNfcHelp")}
            </Text>
          </View>
        </BaseScreenComponent>
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
            onPress: this.handlePressContinue,
            title: I18n.t("authentication.cie.enableNfcTitle"),
            block: true
          }}
        />
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  appState: state.appState.appState
});
export default connect(mapStateToProps)(NfcDisabledScreen);
