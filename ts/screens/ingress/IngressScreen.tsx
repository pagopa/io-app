/**
 * An ingress screen to choose the real first screen the user must navigate to.
 */
import * as React from "react";
import { View, StyleSheet, AccessibilityInfo, Platform } from "react-native";
import {
  ContentWrapper,
  H3,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import I18n from "../../i18n";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { trackIngressScreen } from "../profile/analytics";
import { LoadingIndicator } from "../../components/ui/LoadingIndicator";

const styles = StyleSheet.create({
  container: {
    ...IOStyles.bgWhite,
    ...IOStyles.centerJustified,
    ...IOStyles.flex
  },
  contentTitle: {
    textAlign: "center"
  },
  content: {
    alignItems: "center"
  }
});

const SPACE_BETWEEN_SPINNER_AND_TEXT = 24;

export const IngressScreen = () => {
  const contentTitle = I18n.t("startup.title");
  useOnFirstRender(() => {
    trackIngressScreen();
    // Since the screen is shown for a very short time,
    // we prefer to announce the content to the screen reader,
    // instead of focusing the first element.
    if (Platform.OS === "android") {
      // We use it only on Android, because on iOS the screen reader
      // stops reading the content when the ingress screen is unmounted
      // and the focus is moved to another element.
      AccessibilityInfo.announceForAccessibility(contentTitle);
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <ContentWrapper>
        <View style={styles.content}>
          <View
            accessible={false}
            accessibilityElementsHidden={true}
            importantForAccessibility={"no-hide-descendants"}
          >
            <LoadingIndicator />
          </View>
          <VSpacer size={SPACE_BETWEEN_SPINNER_AND_TEXT} />
          <H3 style={styles.contentTitle} accessibilityLabel={contentTitle}>
            {contentTitle}
          </H3>
        </View>
      </ContentWrapper>
    </SafeAreaView>
  );
};
