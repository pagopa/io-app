/**
 * An ingress screen to choose the real first screen the user must navigate to.
 */
import * as React from "react";
import { View, StyleSheet, Platform, AccessibilityInfo } from "react-native";
import {
  ContentWrapper,
  H3,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingIndicator } from "../../components/ui/LoadingIndicator";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";

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

type LoadingScreenContentProps = {
  contentTitle: string;
  children?: React.ReactNode;
};

export const LoadingScreenContent = (props: LoadingScreenContentProps) => {
  const { contentTitle, children } = props;

  useOnFirstRender(() => {
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
      {children}
    </SafeAreaView>
  );
};

export default LoadingScreenContent;
