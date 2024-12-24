import {
  Body,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import I18n from "../../../../i18n";
import { FimsHistoryHeaderComponent } from "./FimsHistoryHeaderComponent";

export const FimsHistoryEmptyContent = () => (
  <View
    style={[
      IOStyles.flex,
      IOStyles.alignCenter,
      IOStyles.horizontalContentPadding
    ]}
  >
    <FimsHistoryHeaderComponent />
    <View style={styles.pictogramContainer}>
      <Pictogram name="empty" />
      <VSpacer size={16} />
      <Body style={{ textAlign: "center" }}>
        {I18n.t("FIMS.history.emptyBody")}
      </Body>
    </View>
  </View>
);

const styles = StyleSheet.create({
  pictogramContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 0.75
  }
});
