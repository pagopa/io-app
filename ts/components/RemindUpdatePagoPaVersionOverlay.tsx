import { Millisecond } from "italia-ts-commons/lib/units";
import { Button, Content, Text as NBText, View } from "native-base";
import * as React from "react";
import { Image, Linking, StyleSheet } from "react-native";
import I18n from "../i18n";
import customVariables from "../theme/variables";
import { storeUrl } from "../utils/appVersion";
import { H1 } from "./core/typography/H1";

type State = { hasError: boolean };

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    marginTop: customVariables.contentPadding,
    padding: customVariables.contentPadding
  },
  imageChecked: {
    alignSelf: "center"
  },
  title: {
    textAlign: "center"
  },
  textDanger: {
    marginTop: customVariables.contentPadding,
    fontSize: 18,
    textAlign: "center",
    color: customVariables.brandDanger
  }
});

const timeoutErrorMsg: Millisecond = 5000 as Millisecond;

class RemindUpdatePagoPaVersionOverlay extends React.PureComponent<
  Record<string, unknown>,
  State
> {
  constructor(props: Record<string, unknown>) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  private idTimeout?: number;

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
    // storeUrl is not a webUrl, try to open it
    Linking.openURL(storeUrl).catch(() => {
      // Change state to show the error message
      this.setState({
        hasError: true
      });
      // After 5 seconds restore state
      // eslint-disable-next-line
      this.idTimeout = setTimeout(() => {
        this.setState({
          hasError: false
        });
      }, timeoutErrorMsg);
    });
  };

  public render() {
    return (
      <Content style={styles.container}>
        <React.Fragment>
          <Image
            style={styles.imageChecked}
            source={require("../../img/icons/update-icon.png")}
          />
          <View spacer={true} extralarge={true} />
        </React.Fragment>
        <H1 style={styles.title}>
          {I18n.t("wallet.alert.titlePagoPaUpdateApp")}
        </H1>
        <View spacer={true} />
        <NBText>{I18n.t("wallet.alert.messagePagoPaUpdateApp")}</NBText>
        <View spacer={true} />

        <Button
          block={true}
          primary={true}
          disabled={false}
          onPress={this.openAppStore}
        >
          <NBText>{I18n.t("wallet.alert.btnUpdateApp")}</NBText>
        </Button>

        <View spacer={true} />
        {this.state.hasError && (
          <React.Fragment>
            <View spacer={true} />
            <NBText style={styles.textDanger}>
              {I18n.t("wallet.alert.msgErrorUpdateApp")}
            </NBText>
          </React.Fragment>
        )}
      </Content>
    );
  }
}

export default RemindUpdatePagoPaVersionOverlay;
