import { Millisecond } from "italia-ts-commons/lib/units";
import { Button, Content, H2, Text, View } from "native-base";
import * as React from "react";
import { Image, Linking, StyleSheet } from "react-native";
import I18n from "../i18n";
import customVariables from "../theme/variables";
import { storeUrl } from "../utils/appVersion";

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

class RemindUpdatePagoPaVersionOverlay extends React.PureComponent<{}, State> {
  constructor(props: {}) {
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
      // tslint:disable-next-line: no-object-mutation
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
        <H2 style={styles.title}>
          {I18n.t("wallet.alert.titlePagoPaUpdateApp")}
        </H2>
        <View spacer={true} />
        <Text>{I18n.t("wallet.alert.messagePagoPaUpdateApp")}</Text>
        <View spacer={true} />

        <Button
          block={true}
          primary={true}
          disabled={false}
          onPress={this.openAppStore}
        >
          <Text>{I18n.t("wallet.alert.btnUpdateApp")}</Text>
        </Button>

        <View spacer={true} />
        {this.state.hasError && (
          <React.Fragment>
            <View spacer={true} />
            <Text style={styles.textDanger}>
              {I18n.t("wallet.alert.msgErrorUpdateApp")}
            </Text>
          </React.Fragment>
        )}
      </Content>
    );
  }
}

export default RemindUpdatePagoPaVersionOverlay;
