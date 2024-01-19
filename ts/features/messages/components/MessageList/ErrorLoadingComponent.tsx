import * as React from "react";
import { View, Image, StyleSheet } from "react-native";
import { VSpacer } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import customVariables from "../../../../theme/variables";
import { Body } from "../../../../components/core/typography/Body";
import { IOStyles } from "../../../../components/core/variables/IOStyles";

const styles = StyleSheet.create({
  view: {
    padding: customVariables.contentPadding
  }
});

export const ErrorLoadingComponent = () => (
  <View style={[styles.view, IOStyles.alignCenter]}>
    <VSpacer size={16} />
    <Image
      source={require("../../../../../img/messages/empty-message-list-icon.png")}
    />
    <VSpacer size={24} />
    <Body>{I18n.t("messages.loadingErrorTitle")}</Body>
  </View>
);
