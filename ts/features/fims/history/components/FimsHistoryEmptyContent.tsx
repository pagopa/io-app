import {
  Body,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import I18n from "../../../../i18n";

export const FimsHistoryEmptyContent = () => (
  <View
    style={[
      IOStyles.alignCenter,
      IOStyles.horizontalContentPadding,
      { paddingVertical: 54 }
    ]}
  >
    <Pictogram name="empty" />
    <VSpacer size={16} />
    <Body style={{ textAlign: "center" }}>
      {I18n.t("FIMS.history.emptyBody")}
    </Body>
  </View>
);
