/**
 * An ingress screen to choose the real first screen the user must navigate to.
 */
import * as React from "react";
import { View, StyleSheet, AccessibilityInfo } from "react-native";
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
import { trackIngressScreen } from "../profile/analytics";

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
  const contentTitle = I18n.t("startup.title");
  const accessibilityFocusFirstElementRef = React.useRef<View>(null);
  useOnFirstRender(() => {
    trackIngressScreen();
    // Since the screen is shown for a very short time,
    // we prefer to announce the content to the screen reader,
    // instead of focusing the first element.
    AccessibilityInfo.announceForAccessibility(contentTitle);
  });

  return (
    <SafeAreaView style={styles.container}>
      <ContentWrapper>
        <View style={{ alignItems: "center" }}>
          <View
            accessible={false}
            accessibilityElementsHidden={true}
            importantForAccessibility={"no-hide-descendants"}
          >
            <LoadingSpinner size={SPINNER_SIZE} />
          </View>
          <VSpacer size={SPACE_BETWEEN_SPINNER_AND_TEXT} />
          <H3
            ref={accessibilityFocusFirstElementRef}
            style={{ textAlign: "center" }}
            accessibilityLabel={contentTitle}
          >
            {contentTitle}
          </H3>
        </View>
      </ContentWrapper>
    </SafeAreaView>
  );
};
