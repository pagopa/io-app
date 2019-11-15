/**
 * A screen where invite the user to update app because the current version is unsupported
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

class UpdateAppModal extends React.PureComponent<{}> {
  // No Event on back button android
  private handleBackPress = () => {
    return true;
  };

  public componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  }

  public componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  }

  private openAppStore() {
    if (Platform.OS === "ios") {
      // TODO: when the app is open to the published replace the link to testflight with the io-app link
      // tslint:disable-next-line: no-floating-promises
      Linking.openURL(
        "itms-apps://itunes.apple.com/it/app/testflight/id899247664?mt=8"
      );
    } else {
      // tslint:disable-next-line: no-floating-promises
      Linking.openURL("market://details?id=it.teamdigitale.app.italiaapp");
    }
  }

  /**
   * Footer iOS button
   */
  private renderIosFooter() {
    return (
      <View footer={true}>
        <React.Fragment>
          <Button
            block={true}
            primary={true}
            onPress={() => this.openAppStore()}
          >
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
      title: I18n.t("global.buttons.cancel")
    };
    const updateButtonProps = {
      block: true,
      primary: true,
      onPress: () => this.openAppStore(),
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
            </View>
          </Container>
        </BaseScreenComponent>
        {Platform.OS === "android"
          ? this.renderAndroidFooter()
          : this.renderIosFooter()}
        <View />
      </Modal>
    );
  }
}

export default connect()(UpdateAppModal);
