import {
  Body,
  ContentWrapper,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import I18n from "i18next";
import { FimsHistoryHeaderComponent } from "./FimsHistoryHeaderComponent";

export const FimsHistoryEmptyContent = () => (
  <ContentWrapper
    style={{
      flex: 1,
      alignItems: "center"
    }}
  >
    <FimsHistoryHeaderComponent />
    <View style={styles.pictogramContainer}>
      <Pictogram name="empty" />
      <VSpacer size={16} />
      <Body style={{ textAlign: "center" }}>
        {I18n.t("FIMS.history.emptyBody")}
      </Body>
    </View>
  </ContentWrapper>
);

const styles = StyleSheet.create({
  pictogramContainer: {
    alignItems: "center",
    justifyContent: "center",
    // TODO: check if this is the correct value. Not 100% wrong, but I'm not sure about this approach.
    flexGrow: 0.75
  }
});
