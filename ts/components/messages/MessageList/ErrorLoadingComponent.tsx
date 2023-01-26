import { Text as NBText, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import I18n from "../../../i18n";
import customVariables from "../../../theme/variables";
import { VSpacer } from "../../core/spacer/Spacer";

const styles = StyleSheet.create({
  view: {
    padding: customVariables.contentPadding,
    alignItems: "center"
  },
  title: {
    paddingTop: customVariables.contentPadding
  }
});

export const ErrorLoadingComponent = () => (
  <View style={styles.view}>
    <VSpacer size={16} />
    <Image
      source={require("../../../../img/messages/empty-message-list-icon.png")}
    />
    <NBText style={styles.title}>{I18n.t("messages.loadingErrorTitle")}</NBText>
  </View>
);
