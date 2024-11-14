import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as React from "react";
import { Image, Linking, StyleSheet, View } from "react-native";
import {
  Body,
  ButtonSolid,
  H2,
  H6,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "../i18n";
import customVariables from "../theme/variables";
import { storeUrl } from "../utils/appVersion";
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
      // eslint-disable-next-line functional/immutable-data
      this.idTimeout = setTimeout(() => {
        this.setState({
          hasError: false
        });
      }, timeoutErrorMsg);
    });
  };

  public render() {
    return (
      <View style={styles.container}>
        <React.Fragment>
          <Image
            accessibilityIgnoresInvertColors
            style={IOStyles.selfCenter}
            source={require("../../img/icons/update-icon.png")}
          />
          <VSpacer size={40} />
        </React.Fragment>
        <View style={IOStyles.alignCenter}>
          <H2>{I18n.t("wallet.alert.titlePagoPaUpdateApp")}</H2>
        </View>
        <VSpacer size={16} />
        <Body>{I18n.t("wallet.alert.messagePagoPaUpdateApp")}</Body>
        <VSpacer size={16} />
        <ButtonSolid
          label={I18n.t("wallet.alert.btnUpdateApp")}
          fullWidth
          accessibilityLabel={I18n.t("wallet.alert.btnUpdateApp")}
          onPress={this.openAppStore}
        />
        <VSpacer size={16} />
        {this.state.hasError && (
          <React.Fragment>
            <VSpacer size={24} />
            <View style={IOStyles.alignCenter}>
              <H6>{I18n.t("wallet.alert.msgErrorUpdateApp")}</H6>
            </View>
          </React.Fragment>
        )}
      </View>
    );
  }
}

export default RemindUpdatePagoPaVersionOverlay;
