import { VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Body } from "../../../../components/core/typography/Body";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import customVariables from "../../../../theme/variables";

const styles = StyleSheet.create({
  view: {
    padding: customVariables.contentPadding
  }
});

export const ErrorLoadingComponent = () => (
  <View style={[styles.view, IOStyles.alignCenter]}>
    <VSpacer size={16} />
    <Image
      accessibilityIgnoresInvertColors
      source={require("../../../../../img/messages/empty-message-list-icon.png")}
    />
    <VSpacer size={24} />
    <Body>{I18n.t("messages.loadingErrorTitle")}</Body>
  </View>
);
