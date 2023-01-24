import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { Button, Content, Text as NBButtonText } from "native-base";
import * as React from "react";
import { Image, Linking, StyleSheet, View } from "react-native";
import I18n from "../i18n";
import customVariables from "../theme/variables";
import { storeUrl } from "../utils/appVersion";
import { VSpacer } from "./core/spacer/Spacer";
import { Body } from "./core/typography/Body";
import { H1 } from "./core/typography/H1";
import { H3 } from "./core/typography/H3";
import { IOStyles } from "./core/variables/IOStyles";

type State = { hasError: boolean };

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    marginTop: customVariables.contentPadding,
    padding: customVariables.contentPadding
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
            style={IOStyles.selfCenter}
            source={require("../../img/icons/update-icon.png")}
          />
          <VSpacer size={40} />
        </React.Fragment>
        <View style={IOStyles.alignCenter}>
          <H1>{I18n.t("wallet.alert.titlePagoPaUpdateApp")}</H1>
        </View>
        <VSpacer size={16} />
        <Body>{I18n.t("wallet.alert.messagePagoPaUpdateApp")}</Body>
        <VSpacer size={16} />

        <Button
          block={true}
          primary={true}
          disabled={false}
          onPress={this.openAppStore}
        >
          {/* ButtonText */}
          <NBButtonText>{I18n.t("wallet.alert.btnUpdateApp")}</NBButtonText>
        </Button>

        <VSpacer size={16} />
        {this.state.hasError && (
          <React.Fragment>
            <VSpacer size={24} />
            <View style={IOStyles.alignCenter}>
              <H3>{I18n.t("wallet.alert.msgErrorUpdateApp")}</H3>
            </View>
          </React.Fragment>
        )}
      </Content>
    );
  }
}

export default RemindUpdatePagoPaVersionOverlay;
