import { Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";

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
    <View spacer={true} />
    <Image
      source={require("../../../img/messages/empty-message-list-icon.png")}
    />
    <Text style={styles.title}>{I18n.t("messages.loadingErrorTitle")}</Text>
  </View>
);
