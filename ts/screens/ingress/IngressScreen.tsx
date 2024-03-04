/**
 * An ingress screen to choose the real first screen the user must navigate to.
 */
import * as React from "react";
import { View, StyleSheet, Platform } from "react-native";
import {
  ContentWrapper,
  H3,
  IOStyles,
  LoadingSpinner,
  VSpacer
} from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "../../i18n";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { setAccessibilityFocus } from "../../utils/accessibility";
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
  const accessibilityFocusFirstElementRef = React.useRef<View>(null);
  useOnFirstRender(() => {
    trackIngressScreen();
  });

  useFocusEffect(() => {
    // We need to set the accessibility focus on the first element of the screen
    // only on iOS, because on Android TalkBack reads the H3 title when the screen is mounted.
    if (Platform.OS === "ios") {
      setAccessibilityFocus(accessibilityFocusFirstElementRef);
    }
  });

  const contentTitle = I18n.t("startup.title");
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
          {/**
           * TalkBack reads the H3 title when the screen is mounted.
           * While VoiceOver does not read the H3 title when the screen is mounted,
           * unless the H3 title is wrapped in a View with the ref and accessible props.
           */}
          <View
            ref={
              Platform.OS === "ios" ? accessibilityFocusFirstElementRef : null
            }
            accessible={true}
          >
            <H3
              ref={accessibilityFocusFirstElementRef}
              style={{ textAlign: "center" }}
              accessibilityLabel={contentTitle}
            >
              {contentTitle}
            </H3>
          </View>
        </View>
      </ContentWrapper>
    </SafeAreaView>
  );
};
