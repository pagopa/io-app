import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";

import I18n from "../i18n";
import variables from "../theme/variables";

const styles = StyleSheet.create({
  content: {
    backgroundColor: variables.brandPrimary,
    padding: variables.contentPadding
  }
});

export const ExpiredSessionBanner: React.SFC<{}> = () => (
  <View style={styles.content}>
    <Text white={true} bold={true}>
      {I18n.t("expiredSession.title")}
    </Text>
    <Text white={true}>{I18n.t("expiredSession.message")}</Text>
  </View>
);
