import { Millisecond } from "italia-ts-commons/lib/units";
import { Button, Text, View, Content } from "native-base";
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
import { storeUrl } from "./utils/appVersion";
import { ScreenContentHeader } from './components/screens/ScreenContentHeader';

const timeoutErrorMsg: Millisecond = 5000 as Millisecond;

const styles = StyleSheet.create({
  text: {
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

type State = { hasError: boolean };

/**
 * A screen to invite the user to update the app because current version is not supported yet
 *
 */
class UpdateAppModal extends React.PureComponent<never, State> {
  constructor(props: never) {
    super(props);
    this.state = {
      hasError: false
    };
  }
  private idTimeout?: number;

  // No Event on back button android
  private handleBackPress = () => {
    return true;
  };

  public componentWillUnmount() {
    if (this.idTimeout) {
      clearTimeout(this.idTimeout);
    }
  }

  private openAppStore = () => {
    // the error is already displayed
    if (this.state.hasError) {
      return;
    }
    Linking.openURL(storeUrl).catch(() => {
      // Change state to show the error message
      this.setState({
        hasError: true
      });
      // After 5 seconds restore state
      // tslint:disable-next-line: no-object-mutation
      this.idTimeout = setTimeout(() => {
        this.setState({
          hasError: false
        });
      }, timeoutErrorMsg);
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
        <BaseScreenComponent appLogo={true} goBack={this.handleBackPress} isModal={true}>
          <ScreenContentHeader title={I18n.t("titleUpdateApp")}/>
          <Content>
              <Text style={styles.text}>{I18n.t("messageUpdateApp")}</Text>
              <Image
                style={styles.img}
                source={require("../img/icons/update-icon.png")}
              />
              {this.state.hasError && (
                <Text style={styles.textDanger}>
                  {I18n.t("msgErrorUpdateApp")}
                </Text>
              )}
            </Content>
            {this.footer}
        </BaseScreenComponent>
      </Modal>
    );
  }
}

export default connect()(UpdateAppModal);
