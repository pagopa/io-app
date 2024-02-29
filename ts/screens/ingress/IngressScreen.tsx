/**
 * An ingress screen to choose the real first screen the user must navigate to.
 */
import * as React from "react";
import { View, StyleSheet } from "react-native";
import {
  ContentWrapper,
  H3,
  IOStyles,
  LoadingSpinner,
  VSpacer
} from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import I18n from "../../i18n";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { mixpanelTrack } from "../../mixpanel";
import { buildEventProperties } from "../../utils/analytics";

const styles = StyleSheet.create({
  container: {
    ...IOStyles.bgWhite,
    ...IOStyles.centerJustified,
    ...IOStyles.flex
  }
});

const SPINNER_SIZE = 48;
const SPACE_BETWEEN_SPINNER_AND_TEXT = 24;

export const IngressScreen = () => {
  useOnFirstRender(() => {
    void mixpanelTrack(
      "INITIALIZATION_LOADING",
      buildEventProperties("UX", "screen_view")
    );
  });
  const contentTitle = I18n.t("startup.title");
  return (
    <SafeAreaView style={styles.container}>
      <ContentWrapper>
        <View style={{ alignItems: "center" }}>
          <LoadingSpinner size={SPINNER_SIZE} />
          <VSpacer size={SPACE_BETWEEN_SPINNER_AND_TEXT} />
          <H3 style={{ textAlign: "center" }} accessibilityLabel={contentTitle}>
            {contentTitle}
          </H3>
        </View>
      </ContentWrapper>
    </SafeAreaView>
  );
};
