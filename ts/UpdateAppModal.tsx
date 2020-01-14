/**
 * A screen to invite the user to update the app because current version is not supported yet
 *
 */

import { Button, Container, H2, Text, View } from "native-base";
import * as React from "react";
import {
  BackHandler,
  Image,
  Linking,
  Modal,
  Platform,
  StyleSheet
} from "react-native";
import { connect } from "react-redux";
import BaseScreenComponent from "./components/screens/BaseScreenComponent";
import FooterWithButtons from "./components/ui/FooterWithButtons";
import I18n from "./i18n";
import customVariables from "./theme/variables";

const styles = StyleSheet.create({
  text: {
    marginTop: customVariables.contentPadding,
    fontSize: 18
  },
  textDanger: {
    marginTop: customVariables.contentPadding,
    fontSize: 18,
    textAlign: "center",
    color: customVariables.brandDanger
  },
  container: {
    margin: customVariables.contentPadding,
    flex: 1,
    alignItems: "flex-start"
  },
  img: {
    marginTop: customVariables.contentPaddingLarge,
    alignSelf: "center"
  }
});

type State = { isLinkError: boolean };

class UpdateAppModal extends React.PureComponent<never, State> {
  constructor(props: never) {
    super(props);
    this.state = {
      isLinkError: false
    };
  }
  private idTimeout?: number;
  // No Event on back button android
  private handleBackPress = () => {
    return true;
  };

  public componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  }

  public componentWillUnmount() {
    if (this.idTimeout) {
      clearTimeout(this.idTimeout);
    }
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  }

  private openAppStore = () => {
    const storeUrl = Platform.select({
      ios: "itms-apps://itunes.apple.com/it/app/testflight/id899247664?mt=8",
      android: "market://details?id=it.teamdigitale.app.italiaapp"
    });
    Linking.openURL(storeUrl).catch(() => {
      // This state enables the display of an error message
      this.setState({
        isLinkError: true
      });
      // After 5 seconds restore state
      // tslint:disable-next-line: no-object-mutation
      this.idTimeout = setTimeout(() => {
        this.setState({
          isLinkError: false
        });
      }, 5000);
    });
  };

  /**
   * Footer iOS button
   */
  private renderIosFooter() {
    return (
      <View footer={true}>
        <React.Fragment>
          <Button block={true} primary={true} onPress={this.openAppStore}>
            <Text>{I18n.t("btnUpdateApp")}</Text>
          </Button>
          <View spacer={true} />
        </React.Fragment>
      </View>
    );
  }

  /**
   * Footer Android buttons
   */
  private renderAndroidFooter() {
    const cancelButtonProps = {
      cancel: true,
      block: true,
      onPress: () => BackHandler.exitApp(),
      title: I18n.t("global.buttons.close")
    };
    const updateButtonProps = {
      block: true,
      primary: true,
      onPress: this.openAppStore,
      title: I18n.t("btnUpdateApp")
    };

    return (
      <FooterWithButtons
        type="TwoButtonsInlineThird"
        leftButton={cancelButtonProps}
        rightButton={updateButtonProps}
      />
    );
  }

  // Different footer according to OS
  get footer() {
    return Platform.select({
      ios: this.renderIosFooter(),
      android: this.renderAndroidFooter()
    });
  }

  public render() {
    // Current version not supported
    return (
      <Modal>
        <BaseScreenComponent appLogo={true} goBack={false}>
          <Container>
            <View style={styles.container}>
              <H2>{I18n.t("titleUpdateApp")}</H2>
              <Text style={styles.text}>{I18n.t("messageUpdateApp")}</Text>
              <View spacer={true} large={true} />
              <Image
                style={styles.img}
                source={require("../img/icons/update-icon.png")}
              />
              <View spacer={true} />
              {this.state.isLinkError && (
                <Text style={styles.textDanger}>
                  {I18n.t("msgErrorUpdateApp")}
                </Text>
              )}
            </View>
          </Container>
        </BaseScreenComponent>
        {this.footer}
        <View />
      </Modal>
    );
  }
}

export default connect()(UpdateAppModal);
