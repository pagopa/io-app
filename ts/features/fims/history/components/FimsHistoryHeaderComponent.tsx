import { Body, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import I18n from "../../../../i18n";

export const FimsHistoryHeaderComponent = () => (
  <View>
    <Body>{I18n.t("FIMS.history.historyScreen.body")}</Body>
    <VSpacer size={16} />
  </View>
);
