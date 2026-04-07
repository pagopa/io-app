import { Body, H2, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { View } from "react-native";

export const FimsHistoryHeaderComponent = () => (
  <View>
    <H2 accessibilityRole="header">
      {I18n.t("FIMS.history.historyScreen.header")}
    </H2>
    <VSpacer size={16} />
    <Body>{I18n.t("FIMS.history.historyScreen.body")}</Body>
    <VSpacer size={16} />
  </View>
);
